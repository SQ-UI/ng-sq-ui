import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute, ComponentRef, Directive, ElementRef, inject, input,
  OnChanges, OnDestroy, PLATFORM_ID, Renderer2, ViewContainerRef,
} from '@angular/core';
import { TooltipComponent } from '../components/tooltip/tooltip.component';
import { positionTooltip, TOOLTIP_VIEWPORT_MARGIN } from '../components/tooltip/tooltip-position';
import type { TooltipPosition } from '../interfaces/tooltip-position';

let nextTooltipId = 0;

@Directive({
  selector: '[sqTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TooltipDirective implements OnChanges, OnDestroy {
  readonly sqTooltip = input<string | null | undefined>('');
  readonly sqTooltipPosition = input<TooltipPosition>('top');
  readonly sqTooltipDisabled = input(false, { transform: booleanAttribute });

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly container = inject(ViewContainerRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly id = `sq-tooltip-${++nextTooltipId}`;
  private view?: ComponentRef<TooltipComponent>;
  private listeners: (() => void)[] = [];
  private observer?: ResizeObserver;
  private visibilityObserver?: IntersectionObserver;
  private themeObserver?: MutationObserver;
  private readonly themeProperties = new Set<string>();
  private focusedElement?: HTMLElement;
  private describedElement?: HTMLElement;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private hovered = false;
  private focused = false;
  private tooltipHovered = false;
  private dismissed = false;

  ngOnChanges(): void {
    if (this.sqTooltipDisabled() || !this.sqTooltip()?.trim()) {
      this.hide();
    } else if (this.view || this.hovered || this.focused) {
      this.show();
    }
  }

  onMouseEnter(): void {
    this.hovered = true;
    this.dismissed = false;
    this.show();
  }

  onMouseLeave(): void {
    this.hovered = false;
    this.scheduleHide();
  }

  onFocusIn(event: FocusEvent): void {
    this.focused = true;
    this.focusedElement = event.target instanceof HTMLElement ? event.target : this.host;
    this.dismissed = false;
    this.show();
  }

  onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && this.host.contains(event.relatedTarget)) return;
    this.focused = false;
    this.focusedElement = undefined;
    if (!this.hovered && !this.tooltipHovered) this.hide();
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private show(): void {
    const win = this.document.defaultView;
    if (!this.isBrowser || !win || this.dismissed || this.sqTooltipDisabled() || !this.sqTooltip()?.trim()) return;
    clearTimeout(this.hideTimer);

    if (!this.view) {
      this.view = this.container.createComponent(TooltipComponent);
      const element = this.view.location.nativeElement as HTMLElement;
      this.renderer.setAttribute(element, 'id', this.id);
      this.renderer.appendChild(this.document.body, element);
      this.listen(win, 'resize', this.updatePosition);
      // Capture catches scrolls from nested containers as well as the page itself.
      this.document.addEventListener('scroll', this.updatePosition, true);
      this.listeners.push(() => this.document.removeEventListener('scroll', this.updatePosition, true));
      // Capture consumes Escape before a surrounding modal handles it in the bubble phase.
      this.document.addEventListener('keydown', this.onEscape, true);
      this.listeners.push(() => this.document.removeEventListener('keydown', this.onEscape, true));
      this.listen(element, 'mouseenter', () => {
        this.tooltipHovered = true;
        clearTimeout(this.hideTimer);
      });
      this.listen(element, 'mouseleave', () => {
        this.tooltipHovered = false;
        this.scheduleHide();
      });
      if (win.visualViewport) {
        this.listen(win.visualViewport, 'resize', this.updatePosition);
        this.listen(win.visualViewport, 'scroll', this.updatePosition);
      }
      if (typeof ResizeObserver !== 'undefined') {
        this.observer = new ResizeObserver(this.updatePosition);
        this.observer.observe(this.host);
        this.observer.observe(element);
      }
      if (typeof IntersectionObserver !== 'undefined') {
        // Browser intersection checks include nested overflow clipping and transformed ancestors.
        const view = this.view;
        this.visibilityObserver = new IntersectionObserver(entries => {
          if (this.view === view && entries.some(entry => !entry.isIntersecting || entry.intersectionRatio === 0)) this.hide();
        });
        this.visibilityObserver.observe(this.host);
      }
      this.observeTheme();
    }

    this.describe(this.focusedElement ?? this.describedElement ?? this.host);
    this.view.setInput('text', this.sqTooltip());
    this.view.changeDetectorRef.detectChanges();
    this.updatePosition();
  }

  private readonly onEscape = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.dismissed = true;
    this.hide();
  };

  private describe(element: HTMLElement): void {
    if (this.describedElement === element) return;
    this.removeDescription();
    this.describedElement = element;
    const ids = element.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? [];
    this.renderer.setAttribute(element, 'aria-describedby', [...new Set([...ids, this.id])].join(' '));
  }

  private removeDescription(): void {
    const element = this.describedElement;
    if (!element) return;
    const ids = element.getAttribute('aria-describedby')?.split(/\s+/).filter(id => id && id !== this.id);
    if (ids?.length) {
      this.renderer.setAttribute(element, 'aria-describedby', ids.join(' '));
    } else {
      this.renderer.removeAttribute(element, 'aria-describedby');
    }
    this.describedElement = undefined;
  }

  private observeTheme(): void {
    if (typeof MutationObserver !== 'undefined') {
      this.themeObserver = new MutationObserver(this.updatePosition);
      // Theme selectors can use class, style, data-theme or other attributes on any ancestor.
      for (let ancestor: HTMLElement | null = this.host; ancestor; ancestor = ancestor.parentElement) {
        this.themeObserver.observe(ancestor, { attributes: true });
      }
      this.themeObserver.observe(this.document.head, { subtree: true, childList: true, characterData: true, attributes: true });
    }
    const colorScheme = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    if (colorScheme) this.listen(colorScheme, 'change', this.updatePosition);
    this.document.addEventListener('load', this.updatePosition, true);
    this.listeners.push(() => this.document.removeEventListener('load', this.updatePosition, true));
  }

  private syncTheme(element: HTMLElement, styles: CSSStyleDeclaration): void {
    const previous = new Set(this.themeProperties);
    this.themeProperties.clear();
    for (let index = 0; index < styles.length; index++) {
      const name = styles.item(index);
      if (!name.startsWith('--sq-')) continue;
      element.style.setProperty(name, styles.getPropertyValue(name));
      this.themeProperties.add(name);
      previous.delete(name);
    }
    previous.forEach(name => element.style.removeProperty(name));
  }

  private readonly updatePosition = (): void => {
    const win = this.document.defaultView;
    if (!this.view || !win) return;
    const visual = win.visualViewport;
    const viewport = {
      left: visual?.offsetLeft ?? 0,
      top: visual?.offsetTop ?? 0,
      width: visual?.width ?? (this.document.documentElement.clientWidth || win.innerWidth),
      height: visual?.height ?? (this.document.documentElement.clientHeight || win.innerHeight),
    };
    const anchor = this.host.getBoundingClientRect();
    if (anchor.bottom < viewport.top || anchor.top > viewport.top + viewport.height ||
        anchor.right < viewport.left || anchor.left > viewport.left + viewport.width) {
      this.hide();
      return;
    }
    const element = this.view.location.nativeElement as HTMLElement;
    this.syncTheme(element, win.getComputedStyle(this.host));
    element.style.maxWidth = `${Math.max(0, Math.min(320, viewport.width - TOOLTIP_VIEWPORT_MARGIN * 2))}px`;
    element.style.maxHeight = `${Math.max(0, viewport.height - TOOLTIP_VIEWPORT_MARGIN * 2)}px`;
    const result = positionTooltip(anchor, element.getBoundingClientRect(), viewport, this.sqTooltipPosition());
    element.style.left = `${result.left}px`;
    element.style.top = `${result.top}px`;
    element.style.visibility = 'visible';
    this.renderer.setAttribute(element, 'data-position', result.position);
  };

  private scheduleHide(): void {
    clearTimeout(this.hideTimer);
    // Allow the pointer to cross the gap to the tooltip without dismissing it.
    this.hideTimer = setTimeout(() => {
      if (!this.hovered && !this.focused && !this.tooltipHovered) this.hide();
    }, 100);
  }

  private hide(): void {
    clearTimeout(this.hideTimer);
    this.listeners.forEach(unlisten => unlisten());
    this.listeners = [];
    this.observer?.disconnect();
    this.observer = undefined;
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;
    this.themeObserver?.disconnect();
    this.themeObserver = undefined;
    this.themeProperties.clear();
    this.tooltipHovered = false;
    this.view?.destroy();
    this.view = undefined;
    this.removeDescription();
  }

  private listen<TEvent extends Event>(
    target: Parameters<Renderer2['listen']>[0], event: string, callback: (event: TEvent) => void,
  ): void {
    this.listeners.push(this.renderer.listen(target, event, callback));
  }
}
