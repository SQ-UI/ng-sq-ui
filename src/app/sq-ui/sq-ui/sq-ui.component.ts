import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NavItem } from '../../shared/nav-item';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import { NgFormElementsModule } from '@sq-ui/ng-form-elements';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';
import { ModuleOverviewComponent } from '../../shared/module-overview/module-overview.component';
import { CollapseContentComponent } from '../../shared/collapse-content/collapse-content.component';
import { interval } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sq-ui',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgFormElementsModule,
    ProgressBarComponent,
    ModuleOverviewComponent,
    CollapseContentComponent,
  ],
  templateUrl: './sq-ui.component.html',
  styleUrls: ['./sq-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SqUiComponent {
  npmPackageName: string = '@sq-ui/ng-sq-ui';
  moduleName: string = 'NgSqUiModule';
  internallyDeclared: NavItem[] = [
    {
      name: 'FormElementsModule',
      fragment: 'formsModule'
    },
    {
      name: 'ProgressBarModule',
      fragment: 'progressBarModule'
    },
  ];
  dependsOn: NavItem[] = [
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
  exports: NavItem[] = [];
  docs: NavItem[] =  [
    {
      name: 'FormElementsModule',
      routeLink: `${environment.docs}/form-elements-module`
    },
    {
      name: 'ProgressBarModule',
      routeLink: `${environment.docs}/progressbar-module`
    },
  ];

  liveExamples: NavItem[] = [
    {
      name: 'ng-sq-ui-form-elements',
      routeLink: `https://ng-sq-ui-form-elements.${environment.livePreview}`
    },
    {
      name: 'ng-sq-ui-progress-bar',
      routeLink: `https://ng-sq-ui-progress-bar.${environment.livePreview}`
    }
  ];

  searchResultsStrings: string[];
  progressBarLoadedSmall = 20;
  progressBarLoadedMedium = 40;
  progressBarLoadedLarge = 60;
  testForm: UntypedFormGroup;
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

  constructor(private fb: UntypedFormBuilder) {
    this.testForm = this.fb.group({
      name: [''],
      dropdown: [null],
      dropdownWithTemplates: [null],
      tags: [['tag1']],
      typeahead1: [[this.searchResults[0], this.searchResults[2]]],
      typeaheadWithTemplates: [[this.searchResults[0], this.searchResults[2]]],
      typeahead2: [[]],
      radioValue: ['value1'],
      checkboxValue: [false],
      textareaValue: ['']
    });

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

  searchMethod(query: string) {
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

  searchMethodString(query: string) {
    this.searchResultsStrings = ['option1', 'option2', 'option3', 'option4'];
  }

  onSubmit() {
    console.log(this.testForm.value);
  }
}
