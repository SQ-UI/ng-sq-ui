import {
  Component, forwardRef, OnInit, ViewEncapsulation,
  Input, OnChanges, Output, EventEmitter, AfterViewInit
} from '@angular/core';
import { InputCoreComponent } from '@sq-ui/ng-sq-common';
import { TimeUnit } from '../enums/time-unit.enum';
import { TimeObject } from '../enums/time-object-type.enum';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import moment from 'moment';


const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TimePickerComponent),
  multi: true,
};

@Component({
  selector: 'sq-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class TimePickerComponent extends InputCoreComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() hourStep = 1;
  @Input() minuteStep = 1;
  @Input() isMeridiem = false;
  @Input() isEditable = true;
  @Input('hours') inputHours: number;
  @Input('minutes') inputMinutes: number;
  @Input() timeObjectType: string = TimeObject.String;

  @Output('hoursChange') inputHoursChange = new EventEmitter<number>();
  @Output('minutesChange') inputMinutesChange = new EventEmitter<number>();

  hours;
  minutes;
  noonRelativity = 'am';
  timeUnit = TimeUnit;

  private start = moment();
  private hourFormat = 'HH'; // 24-hour format by default

  limits = {
    hours: {
      min: 0,
      max: 24
    },
    minutes: {
      min: 0,
      max: 59
    }
  };

  constructor() {
    super();
  }

  ngOnInit() {
    this.hours = this.start.format(this.hourFormat);
    this.minutes = this.start.format('mm');
    this.setValueResult();
  }

  ngOnChanges(changesObj) {
    if (changesObj.isMeridiem) {
      if (changesObj.isMeridiem.currentValue) {
        this.hourFormat = 'hh';
        this.noonRelativity = this.start.format('a');
        this.limits.hours.min = 1;
        this.limits.hours.max = 12;
      } else {
        this.hourFormat = 'HH';
        this.limits.hours.min = 0;
        this.limits.hours.max = 24;
      }

      this.hours = this.start.format(this.hourFormat);
    }

    if (changesObj.inputHours &&
      changesObj.inputHours.currentValue !== null &&
      typeof changesObj.inputHours.currentValue !== 'undefined' &&
      changesObj.inputHours.currentValue > -1) {
      this.hours = this.start.hours(changesObj.inputHours.currentValue).format(this.hourFormat);
      this.noonRelativity = this.start.format('a');
    }

    if (changesObj.inputMinutes &&
      changesObj.inputMinutes.currentValue !== null &&
      typeof changesObj.inputMinutes.currentValue !== 'undefined' &&
      changesObj.inputMinutes.currentValue > -1) {
      this.minutes = this.start.minutes(changesObj.inputMinutes.currentValue).format('mm');
    }

    this.setValueResult();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setValueResult();
    });
  }

  increment(unit: TimeUnit) {
    switch (unit) {
      case TimeUnit.Hours:
        this.hours = this.start.add(this.hourStep, 'hours').format(this.hourFormat);
        this.inputHoursChange.emit(parseInt(this.hours, 10));
        break;
      case TimeUnit.Minutes:
        this.minutes = this.start.add(this.minuteStep, 'minutes').format('mm');
        this.inputMinutesChange.emit(parseInt(this.minutes, 10));
        break;
    }

    this.setValueResult();
  }

  decrement(unit: TimeUnit) {
    switch (unit) {
      case TimeUnit.Hours:
        this.hours = this.start.subtract(this.hourStep, 'hours').format(this.hourFormat);
        this.inputHoursChange.emit(parseInt(this.hours, 10));
        break;
      case TimeUnit.Minutes:
        this.minutes = this.start.subtract(this.minuteStep, 'minutes').format('mm');
        this.inputMinutesChange.emit(parseInt(this.minutes, 10));
        break;
    }

    this.setValueResult();
  }

  changeNoonRelativity() {
    this.noonRelativity = this.noonRelativity === 'am' ? 'pm' : 'am';
    this.setValueResult();
  }

  validateInput(unit: TimeUnit) {
    switch (unit) {
      case TimeUnit.Hours:
        this.hours = this.normalizeTimeInput(this.hours, TimeUnit.Hours);
        break;
      case TimeUnit.Minutes:
        this.minutes = this.normalizeTimeInput(this.minutes, TimeUnit.Minutes);
        break;
    }

    this.setValueResult();
  }

  private normalizeTimeInput(value: string, unit: TimeUnit) {
    if (!value) {
      value = '00';
    }

    if (parseInt(value, 10) >= this.limits[unit].max) {
      value = this.limits[unit].max.toString();

      if (unit === TimeUnit.Hours && !this.isMeridiem) {
        value = '00';
      }
    }

    if (parseInt(value, 10) < this.limits[unit].min) {
      value = this.limits[unit].min.toString();
    }

    return value;
  }

  private setValueResult() {
    let timeMoment: moment.Moment;
    let timeString = `${this.hours}:${this.minutes}`;
    timeString = this.isMeridiem ? `${timeString} ${this.noonRelativity.toUpperCase()}` : timeString;

    if (this.timeObjectType === TimeObject.Moment) {
      const momentFormat = this.isMeridiem ? 'hh:mm A' : 'HH:mm';
      timeMoment = moment(timeString, momentFormat);
    }

    this.value = timeMoment ? timeMoment : timeString;
  }
}
