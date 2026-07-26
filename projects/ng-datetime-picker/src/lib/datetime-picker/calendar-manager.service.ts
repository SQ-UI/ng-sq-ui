import { Injectable } from '@angular/core';
import { CalendarDay, InCalendarPicker } from './interfaces/calendar-entities';
import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';
import { DateRange } from './interfaces/date-range';
import moment from 'moment';

@Injectable()
export class CalendarManagerService {

  constructor() { }

  private locale = 'en';
  private previouslySelectedYear = moment();

  setLocale(locale: string) {
    moment.locale(locale);
    this.locale = locale;
  }

  generateCalendarForMonth(startDate: moment.Moment | Date,
    currentMonth: moment.Moment,
    selectedDates: moment.Moment[],
    dateRange: DateRange): Array<CalendarDay[]> {
    const monthStart = moment(startDate).startOf('month').locale(this.locale);
    const isStartOfChosenMonthTheFirstDayOfTable = (monthStart.weekday() === 0);

    const dateIterator = monthStart.clone();
    const calendar = [];
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
        momentObj: dateIterator.clone(),
        relativityToCurrentMonth: this.determineDateRelativityToCurrentMonth(dateIterator, currentMonth),
        isDisabled: this.determineIfDateIsDisabled(dateIterator, dateRange.minDate, dateRange.maxDate),
        isSelected: this.getSelectedItemIndex(dateIterator, selectedDates) > -1
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

  generateMonthPickerCollection(currentYear: number, dateRange: DateRange): InCalendarPicker[] {
    const months = this.getMonths();

    return months.map((monthName, index) => {
      const date = moment().year(currentYear).month(index);

      return {
        displayName: monthName,
        momentObj: date,
        isDisabled: this.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });
  }

  generateYearPickerCollection(start: moment.Moment, margin: number = 19, dateRange: DateRange): InCalendarPicker[] {
    const yearsList = this.getYearList(start, margin);

    return yearsList.map((year) => {
      const date = moment().year(year);

      return {
        displayName: year.toString(),
        momentObj: date,
        isDisabled: this.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });
  }

  getWeekdays(short: boolean = true) {
    return short ? moment.weekdaysShort(true) : moment.weekdays(true);
  }

  getMonths(short: boolean = true) {
    return short ? moment.monthsShort() : moment.months();
  }

  getYearList(start: moment.Moment, margin: number = 19): number[] {
    let yearIterator;
    let endYear;

    if (start) {
      this.previouslySelectedYear = start.clone();
    }

    if (margin < 0) {
      endYear = moment(this.previouslySelectedYear).add(margin, 'years');
      yearIterator = moment(endYear).add(margin, 'years');
    } else {
      yearIterator = moment(this.previouslySelectedYear);
      endYear = moment(yearIterator).add(margin, 'years');
    }

    const yearList = [];

    while (yearIterator.isSameOrBefore(endYear)) {
      yearList.push(yearIterator.clone().year());
      yearIterator.add(1, 'year');
    }

    this.previouslySelectedYear = yearIterator.subtract(1, 'year').clone();

    return yearList;
  }

  findADateFromCalendar(date: moment.Moment | Date, calendarTable: Array<CalendarDay[]>): CalendarDay {
    const dateToFind = moment(date);

    const flatCalendarTable = calendarTable.reduce((acc, val) => acc.concat(val), []);

    return flatCalendarTable.find((calendarDay) => {
      return calendarDay.momentObj.isSame(dateToFind, 'day');
    });
  }

  getSelectedItemIndex(date: moment.Moment, selectedDates: moment.Moment[]): number {
    return selectedDates.findIndex((selectedDate) => {
      return moment(selectedDate).isSame(date, 'day');
    });
  }

  determineIfDateIsDisabled(currentDate: moment.Moment | Date,
    minDate: moment.Moment | Date,
    maxDate: moment.Moment | Date): boolean {
    const isAfterMaxDate = maxDate && moment(currentDate).isAfter(maxDate, 'day');
    const isBeforeMinDate = minDate && moment(currentDate).isBefore(minDate, 'day');

    return <boolean>(isAfterMaxDate || isBeforeMinDate);
  }

  determineDateRelativityToCurrentMonth(date: moment.Moment, currentMonth: moment.Moment): CalendarPeriodRelativityEnum {
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
