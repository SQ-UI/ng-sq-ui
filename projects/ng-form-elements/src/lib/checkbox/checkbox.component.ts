import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, computed, contentChild, output
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FORM_FIELD_DEFAULTS, generateFormFieldId } from '@sq-ui/ng-sq-common';
import { SqCheckboxLabelTemplateDirective } from './checkbox.template.directive';
import type { SqFormFieldSignals, SqFormValueControl } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class CheckboxComponent implements SqFormFieldSignals, SqFormValueControl<boolean> {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>(FORM_FIELD_DEFAULTS.controlLabel);
  readonly controlPlaceholder = input<string>(FORM_FIELD_DEFAULTS.controlPlaceholder);
  readonly required = input<boolean>(FORM_FIELD_DEFAULTS.required);
  readonly pattern = input<readonly RegExp[]>(FORM_FIELD_DEFAULTS.pattern);
  readonly disabled = input<boolean>(FORM_FIELD_DEFAULTS.disabled);

  /** Signals that the user left the control, so `[formField]` can mark the field as touched. */
  readonly touch = output<void>();

  // Two-way binding value
  readonly value = model<boolean>(false);

  // Checkbox-specific state
  readonly isSelected = computed(() => !!this.value());
  readonly isSelectedChange = output<boolean>();

  // Content child for custom label template
  readonly labelTemplate = contentChild(SqCheckboxLabelTemplateDirective);

  toggleCheckboxSelection() {
    const newValue = !this.value();
    this.value.set(newValue);
    this.isSelectedChange.emit(!!newValue);
  }
}
