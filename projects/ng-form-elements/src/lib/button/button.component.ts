import { Component, ViewEncapsulation, ChangeDetectionStrategy, input, computed } from '@angular/core';

export enum ButtonTypes {
  Button = 'button',
  Submit = 'submit',
  Reset = 'reset'
}

/** Verified M button appearances; additional Figma variants are still pending. */
export type ButtonAppearance = 'primary' | 'neutral';

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

  validatedType = computed(() => {
    const t = this.type();
    return Object.values(ButtonTypes).includes(t as ButtonTypes) ? t : ButtonTypes.Button;
  });
}
