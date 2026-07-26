import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NavItem } from '../../shared/nav-item';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import {
  InputComponent,
  DropdownComponent,
  TagsInputComponent,
  RadiobuttonComponent,
  FormGroupComponent,
  TypeaheadComponent,
  CheckboxComponent,
  ButtonComponent,
  TextareaComponent,
  SqDropdownOptionTemplateDirective,
  SqDropdownChevronTemplateDirective,
  SqDropdownSelectedOptionTemplateDirective,
  SqRadiobuttonLabelTemplateDirective,
  SqTagTemplateDirective,
  SqTypeaheadOptionTemplateDirective,
  SqTypeaheadSelectedOptionTemplateDirective,
  SqCheckboxLabelTemplateDirective,
} from '@sq-ui/ng-form-elements';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';
import { ModuleOverviewComponent } from '../../shared/module-overview/module-overview.component';
import { CollapseContentComponent } from '../../shared/collapse-content/collapse-content.component';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sq-ui',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    DropdownComponent,
    TagsInputComponent,
    RadiobuttonComponent,
    FormGroupComponent,
    TypeaheadComponent,
    CheckboxComponent,
    ButtonComponent,
    TextareaComponent,
    SqDropdownOptionTemplateDirective,
    SqDropdownChevronTemplateDirective,
    SqDropdownSelectedOptionTemplateDirective,
    SqRadiobuttonLabelTemplateDirective,
    SqTagTemplateDirective,
    SqTypeaheadOptionTemplateDirective,
    SqTypeaheadSelectedOptionTemplateDirective,
    SqCheckboxLabelTemplateDirective,
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
  moduleName: string = 'ng-sq-ui (barrel re-exports)';
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
      name: 'ng-datetime-picker',
      routeLink: '/datetime-picker'
    },
    {
      name: 'NgDatatable',
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
  radioGroupValue = signal<string>('value1');
  progressBarLoadedSmall = signal(20);
  progressBarLoadedMedium = signal(40);
  progressBarLoadedLarge = signal(60);
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
      checkboxValue: [false],
      textareaValue: ['']
    });

    this.exports = this.internallyDeclared.concat(this.dependsOn);

    interval(1000).pipe(takeUntilDestroyed()).subscribe(() => {
      this.progressBarLoadedSmall.update(v => v + 20 > 100 ? 0 : v + 20);
      this.progressBarLoadedMedium.update(v => v + 20 > 100 ? 0 : v + 20);
      this.progressBarLoadedLarge.update(v => v + 20 > 100 ? 0 : v + 20);
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
