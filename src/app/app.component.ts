import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LabelValuePair } from 'ng-sq-ui';
import * as momentNs from 'moment';
const moment = momentNs;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  testForm: FormGroup;
  showModal = false;
  searchResults: any[] = [
    {
      myCustomProp: 'option1',
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
      myCustomProp: 'option2',
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
      myCustomProp: 'option3',
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
  searchResultsStrings: string[];
  isDatepickerRanged = false;
  minDate = moment();
  maxDate = moment().add(5, 'years');
  timepickerConfig = {
    hourStep: 2,
    minuteStep: 15,
    hours: 0,
    minutes: 0,
    isMeridiem: true,
    isEditable: false
  };

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
      name: [''],
      dropdown: [null],
      tags: [['tag1']],
      typeahead1: [[this.searchResults[0], this.searchResults[2]]],
      typeahead2: [[]],
      radioValue: ['value1'],
      checkboxValue: [false],
      textareaValue: [''],
      datepicker: [moment().add(1, 'day'), Validators.required]
    });
  }

  searchMethod(query) {
    this.searchResults = [
      {
        myCustomProp: 'option1',
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
        myCustomProp: 'option2',
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
        myCustomProp: 'option3',
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
