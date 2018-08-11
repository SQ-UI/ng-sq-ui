import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LabelValuePair, SearchResult } from 'ng-sq-ui';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  testForm: FormGroup;
  showModal = false;
  searchResults: SearchResult[];
  formValuesPreview = '';

  dropdownOptions: LabelValuePair[] = [
    {
      label: 'option1',
      value: 'someVal1'
    },
    {
      label: 'option2',
      value: 'someVal2'
    },
    {
      label: 'option3',
      value: 'someVal3'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({
      name: ['', Validators.required],
      dropdown: [null, Validators.required],
      tags: [['tag1'], Validators.required],
      typeahead: [[], Validators.required],
      radioValue: ['value1'],
      checkboxValue: [false]
    });
  }

  searchMethod(query) {
    this.searchResults = [
      {
        displayName: 'Search result 1',
        value: 1
      },
      {
        displayName: 'Search result 2',
        value: 2
      }
      ,
      {
        displayName: 'Search result 3',
        value: 3
      }
    ];
  }

  onSubmit() {
    console.log(this.testForm.value);
  }
}
