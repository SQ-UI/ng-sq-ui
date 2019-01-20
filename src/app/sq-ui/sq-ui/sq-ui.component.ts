import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NavItem } from '../../shared/nav-item';
import { LabelValuePair } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-ui',
  templateUrl: './sq-ui.component.html',
  styleUrls: ['./sq-ui.component.scss']
})
export class SqUiComponent implements OnInit {
  npmPackageName: string = '@sq-ui/ng-sq-ui';
  moduleName: string = 'NgSqUiModule';
  exportedModules: NavItem[];
  dependsOn: NavItem[];

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
    this.exportedModules = [
      {
        name: 'FormElementsModule',
        routeLink: ''
      },
      {
        name: 'ProgressBarModule',
        routeLink: ''
      },
    ];
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
