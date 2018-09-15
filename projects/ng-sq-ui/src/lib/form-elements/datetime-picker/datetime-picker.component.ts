import { Component, forwardRef, OnInit, ViewEncapsulation, Input, Output, OnChanges } from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
// temporary fix for https://github.com/ng-packagr/ng-packagr/issues/217#issuecomment-360176759
import * as momentNs from 'moment';
const moment = momentNs;

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatetimePickerComponent),
  multi: true
};

export interface CalendarDay {
  displayDate: string;
  relativityToCurrentMonth: CalendarPeriodRelativity;
  isSelected: boolean;
  isDisabled: boolean;
}

export enum CalendarPeriodType {
  Month = 0,
  Year
}

export enum CalendarPeriodRelativity {
  Current = 0,
  Before,
  After
}

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

  constructor() {
    super();
  }

  ngOnInit() {
    this.value = moment().locale(this.locale);
    this.currentMonth = moment().locale(this.locale);

    moment.locale(this.locale);
    this.weekdays = this.getWeekdays();
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

  getWeekdays(short: boolean = true) {
    return short ? moment.weekdaysShort(true) : moment.weekdays(true);
  }

  getMonthCalendar(period) {
    const monthStart = moment(period).startOf('month').locale(this.locale);
    const isStartOfChosenMonthTheFirstDayOfTable = (monthStart.weekday() === 0);

    const dateIterator = monthStart.clone();
    const calendar: Array<CalendarDay[]> = [];
    let tableRow: CalendarDay[] = [];
    let newDate: CalendarDay;

    if (!isStartOfChosenMonthTheFirstDayOfTable) {
      let daysToGoBack = dateIterator.weekday();
      daysToGoBack = (daysToGoBack === 0) ? 1 : daysToGoBack;
      dateIterator.subtract(daysToGoBack, 'days');
    }

    // add dates until the calendar has 6 week rows
    while (calendar.length < 6) {
      newDate = {
        displayDate: dateIterator.format('D'),
        relativityToCurrentMonth: this.determineDateRelativityToCurrentMonth(dateIterator),
        isDisabled: this.determineIfDateIsDisabled(dateIterator),
        isSelected: moment(this.value).isSame(dateIterator, 'day')
      };

      if (newDate.isSelected) {
        this.previouslySelected = newDate;
      }

      if (tableRow.length <= 6) {
        tableRow.push(newDate);

      } else {
        calendar.push(tableRow);
        tableRow = [newDate];
      }

      dateIterator.add(1, 'day');
    }

    return calendar;
  }

  private determineIfDateIsDisabled(date: momentNs.Moment): boolean {
    const isAfterMaxDate = this.maxDate && date.isAfter(this.maxDate);
    const isBeforeMinDate = this.minDate && date.isBefore(this.minDate);

    return isAfterMaxDate || isBeforeMinDate;
  }

  private determineDateRelativityToCurrentMonth(date: momentNs.Moment): CalendarPeriodRelativity {
    const startOfCurrentMonth = moment(this.currentMonth).startOf('month');
    const endOfCurrentMonth = moment(this.currentMonth).endOf('month');

    if (moment(date).isBefore(startOfCurrentMonth)) {
      return CalendarPeriodRelativity.Before;
    }

    if (moment(date).isAfter(endOfCurrentMonth)) {
      return CalendarPeriodRelativity.After;
    }

    return CalendarPeriodRelativity.Current;
  }

}
