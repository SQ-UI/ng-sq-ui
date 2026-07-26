import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NavItem } from '../../shared/nav-item';
import { NgDatetimePickerModule } from '@sq-ui/ng-datetime-picker';
import { ButtonComponent } from '@sq-ui/ng-form-elements';
import { ModuleOverviewComponent } from '../../shared/module-overview/module-overview.component';
import { CollapseContentComponent } from '../../shared/collapse-content/collapse-content.component';
import { Temporal } from '@js-temporal/polyfill';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sq-datatime-picker-docs',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgDatetimePickerModule,
    ButtonComponent,
    ModuleOverviewComponent,
    CollapseContentComponent,
  ],
  templateUrl: './datatime-picker-docs.component.html',
  styleUrls: ['./datatime-picker-docs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatimePickerDocsComponent {

  testForm: UntypedFormGroup;
  npmPackageName: string = '@sq-ui/ng-datetime-picker';
  moduleName: string = 'NgDatetimePickerModule';
  dependsOn: NavItem[] = [
    {
      name: 'NgSqCommonModule',
      routeLink: '/sq-common'
    }
  ];

  exports: NavItem[] = [
    {
      name: 'sq-datetime-picker',
      fragment: 'datepicker'
    },
    {
      name: 'sq-time-picker',
      fragment: 'timepicker'
    },
    { name: 'TimepickerConfig (interface)' }
  ];

  docs: NavItem[] = [
    {
      name: 'DatetimePickerModule',
      routeLink: `${environment.docs}/datetime-picker-module`
    }
  ];

  liveExamples: NavItem[] = [
    {
      name: 'ng-sq-ui-datetime-picker',
      routeLink: `https://ng-sq-ui-datetime-picker.${environment.livePreview}`
    }
  ];

  isDatepickerMultipleSelect = true;
  minDate = Temporal.Now.plainDateISO();
  maxDate = Temporal.Now.plainDateISO().add({ years: 5 });
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
  standAloneTimepickerValue: any = null;

  constructor(private fb: UntypedFormBuilder) {
    const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
    this.testForm = this.fb.group({
      standAloneDatepicker: [tomorrow],
      datetimePicker: [tomorrow]
    });
  }

  hoursChange($event: number) {
    console.log(`The current chosen hours are: ${$event}`);
  }

  minutesChange($event: number) {
    console.log(`The current chosen minutes are: ${$event}`);
  }

  onSubmit() {
    console.log(this.testForm.value);
  }
}
