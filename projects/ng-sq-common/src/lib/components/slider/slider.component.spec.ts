import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, disabled, form } from '@angular/forms/signals';
import { SliderComponent } from './slider.component';
import { RangeSliderComponent } from './range-slider.component';
import type { SliderRange } from './slider-control';

@Component({
  imports: [SliderComponent, RangeSliderComponent],
  template: `
    <sq-slider controlLabel="Volume" [(value)]="volume" [minValue]="min()" [maxValue]="max()" [step]="step()"
      [disabled]="locked()" [showValue]="showValues()" (valueCommitted)="committed.push($event)" (touch)="touches = touches + 1" />
    <sq-range-slider controlLabel="Budget" [(value)]="budget" [disabled]="locked()" [showValue]="showValues()"
      (valueCommitted)="committedRanges.push($event)" (touch)="rangeTouches = rangeTouches + 1" />
    <button type="button">Outside</button>
  `,
})
class SliderHost {
  readonly volume = signal(35);
  readonly budget = signal<SliderRange>([20, 80]);
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly locked = signal(false);
  readonly showValues = signal(true);
  committed: number[] = [];
  committedRanges: SliderRange[] = [];
  touches = 0;
  rangeTouches = 0;
}

@Component({
  imports: [SliderComponent, RangeSliderComponent, FormField],
  template: `
    <sq-slider controlLabel="Volume" [formField]="settingsForm.volume" />
    <sq-range-slider controlLabel="Budget" [formField]="settingsForm.budget" />
  `,
})
class SliderFormsHost {
  readonly locked = signal(false);
  readonly settings = signal<{ volume: number; budget: SliderRange }>({ volume: 25, budget: [10, 90] });
  readonly settingsForm = form(this.settings, path => {
    disabled(path.volume, () => this.locked());
    disabled(path.budget, () => this.locked());
  });
}

describe('Slider controls', () => {
  async function createHost() {
    const fixture = TestBed.createComponent(SliderHost);
    await fixture.whenStable();
    return fixture;
  }

  function inputValue(input: HTMLInputElement, value: number): void {
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  it('renders unique labelled native range inputs and tracks external model replacements', async () => {
    const fixture = await createHost();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect([...inputs].map(input => input.value)).toEqual(['35', '20', '80']);
    expect(new Set([...inputs].map(input => input.id)).size).toBe(3);
    expect(inputs[0].type).toBe('range');
    expect(inputs[0].getAttribute('aria-label')).toBe('Volume');
    expect(inputs[1].getAttribute('aria-label')).toBe('Budget: Minimum');
    expect(inputs[2].getAttribute('aria-label')).toBe('Budget: Maximum');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(inputs[0].id);
    fixture.componentInstance.volume.set(60);
    fixture.componentInstance.budget.set([30, 70]);
    await fixture.whenStable();
    expect([...inputs].map(input => input.value)).toEqual(['60', '30', '70']);
    expect(fixture.componentInstance.committed).toEqual([]);
  });

  it('updates the two-way value immediately and commits only on native change', async () => {
    const fixture = await createHost();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('sq-slider input');
    inputValue(input, 56);
    await fixture.whenStable();
    expect(fixture.componentInstance.volume()).toBe(56);
    expect(fixture.componentInstance.committed).toEqual([]);
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.committed).toEqual([56]);
    expect(parseFloat(fixture.nativeElement.querySelector('.slider-fill').style.right)).toBeCloseTo(44);
  });

  it('uses the inherited showValue input in both templates without hiding accessible values', async () => {
    const fixture = await createHost();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('.slider-value')).toHaveLength(2);

    fixture.componentInstance.showValues.set(false);
    await fixture.whenStable();
    expect(root.querySelectorAll('.slider-value')).toHaveLength(0);
    expect([...root.querySelectorAll('input')].map(input => input.getAttribute('aria-valuetext')))
      .toEqual(['35', '20', '80']);

    fixture.componentInstance.volume.set(60);
    fixture.componentInstance.budget.set([25, 75]);
    fixture.componentInstance.showValues.set(true);
    await fixture.whenStable();
    const values = root.querySelectorAll('.slider-value');
    expect(values).toHaveLength(2);
    expect(values[0].textContent).toContain('60');
    expect(values[1].textContent?.replace(/\s+/g, ' ').trim()).toBe('25 – 75');
  });

  it('supports decimal steps anchored to a negative minimum without floating point noise', async () => {
    const fixture = await createHost();
    const host = fixture.componentInstance;
    host.min.set(-1);
    host.max.set(1);
    host.step.set(0.05);
    host.volume.set(0.34);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('sq-slider input');
    expect(input.value).toBe('0.35');
    expect(host.volume()).toBe(0.34); // Rendering never rewrites the caller's model.
    inputValue(input, 0.45);
    expect(host.volume()).toBe(0.45);
  });

  it('clamps values to reachable steps and follows changes to the bounds', async () => {
    const fixture = await createHost();
    const host = fixture.componentInstance;
    host.min.set(10);
    host.max.set(95);
    host.step.set(20);
    host.volume.set(100);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('sq-slider input');
    expect(input.value).toBe('90');
    host.max.set(50);
    await fixture.whenStable();
    expect(input.value).toBe('50');
    host.volume.set(-30);
    await fixture.whenStable();
    expect(input.value).toBe('10');
  });

  it('handles invalid configuration and fixed bounds without NaN or interactive controls', async () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('minValue', NaN);
    fixture.componentRef.setInput('maxValue', Infinity);
    fixture.componentRef.setInput('step', 0);
    fixture.componentRef.setInput('value', NaN);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect([input.min, input.max, input.step, input.value]).toEqual(['0', '100', '1', '0']);
    fixture.componentRef.setInput('minValue', 30);
    fixture.componentRef.setInput('maxValue', 10);
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('30');
    expect(fixture.nativeElement.innerHTML).not.toContain('NaN');
  });

  it('formats values, bounds and accessible value text and connects error/helper descriptions', async () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('value', 40);
    fixture.componentRef.setInput('formatValue', (value: number) => `${value} GB`);
    fixture.componentRef.setInput('helpText', 'Choose storage');
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-valuetext')).toBe('40 GB');
    expect(fixture.nativeElement.querySelector('.slider-value').textContent).toContain('40 GB');
    expect(fixture.nativeElement.querySelector('.slider-bounds').textContent).toContain('100 GB');
    const description = fixture.nativeElement.querySelector('.slider-description');
    expect(input.getAttribute('aria-describedby')).toBe(description.id);
    fixture.componentRef.setInput('errorText', 'Too much storage');
    await fixture.whenStable();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(description.textContent).toBe('Too much storage');
    fixture.componentRef.setInput('errorText', '');
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(description.textContent).toBe('Choose storage');
  });

  it('renders discrete ticks and caps them for fine-grained scales', async () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('minValue', 1);
    fixture.componentRef.setInput('maxValue', 5);
    fixture.componentRef.setInput('showTicks', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.slider-tick')).toHaveLength(5);
    fixture.componentRef.setInput('minValue', 0);
    fixture.componentRef.setInput('maxValue', 0.3);
    fixture.componentRef.setInput('step', 0.1);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.slider-tick')).toHaveLength(4);
    fixture.componentRef.setInput('step', 0.001);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.slider-tick')).toHaveLength(0);
  });

  it('keeps range handles ordered and restores native input values when a handle would cross', async () => {
    const fixture = await createHost();
    const inputs = fixture.nativeElement.querySelectorAll('sq-range-slider input') as NodeListOf<HTMLInputElement>;
    inputValue(inputs[0], 95);
    await fixture.whenStable();
    expect(fixture.componentInstance.budget()).toEqual([80, 80]);
    expect(inputs[0].value).toBe('80');
    inputValue(inputs[1], 10);
    await fixture.whenStable();
    expect(fixture.componentInstance.budget()).toEqual([80, 80]);
    expect(inputs[1].value).toBe('80');
    expect(inputs[0].getAttribute('aria-valuemax')).toBe('80');
    expect(inputs[1].getAttribute('aria-valuemin')).toBe('80');
  });

  it('displays an ordered and clamped external range without changing the supplied tuple', async () => {
    const fixture = await createHost();
    fixture.componentInstance.budget.set([130, -10]);
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('sq-range-slider input') as NodeListOf<HTMLInputElement>;
    expect([...inputs].map(input => input.value)).toEqual(['0', '100']);
    expect(fixture.componentInstance.budget()).toEqual([130, -10]);
  });

  it('ignores input and commit events while disabled', async () => {
    const fixture = await createHost();
    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    for (const input of inputs) {
      expect(input.disabled).toBe(true);
      inputValue(input, 50);
      input.dispatchEvent(new Event('change'));
    }
    expect(fixture.componentInstance.volume()).toBe(35);
    expect(fixture.componentInstance.budget()).toEqual([20, 80]);
    expect(fixture.componentInstance.committed).toEqual([]);
    expect(fixture.componentInstance.committedRanges).toEqual([]);
  });

  it('marks a range touched only when focus leaves both handles', async () => {
    const fixture = await createHost();
    const inputs = fixture.nativeElement.querySelectorAll('sq-range-slider input') as NodeListOf<HTMLInputElement>;
    inputs[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: inputs[1] }));
    expect(fixture.componentInstance.rangeTouches).toBe(0);
    inputs[1].dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: fixture.nativeElement.querySelector('button') }));
    expect(fixture.componentInstance.rangeTouches).toBe(1);
  });

  it('supports track dragging, pointer capture and a single commit on release', async () => {
    const fixture = await createHost();
    const control: HTMLElement = fixture.nativeElement.querySelector('sq-range-slider .slider-control');
    const rail: HTMLElement = control.querySelector('.slider-rail')!;
    control.setPointerCapture = vi.fn();
    vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 100 } as DOMRect);
    const pointer = (type: string, x: number, pointerId = 1) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, button: 0 });
      Object.defineProperties(event, { pointerId: { value: pointerId }, isPrimary: { value: true } });
      control.dispatchEvent(event);
    };
    pointer('pointerdown', 15);
    expect(control.setPointerCapture).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.budget()).toEqual([15, 80]);
    pointer('pointermove', 40, 2); // Another pointer cannot move this drag.
    expect(fixture.componentInstance.budget()).toEqual([15, 80]);
    pointer('pointermove', 30);
    expect(fixture.componentInstance.budget()).toEqual([30, 80]);
    expect(fixture.componentInstance.committedRanges).toEqual([]);
    pointer('pointerup', 30);
    pointer('lostpointercapture', 30);
    expect(fixture.componentInstance.committedRanges).toEqual([[30, 80]]);
    pointer('pointerdown', 90);
    pointer('pointercancel', 90);
    expect(fixture.componentInstance.committedRanges).toEqual([[30, 80]]);
  });

  it('previews single-value dragging and commits once on release', async () => {
    const fixture = await createHost();
    const control: HTMLElement = fixture.nativeElement.querySelector('sq-slider .slider-control');
    const rail: HTMLElement = control.querySelector('.slider-rail')!;
    control.setPointerCapture = vi.fn();
    vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 100 } as DOMRect);
    for (const [type, x] of [['pointerdown', 35], ['pointermove', 75]] as const) {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, button: 0 });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      control.dispatchEvent(event);
    }
    expect(fixture.componentInstance.volume()).toBe(75);
    expect(fixture.componentInstance.committed).toEqual([]);
    const release = new MouseEvent('pointerup', { bubbles: true });
    Object.defineProperty(release, 'pointerId', { value: 1 });
    control.dispatchEvent(release);
    expect(fixture.componentInstance.committed).toEqual([75]);
  });

  it('binds both typed controls to Signal Forms, including model changes, touch and disabled state', async () => {
    const fixture = TestBed.createComponent(SliderFormsHost);
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect([...inputs].map(input => input.value)).toEqual(['25', '10', '90']);
    inputValue(inputs[0], 55);
    inputValue(inputs[1], 30);
    await fixture.whenStable();
    expect(fixture.componentInstance.settings()).toEqual({ volume: 55, budget: [30, 90] });
    inputs[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    inputs[1].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.settingsForm.volume().touched()).toBe(true);
    expect(fixture.componentInstance.settingsForm.budget().touched()).toBe(true);
    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    expect([...inputs].every(input => input.disabled)).toBe(true);
  });
});
