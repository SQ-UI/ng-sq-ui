import { Injectable } from '@angular/core';
import { CalendarDay } from './interfaces/calendar-day';
import { CalendarPeriodRelativity } from './enums/calendar-period-relativity';
import { CalendarPeriodType } from './enums/calendar-period-type';
import { DateRange } from './interfaces/date-range';
// temporary fix for https://github.com/ng-packagr/ng-packagr/issues/217#issuecomment-360176759
import * as momentNs from 'moment';
const moment = momentNs;

@Injectable({
  providedIn: 'root'
})
export class CalendarManagerService {

  constructor() { }

  private locale = 'en';

  setLocale(locale: string) {
    moment.locale(locale);
    this.locale = locale;
  }

  generateCalendarForMonth(startDate: momentNs.Moment | Date,
                           currentMonth: momentNs.Moment,
                           selectedDates: momentNs.Moment[],
                           dateRange: DateRange) {
    const monthStart = moment(startDate).startOf('month').locale(this.locale);
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
        relativityToCurrentMonth: this.determineDateRelativityToCurrentMonth(dateIterator, currentMonth),
        isDisabled: this.determineIfDateIsDisabled(dateIterator, dateRange.minDate, dateRange.maxDate),
        isSelected: this.determineIfDateIsSelected(dateIterator, selectedDates)
      };

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

  getWeekdays(short: boolean = true) {
    return short ? moment.weekdaysShort(true) : moment.weekdays(true);
  }

  determineIfDateIsSelected(date: momentNs.Moment | Date, selectedDates: momentNs.Moment[]): boolean {
    return selectedDates.some((selectedDate) => {
      return selectedDate.isSame(date);
    });
  }

  determineIfDateIsDisabled(currentDate: momentNs.Moment, minDate: momentNs.Moment | Date, maxDate: momentNs.Moment | Date): boolean {
    const isAfterMaxDate = maxDate && currentDate.isAfter(maxDate);
    const isBeforeMinDate = minDate && currentDate.isBefore(minDate);

    return isAfterMaxDate || isBeforeMinDate;
  }

  determineDateRelativityToCurrentMonth(date: momentNs.Moment, currentMonth: momentNs.Moment): CalendarPeriodRelativity {
    const startOfCurrentMonth = moment(currentMonth).startOf('month');
    const endOfCurrentMonth = moment(currentMonth).endOf('month');

    if (moment(date).isBefore(startOfCurrentMonth)) {
      return CalendarPeriodRelativity.Before;
    }

    if (moment(date).isAfter(endOfCurrentMonth)) {
      return CalendarPeriodRelativity.After;
    }

    return CalendarPeriodRelativity.Current;
  }
}
