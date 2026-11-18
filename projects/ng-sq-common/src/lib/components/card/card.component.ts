import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardAppearance = 'outlined' | 'elevated' | 'filled';
export type CardActionsAlign = 'start' | 'end';

/** A presentational container with optional header, media, actions and footer slots. */
@Component({
  selector: 'sq-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-actions-align]': 'actionsAlign()',
  },
})
export class CardComponent {
  readonly appearance = input<CardAppearance>('outlined');
  readonly title = input('');
  readonly subtitle = input('');
  readonly actionsAlign = input<CardActionsAlign>('start');
}
