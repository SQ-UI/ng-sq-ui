import {
  Component, EventEmitter, Input, OnInit,
  Output, ViewEncapsulation, forwardRef, ContentChild, TemplateRef
} from '@angular/core';

import { InputCoreComponent } from '@sq-ui/ng-sq-common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SqCheckboxLabelTemplateDirective } from './checkbox-templates.directive';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxComponent),
  multi: true
};

@Component({
  selector: 'sq-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class CheckboxComponent extends InputCoreComponent implements OnInit {
  @Input() isSelected: boolean = false;
  @Output() isSelectedChange = new EventEmitter<boolean>();
  @ContentChild(SqCheckboxLabelTemplateDirective, { read: TemplateRef }) checkboxTemplate: TemplateRef<any>;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  toggleCheckboxSelection() {
    this.isSelected = !this.isSelected;
    this.value = this.isSelected;
    this.isSelectedChange.emit(this.isSelected);
  }

}
