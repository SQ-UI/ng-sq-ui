import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';

export enum ButtonTypes {
  Button = 'button',
  Submit = 'submit',
  Reset = 'reset',
}

@Component({
  selector: 'sq-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ButtonComponent {
  readonly type = input<ButtonTypes>(ButtonTypes.Button);
  readonly disabled = input(false);

  protected readonly resolvedType = computed(() => {
    const requestedType = this.type();
    return Object.values(ButtonTypes).includes(requestedType) ? requestedType : ButtonTypes.Button;
  });
}
