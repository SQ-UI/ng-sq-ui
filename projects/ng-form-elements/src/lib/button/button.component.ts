import { Component, ViewEncapsulation, ChangeDetectionStrategy, input, computed } from '@angular/core';

export enum ButtonTypes {
  Button = 'button',
  Submit = 'submit',
  Reset = 'reset'
}

export type ButtonAppearance = 'primary' | 'secondary' | 'neutral';
export type ButtonTone = 'brand' | 'ok' | 'warning' | 'critical';
export type ButtonSize = 's' | 'm' | 'l' | 'xl';

@Component({
  selector: 'sq-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  type = input<ButtonTypes | string>(ButtonTypes.Button);
  disabled = input<boolean>(false);
  appearance = input<ButtonAppearance>('primary');
  tone = input<ButtonTone>('brand');
  size = input<ButtonSize>('m');

  validatedType = computed(() => {
    const t = this.type();
    return Object.values(ButtonTypes).includes(t as ButtonTypes) ? t : ButtonTypes.Button;
  });
}
