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
  isBeyondCurrentMonth: boolean;
  isSelected: boolean;
}

export enum PeriodType {
  Month = 0,
  Year
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

  weekdays: string[];
  currentMonth = moment();
  period: PeriodType = PeriodType.Month;
  table = [];

  private previouslySelected: CalendarDay;

  constructor() {
    super();
  }

  ngOnInit() {
    moment.locale(this.locale);
    this.weekdays = this.getWeekdays();
    this.table = this.getMonthCalendar(moment().locale(this.locale));
  }

  select(date: CalendarDay) {
    this.value = moment()
      .year(this.currentMonth.year())
      .month(this.currentMonth.month())
      .date(parseInt(date.displayDate, 10))
      .locale(this.locale);

    date.isSelected = true;

    if (this.previouslySelected) {
      this.previouslySelected.isSelected = false;
    }

    this.previouslySelected = date;
  }

  next() {
    if (this.period === PeriodType.Month) {
      const nextMonth = this.currentMonth.add(1, 'month');
      this.table = this.getMonthCalendar(nextMonth);
    }
  }

  previous() {
    if (this.period === PeriodType.Month) {
      const previousMonth = this.currentMonth.subtract(1, 'month');
      this.table  = this.getMonthCalendar(previousMonth);
    }
  }

  getWeekdays(short: boolean = true) {
    return short ? moment.weekdaysShort(true) : moment.weekdays(true);
  }

  getMonthCalendar(period) {
    const monthStart = moment(period).startOf('month').locale(this.locale);
    const tableEnd = moment(monthStart).add(1, 'month').locale(this.locale);
    const isStartOfChosenMonthTheFirstDayOfTable = (monthStart.weekday() === 0);

    const dateIterator = monthStart.clone();
    const calendar: Array<CalendarDay[]> = [];
    let tableRow: CalendarDay[] = [];

    if (!isStartOfChosenMonthTheFirstDayOfTable) {
      let daysToGoBack = dateIterator.weekday();
      daysToGoBack = (daysToGoBack === 0) ? 1 : daysToGoBack;
      dateIterator.subtract(daysToGoBack, 'days');
    }

    while (dateIterator.isSameOrBefore(tableEnd) || calendar.length < 6) {
      if (tableRow.length <= 6) {
        tableRow.push({
          displayDate: dateIterator.format('D'),
          isBeyondCurrentMonth: this.isDateBeyondCurrentMonth(dateIterator),
          isSelected: false
        });

      } else {
        calendar.push(tableRow);

        tableRow = [{
          displayDate: dateIterator.format('D'),
          isBeyondCurrentMonth: this.isDateBeyondCurrentMonth(dateIterator),
          isSelected: false
        }];
      }

      dateIterator.add(1, 'day');
    }

    return calendar;
  }

  private isDateBeyondCurrentMonth(date): boolean {
    const startOfCurrentMonth = moment(this.currentMonth).startOf('month');
    const endOfCurrentMonth = moment(this.currentMonth).endOf('month');

    return (moment(date).isBefore(startOfCurrentMonth) ||
            moment(date).isAfter(endOfCurrentMonth));
  }

}
