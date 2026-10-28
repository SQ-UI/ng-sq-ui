import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { compatForm } from '@angular/forms/signals/compat';
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
    FormsModule,
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

  // Individual value signals for direct two-way binding with form components
  nameValue = signal('');
  dropdownValue = signal<LabelValuePair | null>(null);
  dropdownWithTemplatesValue = signal<LabelValuePair | null>(null);
  tagsValue = signal<string[]>(['tag1']);
  typeaheadWithTemplatesValue = signal<LabelValuePair[]>([]);
  typeahead2Value = signal<LabelValuePair[]>([]);
  checkboxValue = signal(false);
  textareaValue = signal('');

  // Signal Forms compatForm() bridge: wraps a WritableSignal model
  formModel = signal({
    name: '',
    dropdown: null as LabelValuePair | null,
    tags: ['tag1'] as string[],
    checkboxValue: false,
    textareaValue: '',
  });
  testForm = compatForm(this.formModel);

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

  constructor() {
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
    this.formModel.set({
      name: this.nameValue(),
      dropdown: this.dropdownValue(),
      tags: this.tagsValue(),
      checkboxValue: this.checkboxValue(),
      textareaValue: this.textareaValue(),
    });
    console.log('Signal Forms (compatForm) value:', this.testForm.value);
  }
}
