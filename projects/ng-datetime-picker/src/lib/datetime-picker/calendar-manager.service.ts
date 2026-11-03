import { Injectable } from '@angular/core';
import { CalendarDay, InCalendarPicker } from './interfaces/calendar-entities';
import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';
import { DateRange } from './interfaces/date-range';
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';

@Injectable()
export class CalendarManagerService {

  constructor() { }

  private locale = 'en';
  /** First year of the year page last returned by {@link getYearList}. */
  private yearPageStart: number = Temporal.Now.plainDateISO().year;

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
      dateIterator = dateIterator.subtract({ days: startDayOfWeek });
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

  generateYearPickerCollection(start: Temporal.PlainDate | null, margin: number = 19, dateRange: DateRange): InCalendarPicker[] {
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

  getWeekdays(short: boolean = true, locale: string = this.locale) {
    // Generate locale-aware weekday names starting from Sunday (to match original moment behavior)
    const format: Intl.DateTimeFormatOptions = short ? { weekday: 'short' } : { weekday: 'long' };
    const weekdays: string[] = [];
    // Use a known Sunday as the reference date (2023-01-01 is a Sunday)
    const referenceSunday = Temporal.PlainDate.from('2023-01-01');
    for (let i = 0; i < 7; i++) {
      const day = referenceSunday.add({ days: i });
      weekdays.push(day.toLocaleString(locale, format));
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

  /**
   * Returns a page of `|margin| + 1` consecutive years.
   *
   * - With `start`: the page begins at `start.year`.
   * - Without `start`, positive margin: the page right after the previous one.
   * - Without `start`, negative margin: the page right before the previous one.
   *
   * Consecutive pages tile exactly (no year is repeated across pages).
   */
  getYearList(start: Temporal.PlainDate | null, margin: number = 19): number[] {
    const pageSize = Math.abs(margin) + 1;
    let firstYear: number;

    if (start) {
      firstYear = start.year;
    } else if (margin < 0) {
      firstYear = this.yearPageStart - pageSize;
    } else {
      firstYear = this.yearPageStart + pageSize;
    }

    this.yearPageStart = firstYear;

    return Array.from({ length: pageSize }, (_, index) => firstYear + index);
  }

  findADateFromCalendar(date: Temporal.PlainDate | Date, calendarTable: Array<CalendarDay[]>): CalendarDay | undefined {
    const dateToFind = this.toPlainDate(date);

    const flatCalendarTable = calendarTable.reduce((acc, val) => acc.concat(val), []);

    return flatCalendarTable.find((calendarDay) => {
      return Temporal.PlainDate.compare(calendarDay.date, dateToFind) === 0;
    });
  }

  /** Every date from `start` to `end`, both included, in ascending order (empty when `end < start`). */
  getDatesBetween(start: Temporal.PlainDate, end: Temporal.PlainDate): Temporal.PlainDate[] {
    const dates: Temporal.PlainDate[] = [];

    for (let date = start; Temporal.PlainDate.compare(date, end) <= 0; date = date.add({ days: 1 })) {
      dates.push(date);
    }

    return dates;
  }

  getSelectedItemIndex(date: Temporal.PlainDate, selectedDates: Temporal.PlainDate[]): number {
    return selectedDates.findIndex((selectedDate) => {
      return Temporal.PlainDate.compare(selectedDate, date) === 0;
    });
  }

  determineIfDateIsDisabled(currentDate: Temporal.PlainDate | Date,
    minDate: Temporal.PlainDate | Date | null | undefined,
    maxDate: Temporal.PlainDate | Date | null | undefined): boolean {
    const current = this.toPlainDate(currentDate);
    const isAfterMaxDate = !!maxDate && Temporal.PlainDate.compare(current, this.toPlainDate(maxDate)) > 0;
    const isBeforeMinDate = !!minDate && Temporal.PlainDate.compare(current, this.toPlainDate(minDate)) < 0;

    return isAfterMaxDate || isBeforeMinDate;
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

  /**
   * Sorts dates ascending. `Temporal.PlainDateTime` values are compared by their date part, which is
   * what the picker's `[isMultipleSelect]` output has always been ordered by.
   */
  sortDatesAsc<TDate extends Temporal.PlainDate | Temporal.PlainDateTime>(dates: TDate[]): TDate[] {
    // Sorts a copy: callers pass signal state that must not be mutated in place.
    return [...dates].sort((date1, date2) => {
      return Temporal.PlainDate.compare(this.toPlainDate(date1), this.toPlainDate(date2));
    });
  }

  /**
   * Converts a Date, Temporal.PlainDate or Temporal.PlainDateTime to Temporal.PlainDate.
   */
  private toPlainDate(date: Temporal.PlainDate | Temporal.PlainDateTime | Date): Temporal.PlainDate {
    if (date instanceof Date) {
      return Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      });
    }

    if (date instanceof Temporal.PlainDateTime) {
      return date.toPlainDate();
    }

    return date;
  }
}
