import { Component, forwardRef, OnInit, ViewEncapsulation, Input, Output, OnChanges } from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarDay } from '../interfaces/calendar-day';
import { CalendarPeriodRelativity } from '../enums/calendar-period-relativity';
import { CalendarPeriodType } from '../enums/calendar-period-type';
import { CalendarManagerService } from '../calendar-manager.service';
// temporary fix for https://github.com/ng-packagr/ng-packagr/issues/217#issuecomment-360176759
import * as momentNs from 'moment';
import { DateRange } from '../interfaces/date-range';
const moment = momentNs;

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatetimePickerComponent),
  multi: true
};

@Component({
  selector: 'sq-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class DatetimePickerComponent extends InputCoreComponent implements OnInit {
  @Input() locale: string = 'en';
  @Input() maxDate: momentNs.Moment | Date;
  @Input() minDate: momentNs.Moment | Date;

  weekdays: string[];
  currentMonth: momentNs.Moment;
  period: CalendarPeriodType = CalendarPeriodType.Month;
  table = [];
  calendarPeriodRelativity = CalendarPeriodRelativity;

  private previouslySelected: CalendarDay;
  private chosenDate: momentNs.Moment;

  constructor(private calendarManager: CalendarManagerService) {
    super();
  }

  ngOnInit() {
    this.value = moment().locale(this.locale);
    this.currentMonth = moment().locale(this.locale);

    this.calendarManager.setLocale(this.locale);
    moment.locale(this.locale);
    this.weekdays = this.calendarManager.getWeekdays();
    this.table = this.getMonthCalendar(moment().locale(this.locale));
  }

  onDateClick(date: CalendarDay) {
    switch (date.relativityToCurrentMonth) {
      case CalendarPeriodRelativity.After:
        this.select(date);
        this.next();
        break;
      case CalendarPeriodRelativity.Before:
        this.select(date);
        this.previous();
        break;
      default:
        this.select(date);
        break;
    }
  }

  select(date: CalendarDay) {
    const month = this.currentMonth.clone();

    if (date.relativityToCurrentMonth === CalendarPeriodRelativity.Before) {
      month.subtract(1, 'month');
    }

    if (date.relativityToCurrentMonth === CalendarPeriodRelativity.After) {
      month.add(1, 'month');
    }

    this.value = moment()
      .year(month.year())
      .month(month.month())
      .date(parseInt(date.displayDate, 10))
      .locale(this.locale);

    date.isSelected = true;

    if (this.previouslySelected && !Object.is(date, this.previouslySelected)) {
      this.previouslySelected.isSelected = false;
    }

    this.previouslySelected = date;
  }

  next() {
    if (this.period === CalendarPeriodType.Month) {
      const nextMonth = this.currentMonth.add(1, 'month');
      this.table = this.getMonthCalendar(nextMonth);
    }
  }

  previous() {
    if (this.period === CalendarPeriodType.Month) {
      const previousMonth = this.currentMonth.subtract(1, 'month');
      this.table = this.getMonthCalendar(previousMonth);
    }
  }

  getMonthCalendar(startPeriod: momentNs.Moment): Array<CalendarDay[]> {
    const selectedDates = [this.value.clone()];
    const dateRange: DateRange = {
      minDate: this.minDate,
      maxDate: this.maxDate
    };

    return this.calendarManager.generateCalendarForMonth(startPeriod, this.currentMonth, selectedDates, dateRange);
  }
}
