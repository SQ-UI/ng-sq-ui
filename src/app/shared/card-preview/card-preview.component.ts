import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CardComponent, type CardAppearance } from '@sq-ui/ng-sq-common';
import { ButtonComponent, CheckboxComponent } from '@sq-ui/ng-form-elements';

@Component({
  selector: 'sq-card-preview',
  standalone: true,
  imports: [CardComponent, ButtonComponent, CheckboxComponent],
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPreviewComponent {
  readonly appearances: { value: CardAppearance; label: string }[] = [
    { value: 'outlined', label: 'Outlined' },
    { value: 'elevated', label: 'Elevated' },
    { value: 'filled', label: 'Filled' },
  ];
  readonly compact = signal(false);
  readonly customTheme = signal(false);
  readonly status = signal('Choose a card action.');
}
