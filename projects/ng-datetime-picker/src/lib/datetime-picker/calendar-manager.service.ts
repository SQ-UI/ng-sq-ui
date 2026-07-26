import { Injectable } from '@angular/core';
import { CalendarDay, InCalendarPicker } from './interfaces/calendar-entities';
import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';
import { DateRange } from './interfaces/date-range';
import { Temporal } from '@js-temporal/polyfill';

@Injectable()
export class CalendarManagerService {

  constructor() { }

  private locale = 'en';
  private previouslySelectedYear: Temporal.PlainDate = Temporal.Now.plainDateISO();

  setLocale(locale: string) {
    this.locale = locale;
  }

  generateCalendarForMonth(startDate: Temporal.PlainDate | Date,
    currentMonth: Temporal.PlainDate,
    selectedDates: Temporal.PlainDate[],
    dateRange: DateRange): Array<CalendarDay[]> {
    const monthStart = this.toPlainDate(startDate).with({ day: 1 });

    // dayOfWeek: 1=Mon..7=Sun. Convert to locale-aware weekday offset (Sunday=0 style).
    // moment.weekday() returns locale-aware offset where locale start-of-week = 0.
    // For default 'en' locale, Sunday is the start of the week.
    const startDayOfWeek = monthStart.dayOfWeek % 7; // convert: Mon=1..Sun=7 -> Mon=1..Sat=6,Sun=0
    const isStartOfChosenMonthTheFirstDayOfTable = (startDayOfWeek === 0);

    let dateIterator = monthStart;
    const calendar: Array<CalendarDay[]> = [];
    let tableRow: CalendarDay[] = [];
    let newDate: CalendarDay;

    if (!isStartOfChosenMonthTheFirstDayOfTable) {
      let daysToGoBack = startDayOfWeek;
      daysToGoBack = (daysToGoBack === 0) ? 1 : daysToGoBack;
      dateIterator = dateIterator.subtract({ days: daysToGoBack });
    }

    // add dates until the calendar has 6 week rows
    while (calendar.length < 6) {
      newDate = {
        displayDate: String(dateIterator.day),
        date: dateIterator,
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

      dateIterator = dateIterator.add({ days: 1 });
    }

    return calendar;
  }

  generateMonthPickerCollection(currentYear: number, dateRange: DateRange): InCalendarPicker[] {
    const months = this.getMonths();

    return months.map((monthName, index) => {
      const date = Temporal.PlainDate.from({ year: currentYear, month: index + 1, day: 1 });

      return {
        displayName: monthName,
        date: date,
        isDisabled: this.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });
  }

  generateYearPickerCollection(start: Temporal.PlainDate, margin: number = 19, dateRange: DateRange): InCalendarPicker[] {
    const yearsList = this.getYearList(start, margin);

    return yearsList.map((year) => {
      const date = Temporal.PlainDate.from({ year: year, month: 1, day: 1 });

      return {
        displayName: year.toString(),
        date: date,
        isDisabled: this.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });
  }

  getWeekdays(short: boolean = true) {
    // Generate locale-aware weekday names starting from Sunday (to match original moment behavior)
    const format: Intl.DateTimeFormatOptions = short ? { weekday: 'short' } : { weekday: 'long' };
    const weekdays: string[] = [];
    // Use a known Sunday as the reference date (2023-01-01 is a Sunday)
    const referenceSunday = Temporal.PlainDate.from('2023-01-01');
    for (let i = 0; i < 7; i++) {
      const day = referenceSunday.add({ days: i });
      weekdays.push(day.toLocaleString(this.locale, format));
    }
    return weekdays;
  }

  getMonths(short: boolean = true) {
    const format: Intl.DateTimeFormatOptions = short ? { month: 'short' } : { month: 'long' };
    const months: string[] = [];
    for (let m = 1; m <= 12; m++) {
      const date = Temporal.PlainDate.from({ year: 2000, month: m, day: 1 });
      months.push(date.toLocaleString(this.locale, format));
    }
    return months;
  }

  getYearList(start: Temporal.PlainDate, margin: number = 19): number[] {
    let yearIterator: Temporal.PlainDate;
    let endYear: Temporal.PlainDate;

    if (start) {
      this.previouslySelectedYear = start;
    }

    if (margin < 0) {
      endYear = this.previouslySelectedYear.add({ years: margin });
      yearIterator = endYear.add({ years: margin });
    } else {
      yearIterator = this.previouslySelectedYear;
      endYear = yearIterator.add({ years: margin });
    }

    const yearList: number[] = [];

    while (Temporal.PlainDate.compare(yearIterator, endYear) <= 0) {
      yearList.push(yearIterator.year);
      yearIterator = yearIterator.add({ years: 1 });
    }

    this.previouslySelectedYear = yearIterator.subtract({ years: 1 });

    return yearList;
  }

  findADateFromCalendar(date: Temporal.PlainDate | Date, calendarTable: Array<CalendarDay[]>): CalendarDay {
    const dateToFind = this.toPlainDate(date);

    const flatCalendarTable = calendarTable.reduce((acc, val) => acc.concat(val), []);

    return flatCalendarTable.find((calendarDay) => {
      return Temporal.PlainDate.compare(calendarDay.date, dateToFind) === 0;
    });
  }

  getSelectedItemIndex(date: Temporal.PlainDate, selectedDates: Temporal.PlainDate[]): number {
    return selectedDates.findIndex((selectedDate) => {
      return Temporal.PlainDate.compare(selectedDate, date) === 0;
    });
  }

  determineIfDateIsDisabled(currentDate: Temporal.PlainDate | Date,
    minDate: Temporal.PlainDate | Date,
    maxDate: Temporal.PlainDate | Date): boolean {
    const current = this.toPlainDate(currentDate);
    const isAfterMaxDate = maxDate && Temporal.PlainDate.compare(current, this.toPlainDate(maxDate)) > 0;
    const isBeforeMinDate = minDate && Temporal.PlainDate.compare(current, this.toPlainDate(minDate)) < 0;

    return <boolean>(isAfterMaxDate || isBeforeMinDate);
  }

  determineDateRelativityToCurrentMonth(date: Temporal.PlainDate, currentMonth: Temporal.PlainDate): CalendarPeriodRelativityEnum {
    const startOfCurrentMonth = currentMonth.with({ day: 1 });
    const endOfCurrentMonth = currentMonth.with({ day: currentMonth.daysInMonth });

    if (Temporal.PlainDate.compare(date, startOfCurrentMonth) < 0) {
      return CalendarPeriodRelativityEnum.Before;
    }

    if (Temporal.PlainDate.compare(date, endOfCurrentMonth) > 0) {
      return CalendarPeriodRelativityEnum.After;
    }

    return CalendarPeriodRelativityEnum.Current;
  }

  sortDatesAsc(dates: Temporal.PlainDate[]) {
    return dates.sort((date1, date2) => {
      return Temporal.PlainDate.compare(date1, date2);
    });
  }

  /**
   * Converts a Date or Temporal.PlainDate to Temporal.PlainDate.
   */
  private toPlainDate(date: Temporal.PlainDate | Date): Temporal.PlainDate {
    if (date instanceof Date) {
      return Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      });
    }
    return date;
  }
}
