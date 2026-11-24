import { ChangeDetectionStrategy, Component, computed, model, output } from '@angular/core';
import type { SqFormValueControl } from '../../entities/signal-forms-contracts';
import { SliderControl, type SliderRange } from './slider-control';

@Component({
  selector: 'sq-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class SliderComponent extends SliderControl implements SqFormValueControl<number> {
  readonly isRange = false;
  readonly value = model(0);
  /** Emitted once on release or a committed keyboard change. */
  readonly valueCommitted = output<number>();
  readonly selection = computed<SliderRange>(() => [this.minimum(), this.normalize(this.value())]);

  protected writeSelection(value: SliderRange): void {
    this.value.set(value[1]);
  }

  commit(): void {
    if (!this.isDisabled()) this.valueCommitted.emit(this.selection()[1]);
  }
}
