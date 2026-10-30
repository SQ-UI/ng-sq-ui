import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, output, computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FORM_FIELD_DEFAULTS, generateFormFieldId, toPatternAttribute, type SqFormFieldSignals, type SqFormValueControl } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements SqFormFieldSignals, SqFormValueControl<string> {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>(FORM_FIELD_DEFAULTS.controlLabel);
  readonly controlPlaceholder = input<string>(FORM_FIELD_DEFAULTS.controlPlaceholder);
  readonly required = input<boolean>(FORM_FIELD_DEFAULTS.required);
  readonly pattern = input<readonly RegExp[]>(FORM_FIELD_DEFAULTS.pattern);
  readonly disabled = input<boolean>(FORM_FIELD_DEFAULTS.disabled);

  // Component-specific inputs
  readonly type = input<string>('text');

  // Two-way value binding via model()
  readonly value = model<string>('');

  /** Signals that the user left the control, so `[formField]` can mark the field as touched. */
  readonly touch = output<void>();

  protected readonly patternAttribute = computed(() => toPatternAttribute(this.pattern()));
}
