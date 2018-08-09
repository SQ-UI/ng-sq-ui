import {
  Component, OnInit, Input, Output, forwardRef,
  ViewEncapsulation, ViewChild, EventEmitter
} from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';
import { LabelValuePair } from '../../shared/interfaces/label-value-pair';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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

  showOptions: boolean = false;
  listenForOutsideClick: boolean = false;

  constructor() {
    super();
  }

  ngOnInit() { }

  toggleOptionsDropdown() {
    this.listenForOutsideClick = true;
    this.showOptions = !this.showOptions;
  }

  onClickOutsideComponent() {
    this.showOptions = false;
    this.listenForOutsideClick = false;
  }

  selectOption(option: LabelValuePair) {
    this.value = Object.assign({}, option);
    this.listenForOutsideClick = false;
    this.onSelectItem.emit(option);
  }
}
