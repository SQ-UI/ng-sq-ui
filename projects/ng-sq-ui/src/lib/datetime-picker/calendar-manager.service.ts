import { Injectable } from '@angular/core';
import { CalendarDay } from './interfaces/calendar-day';
import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';
import { MonthCalendar } from './interfaces/month-calendar';
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
                           dateRange: DateRange): MonthCalendar {
    const monthStart = moment(startDate).startOf('month').locale(this.locale);
    const isStartOfChosenMonthTheFirstDayOfTable = (monthStart.weekday() === 0);

    const dateIterator = monthStart.clone();
    const calendar: MonthCalendar = { table: [], previouslySelected: [] };
    let tableRow: CalendarDay[] = [];
    let newDate: CalendarDay;

    if (!isStartOfChosenMonthTheFirstDayOfTable) {
      let daysToGoBack = dateIterator.weekday();
      daysToGoBack = (daysToGoBack === 0) ? 1 : daysToGoBack;
      dateIterator.subtract(daysToGoBack, 'days');
    }

    // add dates until the calendar has 6 week rows
    while (calendar.table.length < 6) {
      newDate = {
        displayDate: dateIterator.format('D'),
        momentObj: dateIterator.clone(),
        relativityToCurrentMonth: this.determineDateRelativityToCurrentMonth(dateIterator, currentMonth),
        isDisabled: this.determineIfDateIsDisabled(dateIterator, dateRange.minDate, dateRange.maxDate),
        isSelected: this.getSelectedItemIndex(dateIterator, selectedDates) > -1
      };

      if (tableRow.length <= 6) {
        tableRow.push(newDate);

      } else {
        calendar.table.push(tableRow);
        tableRow = [newDate];
      }

      dateIterator.add(1, 'day');
    }

    return calendar;
  }

  getWeekdays(short: boolean = true) {
    return short ? moment.weekdaysShort(true) : moment.weekdays(true);
  }

  findADateFromCalendar(date: momentNs.Moment | Date, calendarTable: Array<CalendarDay[]>): CalendarDay {
    const dateToFind = moment(date);

    const flatCalendarTable = calendarTable.reduce((acc, val) => acc.concat(val), []);

    return flatCalendarTable.find((calendarDay) => {
      return calendarDay.momentObj.isSame(dateToFind, 'day');
    });
  }

  getSelectedItemIndex(date: momentNs.Moment, selectedDates: momentNs.Moment[]): number {
    return selectedDates.findIndex((selectedDate) => {
      return moment(selectedDate).isSame(date, 'day');
    });
  }

  determineIfDateIsDisabled(currentDate: momentNs.Moment | Date,
                            minDate: momentNs.Moment | Date,
                            maxDate: momentNs.Moment | Date): boolean {
    const isAfterMaxDate = maxDate && moment(currentDate).isAfter(maxDate);
    const isBeforeMinDate = minDate && moment(currentDate).isBefore(minDate);

    return <boolean>(isAfterMaxDate || isBeforeMinDate);
  }

  determineDateRelativityToCurrentMonth(date: momentNs.Moment, currentMonth: momentNs.Moment): CalendarPeriodRelativityEnum {
    const startOfCurrentMonth = moment(currentMonth).startOf('month');
    const endOfCurrentMonth = moment(currentMonth).endOf('month');

    if (moment(date).isBefore(startOfCurrentMonth)) {
      return CalendarPeriodRelativityEnum.Before;
    }

    if (moment(date).isAfter(endOfCurrentMonth)) {
      return CalendarPeriodRelativityEnum.After;
    }

    return CalendarPeriodRelativityEnum.Current;
  }

  sortDatesAsc(dates) {
    return dates.sort((date1, date2) => {
      if (moment(date1).isAfter(date2)) {
        return 1;
      } else {
        return -1;
      }
    });
  }
}
