import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormValueControl } from '@angular/forms/signals';
import { LabelValuePair, OutsideClickListenerDirective, SqInputCore } from '@sq-ui/ng-sq-common';
import {
  SqDropdownChevronTemplateDirective,
  SqDropdownOptionTemplateDirective,
  SqDropdownSelectedOptionTemplateDirective,
} from './dropdown.template.directive';

@Component({
  selector: 'sq-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet, OutsideClickListenerDirective],
})
export class DropdownComponent extends SqInputCore implements FormValueControl<LabelValuePair | null> {
  readonly options = input<LabelValuePair[]>([]);
  readonly onSelectItem = output<LabelValuePair>();

  readonly value = model<LabelValuePair | null>(null);

  readonly optionTemplate = contentChild(SqDropdownOptionTemplateDirective, { read: TemplateRef });
  readonly chevronTemplate = contentChild(SqDropdownChevronTemplateDirective, { read: TemplateRef });
  readonly selectedItemTemplate = contentChild(SqDropdownSelectedOptionTemplateDirective, { read: TemplateRef });

  readonly isOpen = signal(false);
  readonly listenForOutsideClick = signal(false);

  toggleOptionsDropdown(): void {
    this.listenForOutsideClick.set(true);
    this.isOpen.update((isOpen) => !isOpen);
  }

  onClickOutsideComponent(): void {
    this.isOpen.set(false);
    this.listenForOutsideClick.set(false);
  }

  selectOption(option: LabelValuePair): void {
    this.value.set({ ...option });
    this.listenForOutsideClick.set(false);
    this.onSelectItem.emit(option);
  }
}
