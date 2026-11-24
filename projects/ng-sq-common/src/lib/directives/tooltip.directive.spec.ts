import { Component, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipDirective } from './tooltip.directive';
import type { TooltipPosition } from '../interfaces/tooltip-position';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<button [sqTooltip]="text()" [sqTooltipPosition]="position()"
    [sqTooltipDisabled]="disabled()" aria-describedby="existing-description">Save</button>
    <span id="existing-description">Existing help</span>`,
})
class TooltipHost {
  readonly text = signal<string | null | undefined>('Save your changes');
  readonly position = signal<TooltipPosition>('top');
  readonly disabled = signal(false);
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TooltipHost>;
  let button: HTMLButtonElement;
  const tooltip = () => document.body.querySelector<HTMLElement>('[role="tooltip"]');
  const dispatch = (name: string) => button.dispatchEvent(new Event(name));

  beforeEach(() => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 100, right: 140, top: 100, bottom: 124, width: 40, height: 24,
    } as DOMRect);
  });

  afterEach(() => {
    fixture.destroy();
    expect(tooltip()).toBeNull();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders text under body on hover and preserves existing accessible descriptions', () => {
    expect(tooltip()).toBeNull();
    dispatch('mouseenter');
    expect(tooltip()?.parentElement).toBe(document.body);
    expect(tooltip()?.textContent).toBe('Save your changes');
    expect(button.getAttribute('aria-describedby')?.split(' ')).toEqual(['existing-description', tooltip()?.id]);
    dispatch('mouseleave');
    vi.advanceTimersByTime(100);
    expect(tooltip()).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBe('existing-description');
  });

  it('supports keyboard focus and Escape without immediately reopening on input changes', () => {
    dispatch('focusin');
    expect(tooltip()).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(tooltip()).toBeNull();
    fixture.componentInstance.text.set('Updated description');
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
    dispatch('focusout');
    dispatch('focusin');
    expect(tooltip()?.textContent).toBe('Updated description');
    dispatch('focusout');
    expect(tooltip()).toBeNull();
  });

  it('stays open while the trigger has keyboard focus after the mouse leaves', () => {
    dispatch('mouseenter');
    dispatch('focusin');
    dispatch('mouseleave');
    vi.advanceTimersByTime(100);
    expect(tooltip()).not.toBeNull();
    dispatch('focusout');
    expect(tooltip()).toBeNull();
  });

  it('consumes Escape once before surrounding document handlers run', () => {
    const surroundingHandler = vi.fn();
    document.addEventListener('keydown', surroundingHandler);
    try {
      dispatch('focusin');
      const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      button.dispatchEvent(escape);
      expect(escape.defaultPrevented).toBe(true);
      expect(surroundingHandler).not.toHaveBeenCalled();
      expect(tooltip()).toBeNull();
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(surroundingHandler).toHaveBeenCalledOnce();
    } finally {
      document.removeEventListener('keydown', surroundingHandler);
    }
  });

  it('refreshes inherited theme properties and removes obsolete copies while open', async () => {
    let properties: Record<string, string> = { '--sq-tooltip-background': 'red', '--sq-radius-control': '4px' };
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      length: Object.keys(properties).length,
      item: (index: number) => Object.keys(properties)[index],
      getPropertyValue: (name: string) => properties[name] ?? '',
    }) as CSSStyleDeclaration);
    dispatch('mouseenter');
    const element = tooltip()!;
    expect(element.style.getPropertyValue('--sq-tooltip-background')).toBe('red');

    properties = { '--sq-tooltip-background': 'blue', '--sq-font-size-tooltip': '16px' };
    fixture.nativeElement.setAttribute('data-theme', 'updated');
    await Promise.resolve();
    expect(tooltip()).toBe(element);
    expect(element.style.getPropertyValue('--sq-tooltip-background')).toBe('blue');
    expect(element.style.getPropertyValue('--sq-font-size-tooltip')).toBe('16px');
    expect(element.style.getPropertyValue('--sq-radius-control')).toBe('');
  });

  it('dismisses when an ancestor fully clips the trigger, while retaining partial visibility', () => {
    let notify!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = vi.fn();
      disconnect = disconnect;
    });
    dispatch('focusin');
    notify([{ isIntersecting: true, intersectionRatio: 0.5 } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(tooltip()).not.toBeNull();
    notify([{ isIntersecting: false, intersectionRatio: 0 } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(tooltip()).toBeNull();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(button.getAttribute('aria-describedby')).toBe('existing-description');
  });

  it('lets the pointer cross the gap and hover the tooltip', () => {
    dispatch('mouseenter');
    const element = tooltip()!;
    dispatch('mouseleave');
    element.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(100);
    expect(tooltip()).toBe(element);
    fixture.componentInstance.text.set('Updated while hovering the tooltip');
    fixture.detectChanges();
    expect(tooltip()?.textContent).toBe('Updated while hovering the tooltip');
    element.dispatchEvent(new Event('mouseleave'));
    vi.advanceTimersByTime(100);
    expect(tooltip()).toBeNull();
  });

  it.each(['', '   ', null, undefined])('does not render empty content (%s)', value => {
    fixture.componentInstance.text.set(value);
    fixture.detectChanges();
    dispatch('mouseenter');
    expect(tooltip()).toBeNull();
  });

  it('updates visible content as plain text and reacts to disabled and empty inputs', () => {
    dispatch('mouseenter');
    fixture.componentInstance.text.set('<img src=x onerror=alert(1)>');
    fixture.detectChanges();
    expect(tooltip()?.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(tooltip()?.querySelector('img')).toBeNull();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();
    fixture.componentInstance.text.set('');
    fixture.detectChanges();
    expect(tooltip()).toBeNull();
  });

  it('does not open when disabled', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    dispatch('mouseenter');
    dispatch('focusin');
    expect(tooltip()).toBeNull();
  });

  it('repositions on nested scrolling, window resize and preferred position changes', () => {
    dispatch('mouseenter');
    const element = tooltip()!;
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ width: 120, height: 40 } as DOMRect);
    document.dispatchEvent(new Event('scroll'));
    expect(element.style.top).toBe('52px');
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 0, right: 40, top: 0, bottom: 24, width: 40, height: 24,
    } as DOMRect);
    const scroller = document.createElement('div');
    document.body.appendChild(scroller);
    scroller.dispatchEvent(new Event('scroll', { bubbles: false }));
    scroller.remove();
    expect(element.dataset['position']).toBe('bottom');
    expect(element.style.left).toBe('8px');
    expect(element.style.top).toBe('32px');
    fixture.componentInstance.position.set('right');
    fixture.detectChanges();
    expect(element.dataset['position']).toBe('right');
    window.dispatchEvent(new Event('resize'));
    expect(element.style.left).toBe('48px');
  });

  it('uses the visible viewport to constrain size and position', () => {
    const visual = new EventTarget();
    Object.assign(visual, { offsetLeft: 20, offsetTop: 30, width: 200, height: 150 });
    vi.stubGlobal('visualViewport', visual);
    dispatch('mouseenter');
    expect(tooltip()?.style.maxWidth).toBe('184px');
    expect(tooltip()?.style.maxHeight).toBe('134px');
    Object.assign(visual, { width: 160, height: 100 });
    visual.dispatchEvent(new Event('resize'));
    expect(tooltip()?.style.maxWidth).toBe('144px');
    expect(tooltip()?.style.maxHeight).toBe('84px');
  });

  it('removes the tooltip when the trigger leaves the viewport', () => {
    dispatch('mouseenter');
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 100, right: 140, top: -50, bottom: -26, width: 40, height: 24,
    } as DOMRect);
    document.dispatchEvent(new Event('scroll'));
    expect(tooltip()).toBeNull();
  });

  it('disconnects observers, listeners, pending timers and aria references on destruction', () => {
    const disconnect = vi.fn();
    const observe = vi.fn();
    vi.stubGlobal('ResizeObserver', class { observe = observe; disconnect = disconnect; });
    const disconnectTheme = vi.fn();
    const disconnectVisibility = vi.fn();
    vi.stubGlobal('MutationObserver', class { observe = vi.fn(); disconnect = disconnectTheme; });
    vi.stubGlobal('IntersectionObserver', class { observe = vi.fn(); disconnect = disconnectVisibility; });
    const removeListener = vi.spyOn(document, 'removeEventListener');
    dispatch('mouseenter');
    const element = tooltip()!;
    expect(observe).toHaveBeenCalledWith(button);
    expect(observe).toHaveBeenCalledWith(element);
    dispatch('mouseleave');
    fixture.destroy();
    vi.advanceTimersByTime(100);
    expect(tooltip()).toBeNull();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(disconnectTheme).toHaveBeenCalledOnce();
    expect(disconnectVisibility).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeListener).toHaveBeenCalledWith('keydown', expect.any(Function), true);
    expect(button.getAttribute('aria-describedby')).toBe('existing-description');
  });
});

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<div sqTooltip="Shared help" aria-describedby="group-help">
    <button aria-describedby="first-help">First</button>
    <button aria-describedby="second-help">Second</button>
  </div>`,
})
class TooltipGroupHost {}

describe('TooltipDirective on a container', () => {
  it('moves its description between focused descendants and preserves other descriptions', () => {
    const fixture = TestBed.createComponent(TooltipGroupHost);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('div') as HTMLElement;
    const [first, second] = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    first.focus();
    const element = document.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(first.getAttribute('aria-describedby')).toBe(`first-help ${element.id}`);
    expect(group.getAttribute('aria-describedby')).toBe('group-help');
    second.focus();
    expect(first.getAttribute('aria-describedby')).toBe('first-help');
    expect(second.getAttribute('aria-describedby')).toBe(`second-help ${element.id}`);
    second.blur();
    expect(second.getAttribute('aria-describedby')).toBe('second-help');
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    fixture.destroy();
  });
});

describe('TooltipDirective on the server', () => {
  it('does not create a browser overlay', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').dispatchEvent(new Event('mouseenter'));
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
    fixture.destroy();
  });
});
