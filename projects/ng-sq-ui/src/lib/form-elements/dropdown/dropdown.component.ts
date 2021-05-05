import {
  Component, OnInit, Input, Output, forwardRef,
  ViewEncapsulation, EventEmitter, TemplateRef, ContentChild
} from '@angular/core';
import { InputCoreComponent } from '@sq-ui/ng-sq-common';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SqDropdownChevronTemplateDirective, SqDropdownOptionTemplateDirective, SqDropdownSelectedOptionTemplateDirective } from './dropdown-templates.directive';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DropdownComponent),
  multi: true
};

@Component({
  selector: 'sq-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class DropdownComponent extends InputCoreComponent implements OnInit {
  @Input() options: LabelValuePair[];
  @Output() onSelectItem: EventEmitter<LabelValuePair> = new EventEmitter<LabelValuePair>();

  @ContentChild(SqDropdownOptionTemplateDirective, { read: TemplateRef }) optionTemplate: TemplateRef<any>;
  @ContentChild(SqDropdownChevronTemplateDirective, { read: TemplateRef }) chevronTemplate: TemplateRef<any>;
  @ContentChild(SqDropdownSelectedOptionTemplateDirective, { read: TemplateRef }) selectedItemTemplate: TemplateRef<any>;

  isOpen: boolean = false;
  listenForOutsideClick: boolean = false;

  constructor() {
    super();
  }

  ngOnInit() { }

  toggleOptionsDropdown() {
    this.listenForOutsideClick = true;
    this.isOpen = !this.isOpen;
  }

  onClickOutsideComponent() {
    this.isOpen = false;
    this.listenForOutsideClick = false;
  }

  selectOption(option: LabelValuePair) {
    this.value = Object.assign({}, option);
    this.listenForOutsideClick = false;
    this.onSelectItem.emit(option);
  }
}
