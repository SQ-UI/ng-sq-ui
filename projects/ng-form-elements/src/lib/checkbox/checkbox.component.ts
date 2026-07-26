import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, computed, contentChild, output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { generateFormFieldId } from '@sq-ui/ng-sq-common';
import { SqCheckboxLabelTemplateDirective } from './checkbox.template.directive';

@Component({
  selector: 'sq-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgTemplateOutlet],
})
export class CheckboxComponent {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Two-way binding value
  readonly value = model<any>(false);

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
