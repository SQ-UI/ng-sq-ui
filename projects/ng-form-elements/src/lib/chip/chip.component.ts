import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ChipSize = 's' | 'm' | 'l';

/** A standalone label pill. The consumer handles removal when `removed` fires. */
@Component({
  selector: 'sq-chip',
  standalone: true,
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
  },
})
export class ChipComponent {
  readonly size = input<ChipSize>('m');
  readonly removable = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly removeLabel = input<string>('Remove chip');
  readonly removed = output<void>();

  remove(): void {
    if (this.removable() && !this.disabled()) {
      this.removed.emit();
    }
  }
}
