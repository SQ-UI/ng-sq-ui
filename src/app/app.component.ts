import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LabelValuePair, SearchResult } from 'ng-sq-ui';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  testForm: FormGroup;
  showModal = false;
  searchResults: any[];
  searchResultsStrings: string[];

  dropdownOptions: LabelValuePair[] = [
    {
      label: 'option1',
      value: 'someVal1',
    },
    {
      label: 'option2',
      value: 'someVal2',
    },
    {
      label: 'option3',
      value: 'someVal3',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({
      name: ['', Validators.required],
      dropdown: [null, Validators.required],
      tags: [['tag1'], Validators.required],
      typeahead1: [[], Validators.required],
      typeahead2: [[], Validators.required],
      radioValue: ['value1'],
      checkboxValue: [false],
    });
  }

  searchMethod(query) {
    this.searchResults = [
      {
        label: 'option1',
        value: 'someVal1',
        prop: 1,
        uid: 12,
        nested: {
          level2: {
            prop: '1',
          },
        },
      },
      {
        label: 'option2',
        value: 'someVal2',
        prop: 2,
        uid: 22,
        nested: {
          level2: {
            prop: '2',
          },
        },
      },
      {
        label: 'option3',
        value: 'someVal3',
        prop: 3,
        uid: 32,
        nested: {
          level2: {
            prop: '1',
          },
        },
      },
    ];
  }

  searchMethodString(query) {
    this.searchResultsStrings = ['option1', 'option2', 'option3', 'option4'];
  }

  onSubmit() {
    console.log(this.testForm.value);
  }
}
