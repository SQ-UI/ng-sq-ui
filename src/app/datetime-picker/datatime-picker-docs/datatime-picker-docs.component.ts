import { Component, OnInit } from '@angular/core';
import { NavItem } from '../../shared/shared.module';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import moment from 'moment';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sq-datatime-picker-docs',
  templateUrl: './datatime-picker-docs.component.html',
  styleUrls: ['./datatime-picker-docs.component.scss']
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

  constructor(private fb: UntypedFormBuilder) {
    this.testForm = this.fb.group({
      standAloneDatepicker: [moment().add(1, 'day')],
      datetimePicker: [moment().add(1, 'day')],
      standAloneTimepicker: []
    });
  }

  hoursChange($event) {
    console.log(`The current chosen hours are: ${$event}`);
  }

  minutesChange($event) {
    console.log(`The current chosen minutes are: ${$event}`);
  }

  onSubmit() {
    console.log(this.testForm.value);
  }

}
