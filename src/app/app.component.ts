import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import { interval } from 'rxjs';
import * as momentNs from 'moment';
const moment = momentNs;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
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

  progressBarLoadedSmall = 20;
  progressBarLoadedMedium = 40;
  progressBarLoadedLarge = 60;
  datatableItems =[
    {
      "index": 0,
      "isActive": false,
      "balance": "$3,288.88",
      "age": 37,
      "company": "INSOURCE",
      "latitude": 87.664628,
      "longitude": 156.427784
    },
    {
      "index": 1,
      "isActive": false,
      "balance": "$2,669.48",
      "age": 33,
      "latitude": 26.700524,
      "longitude": -178.472786
    },
    {
      "index": 2,
      "isActive": false,
      "balance": "$3,558.33",
      "age": 40,
      "latitude": -65.662322,
      "longitude": -31.090771
    },
    {
      "index": 3,
      "isActive": true,
      "balance": "$1,399.18",
      "age": 25,
      "latitude": -48.918194,
      "longitude": 20.190939
    },
    {
      "index": 4,
      "isActive": true,
      "balance": "$1,503.99",
      "age": 36,
      "latitude": 61.780912,
      "longitude": 150.737673
    },
    {
      "index": 5,
      "isActive": false,
      "balance": "$1,725.67",
      "age": 23,
      "latitude": 72.643983,
      "longitude": -160.475331
    },
    {
      "index": 6,
      "isActive": false,
      "balance": "$2,316.69",
      "age": 31,
      "latitude": 17.839987,
      "longitude": 23.605398
    }
  ];

  isDatepickerMultipleSelect = true;
  minDate = moment();
  maxDate = moment().add(5, 'years');
  inlineTimepickerConfig = {
    hourStep: 2,
    minuteStep: 15,
    hours: 22,
    minutes: 30,
    isMeridiem: true,
    isEditable: true,
  };
  standAloneTimepicker = {
    hourStep: 1,
    minuteStep: 1,
    hours: 13,
    minutes: 20,
    isMeridiem: false,
    isEditable: false,
  };
  isTimepickerEndabled = true;

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
      standAloneDatepicker: [moment()],
      datetimePicker: [moment().add(1, 'day')],
      standAloneTimepicker: [],
    });
  }

  keys = [];

  ngOnInit() {
    const source = interval(1000);
    source.subscribe((val) => {
      this.progressBarLoadedSmall += 20;
      this.progressBarLoadedMedium += 20;
      this.progressBarLoadedLarge += 20;

      if (this.progressBarLoadedSmall > 100) {
        this.progressBarLoadedSmall = 0;
      }

      if (this.progressBarLoadedMedium > 100) {
        this.progressBarLoadedMedium = 0;
      }

      if (this.progressBarLoadedLarge > 100) {
        this.progressBarLoadedLarge = 0;
      }
    });
    this.keys = Object.keys(this.datatableItems[0]);
  }

  hoursChange($event) {
    console.log(`The current chosen hours are: ${$event}`);
  }

  minutesChange($event) {
    console.log(`The current chosen minutes are: ${$event}`);
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
