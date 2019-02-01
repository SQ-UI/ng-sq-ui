import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NavItem } from '../../shared/nav-item';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import { interval } from 'rxjs';
import {NgSqCommonModule} from '../../../../projects/ng-sq-common/src/lib/ng-sq-common.module';
import {NgDatetimePickerModule} from '../../../../projects/ng-datetime-picker/src/lib/ng-datetime-picker.module';
import {NgDatatableModule} from '../../../../projects/ng-datatable/src/lib/datatable.module';

@Component({
  selector: 'sq-ui',
  templateUrl: './sq-ui.component.html',
  styleUrls: ['./sq-ui.component.scss']
})
export class SqUiComponent implements OnInit {
  npmPackageName: string = '@sq-ui/ng-sq-ui';
  moduleName: string = 'NgSqUiModule';
  internallyDeclared: NavItem[] = [];
  dependsOn: NavItem[] = [];
  exports: NavItem[] = [];
  docs: NavItem = {name: '', routeLink: ''};

  searchResultsStrings: string[];
  progressBarLoadedSmall = 20;
  progressBarLoadedMedium = 40;
  progressBarLoadedLarge = 60;
  testForm: FormGroup;
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
      textareaValue: ['']
    });
  }

  ngOnInit() {
    this.internallyDeclared = [
      {
        name: 'FormElementsModule',
        fragment: 'formsModule'
      },
      {
        name: 'ProgressBarModule',
        fragment: 'progressBarModule'
      },
    ];

    this.dependsOn = [
      {
        name: 'NgSqCommonModule',
        routeLink: '/sq-common'
      },
      {
        name: 'NgDatetimePickerModule',
        routeLink: '/datetime-picker'
      },
      {
        name: 'NgDatatableModule',
        routeLink: '/datatable'
      },
      {
        name: 'NgModalModule',
        routeLink: '/modal'
      }
    ];

    this.exports = this.internallyDeclared.concat(this.dependsOn);

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
