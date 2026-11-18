import { ChangeDetectionStrategy, Component, computed, model, output } from '@angular/core';
import type { SqFormValueControl } from '../../entities/signal-forms-contracts';
import { SliderControl, type SliderRange } from './slider-control';

@Component({
  selector: 'sq-range-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class RangeSliderComponent extends SliderControl implements SqFormValueControl<SliderRange> {
  readonly isRange = true;
  readonly value = model<SliderRange>([0, 100]);
  readonly valueCommitted = output<SliderRange>();
  readonly selection = computed<SliderRange>(() => {
    const lower = this.normalize(this.value()[0]);
    const upper = this.normalize(this.value()[1]);
    return lower <= upper ? [lower, upper] : [upper, lower];
  });

  protected writeSelection(value: SliderRange): void {
    this.value.set(value);
  }

  commit(): void {
    if (!this.isDisabled()) this.valueCommitted.emit(this.selection());
  }
}
