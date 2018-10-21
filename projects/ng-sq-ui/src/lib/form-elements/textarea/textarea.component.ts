import { Component, forwardRef, Input, OnInit,
         ViewChild, ViewEncapsulation, Renderer2 } from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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
  @Input() minHeight = 100;
  @ViewChild('textarea') textarea;

  isPlaceholderVisible = true;

  constructor(private renderer: Renderer2) {
    super();
  }

  ngOnInit() {
    this.isPlaceholderVisible = !this.value;
  }

  writeValue(value: any): void {
    if (value) {
      this.renderer.setProperty(this.textarea.nativeElement, 'textContent', value);
    }
  }

  inputChange($event) {
    this.value = $event.target.textContent;
    this._onChange($event.target.textContent);
    this.isPlaceholderVisible = !$event.target.textContent;
  }

  setDisabledState( isDisabled: boolean): void {
    const div = this.textarea.nativeElement;
    const action = isDisabled ? 'addClass' : 'removeClass';
    this.renderer[action](div, 'disabled');
  }

  focusOnArea() {
    this.textarea.nativeElement.focus();
  }

}
