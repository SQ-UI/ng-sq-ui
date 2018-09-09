import {Component, forwardRef, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';

import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {fromEvent} from 'rxjs';
import {map} from 'rxjs/operators';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextareaComponent),
  multi: true
};

@Component({
  selector: 'sq-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class TextareaComponent extends InputCoreComponent implements OnInit {
  @Input() autoExpand: boolean = true;
  @Input() height: number = 100;
  @ViewChild('textarea') textarea;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  increaseHeight() {
    if (<boolean>this.autoExpand) {
      // checks if the textarea is overflowing
      if (this.textarea.nativeElement.offsetHeight < this.textarea.nativeElement.scrollHeight) {
        this.height += 20;
      }
    }
  }

}
