import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, signal, contentChild, output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { generateFormFieldId, OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import {
  SqDropdownChevronTemplateDirective,
  SqDropdownOptionTemplateDirective,
  SqDropdownSelectedOptionTemplateDirective
} from './dropdown.template.directive';

@Component({
  selector: 'sq-dropdown',
  standalone: true,
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    NgTemplateOutlet,
    OutsideClickListenerDirective,
  ],
})
export class DropdownComponent {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Component-specific inputs
  readonly options = input<LabelValuePair[]>([]);

  // Two-way binding value
  readonly value = model<LabelValuePair | null>(null);

  // Event output
  readonly onSelectItem = output<LabelValuePair>();

  // Content children for custom templates
  readonly optionTemplate = contentChild(SqDropdownOptionTemplateDirective);
  readonly chevronTemplate = contentChild(SqDropdownChevronTemplateDirective);
  readonly selectedOptionTemplate = contentChild(SqDropdownSelectedOptionTemplateDirective);

  // Internal state
  readonly isOpen = signal<boolean>(false);
  readonly listenForOutsideClick = signal<boolean>(false);

  toggleOptionsDropdown() {
    this.listenForOutsideClick.set(true);
    this.isOpen.update(open => !open);
  }

  onClickOutsideComponent() {
    this.isOpen.set(false);
    this.listenForOutsideClick.set(false);
  }

  selectOption(option: LabelValuePair) {
    this.value.set({ ...option });
    this.isOpen.set(false);
    this.listenForOutsideClick.set(false);
    this.onSelectItem.emit(option);
  }
}
