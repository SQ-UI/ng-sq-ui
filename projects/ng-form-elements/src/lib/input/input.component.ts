import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { generateFormFieldId } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Component-specific inputs
  readonly type = input<string>('text');

  // Two-way value binding via model()
  readonly value = model<any>('');
}
