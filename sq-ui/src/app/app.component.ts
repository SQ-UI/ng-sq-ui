import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  testForm: FormGroup;
  showModal = false;

  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({
      name: ['sup', Validators.required],
      dropdown: ['', Validators.required],
      tags: [['tag1', 'tag2', 'tag3'], Validators.required],
      typeahead: [[{
        displayName: 'option1',
        value: {specialProp: 1}
      }], Validators.required],
      radioValue: ['value1'],
      checkboxValue: [false]
    });
  }
}
