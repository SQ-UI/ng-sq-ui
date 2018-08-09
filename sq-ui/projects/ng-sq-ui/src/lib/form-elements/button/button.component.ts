import { Component, OnInit, Input, ViewEncapsulation, OnChanges } from '@angular/core';

export enum ButtonTypes {
  Button = 'button',
  Submit = 'submit',
  Reset = 'reset'
}

@Component({
  selector: 'sq-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ButtonComponent implements OnInit, OnChanges {
  @Input() type = ButtonTypes.Button;
  @Input() disabled = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changesObj) {
    if (changesObj.hasOwnProperty('type')) {
      if (!Object.values(ButtonTypes).includes(changesObj.type.currentValue)) {
        this.type = ButtonTypes.Button;
      }
    }
  }

}
