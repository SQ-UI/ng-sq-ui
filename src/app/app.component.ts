import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import { interval } from 'rxjs';
import { PaginatorConfig} from '@sq-ui/ng-sq-common';
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
  datatableItems = [
    {
      'userId': 1,
      'id': 1,
      'title': 'delectus aut autem',
      'completed': false
    }
  ];
  sortByColumns = ['userId', 'title'];
  lastPage = 10;
  paginatedItems;
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
  paginatorConfig: PaginatorConfig = {
    itemsPerPage: 3,
    currentPage: 2,
    maxDisplayedPages: 2,
    lastPage: 8
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

    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(response => response.json())
      .then(json => {
        console.log(json);
        const first20 = json.slice(0, 20);
        this.datatableItems = [...first20];
      });
    this.keys = Object.keys(this.datatableItems[0]);
  }

  hoursChange($event) {
    console.log(`The current chosen hours are: ${$event}`);
  }

  minutesChange($event) {
    console.log(`The current chosen minutes are: ${$event}`);
  }

  fetchDatatableItems($event) {
    console.log($event);
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(response => response.json())
      .then(json => {
        const next = json.slice(0, 60);
        this.datatableItems = [...this.datatableItems, ...next];
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
    console.log(this.paginatedItems);
  }
}
