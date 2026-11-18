import { computed, Directive, ElementRef, inject, input, output, type Signal } from '@angular/core';
import { FORM_FIELD_DEFAULTS, generateFormFieldId, type SqFormFieldSignals } from '../../entities/form-field-signals';
import type { Size } from '../../interfaces/sizes';

/** Inclusive lower and upper values. */
export type SliderRange = readonly [number, number];

/**
 * Shared presentation and interaction for the two typed slider controls.
 * Template-only inputs are consumed by slider.component.html on the concrete subclasses;
 * Fallow does not associate that template with this base directive.
 */
@Directive()
export abstract class SliderControl implements SqFormFieldSignals {
  // fallow-ignore-next-line unused-component-input
  readonly name = input(generateFormFieldId());
  readonly controlId = input(generateFormFieldId());
  readonly controlLabel = input(FORM_FIELD_DEFAULTS.controlLabel);
  readonly controlPlaceholder = input(FORM_FIELD_DEFAULTS.controlPlaceholder);
  readonly required = input(FORM_FIELD_DEFAULTS.required);
  readonly pattern = input<readonly RegExp[]>(FORM_FIELD_DEFAULTS.pattern);
  readonly disabled = input(FORM_FIELD_DEFAULTS.disabled);
  readonly touch = output<void>();

  readonly minValue = input(0);
  readonly maxValue = input(100);
  readonly step = input(1);
  // fallow-ignore-next-line unused-component-input
  readonly size = input<Size>('medium');
  readonly ariaLabel = input('Slider');
  readonly lowerLabel = input('Minimum');
  readonly upperLabel = input('Maximum');
  readonly helpText = input('');
  readonly errorText = input('');
  // fallow-ignore-next-line unused-component-input
  readonly showValue = input(true);
  // fallow-ignore-next-line unused-component-input
  readonly showBounds = input(true);
  readonly showTicks = input(false);
  // fallow-ignore-next-line unused-component-input
  readonly formatValue = input<(value: number) => string>(String);

  abstract readonly isRange: boolean;
  abstract readonly selection: Signal<SliderRange>;
  protected abstract writeSelection(value: SliderRange): void;
  abstract commit(): void;

  readonly minimum = computed(() => Number.isFinite(this.minValue()) ? this.minValue() : 0);
  readonly maximum = computed(() => Number.isFinite(this.maxValue()) ? Math.max(this.minimum(), this.maxValue()) : Math.max(this.minimum(), 100));
  readonly increment = computed(() => Number.isFinite(this.step()) && this.step() > 0 ? this.step() : 1);
  readonly isDisabled = computed(() => this.disabled() || this.minimum() === this.maximum());
  readonly thumbs = computed(() => this.isRange ? [0, 1] : [0]);
  readonly descriptionId = computed(() => this.helpText() || this.errorText() ? `${this.controlId()}-description` : null);
  readonly ticks = computed(() => {
    const count = Math.floor((this.maximum() - this.minimum()) / this.increment() + 1e-10);
    // Keep fine-grained sliders readable and avoid an unbounded DOM allocation.
    return this.showTicks() && Number.isFinite(count) && count > 0 && count <= 100
      ? Array.from({ length: count + 1 }, (_, index) => this.percent(this.minimum() + index * this.increment())) : [];
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private drag?: { pointerId: number; index: number; rail: HTMLElement };

  protected normalize(value: number): number {
    const min = this.minimum();
    const max = this.maximum();
    const step = this.increment();
    const finiteValue = Number.isFinite(value) ? value : min;
    const lastStep = Math.floor((max - min) / step + 1e-10);
    const index = Math.max(0, Math.min(lastStep, Math.round((finiteValue - min) / step)));
    return Math.min(max, Math.max(min, Number((min + index * step).toPrecision(12))));
  }

  percent(value: number): number {
    const span = this.maximum() - this.minimum();
    return span > 0 ? (value - this.minimum()) / span * 100 : 0;
  }

  thumbValue(index: number): number {
    return this.selection()[this.isRange ? index : 1];
  }

  thumbLabel(index: number): string {
    const label = this.controlLabel() || this.ariaLabel();
    return this.isRange ? `${label}: ${index === 0 ? this.lowerLabel() : this.upperLabel()}` : label;
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    this.setThumb(input.valueAsNumber, index);
    // Restore the native thumb too when a range handle tries to cross its neighbour.
    input.value = String(this.thumbValue(index));
  }

  private setThumb(value: number, index: number): void {
    if (this.isDisabled()) return;
    const [lower, upper] = this.selection();
    const next = this.normalize(value);
    this.writeSelection(this.isRange
      ? index === 0 ? [Math.min(next, upper), upper] : [lower, Math.max(next, lower)]
      : [this.minimum(), next]);
  }

  startDrag(event: PointerEvent, rail: HTMLElement): void {
    if (this.isDisabled() || event.button !== 0 || event.isPrimary === false) return;
    const bounds = rail.getBoundingClientRect();
    if (bounds.width <= 0) return;
    const target = event.target as HTMLElement;
    const value = this.pointerValue(event, rail);
    const [lower, upper] = this.selection();
    // A coincident pair can always be separated in either direction.
    let index = 0;
    if (this.isRange) {
      index = target instanceof HTMLInputElement ? Number(target.dataset['thumb'])
        : value < lower + (upper - lower) / 2 ? 0 : 1;
    }
    event.preventDefault();
    this.host.nativeElement.querySelector<HTMLInputElement>(`input[data-thumb="${index}"]`)?.focus();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag = { pointerId: event.pointerId, index, rail };
    this.setThumb(value, index);
  }

  moveDrag(event: PointerEvent): void {
    if (this.drag?.pointerId === event.pointerId) {
      this.setThumb(this.pointerValue(event, this.drag.rail), this.drag.index);
    }
  }

  endDrag(event: PointerEvent): void {
    if (this.drag?.pointerId !== event.pointerId) return;
    this.drag = undefined;
    if (event.type === 'pointerup' && !this.isDisabled()) this.commit();
  }

  onFocusOut(event: FocusEvent): void {
    if (!event.relatedTarget || !this.host.nativeElement.contains(event.relatedTarget as Node)) this.touch.emit();
  }

  private pointerValue(event: PointerEvent, rail: HTMLElement): number {
    const bounds = rail.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    return this.minimum() + ratio * (this.maximum() - this.minimum());
  }
}
