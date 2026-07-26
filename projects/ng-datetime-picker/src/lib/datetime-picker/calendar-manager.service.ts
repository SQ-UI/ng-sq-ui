import { Injectable } from '@angular/core';
import { Temporal } from '@js-temporal/polyfill';

import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';
import { CalendarDay, InCalendarPicker } from './interfaces/calendar-entities';
import { DateRange, DateRangeBound } from './interfaces/date-range';

/**
 * Number of calendar rows rendered in the month grid.
 * Six rows guarantees a stable grid regardless of the starting weekday.
 */
const CALENDAR_ROWS = 6;

/** Days per row (Mon → Sun, ISO week). */
const CALENDAR_COLS = 7;

/**
 * Temporal-based reimplementation of the calendar rendering / navigation helpers
 * that used to be built on top of `moment`. All exposed dates are
 * `Temporal.PlainDate` values (calendar-only, no timezone). Callers may still
 * pass legacy `Date` / ISO-string values in `DateRange`; they are normalised
 * internally.
 *
 * The picker renders a Monday-first ISO week regardless of locale — the
 * previous `moment.weekday()`-based math was locale-dependent and inconsistent.
 * Locale still drives the *display names* of weekdays and months via `Intl`.
 */
@Injectable({ providedIn: 'root' })
export class CalendarManagerService {
  private locale = 'en';
  private previouslySelectedYear: Temporal.PlainDate = Temporal.Now.plainDateISO();

  setLocale(locale: string): void {
    this.locale = locale || 'en';
  }

  getLocale(): string {
    return this.locale;
  }

  /**
   * Builds a 6×7 grid of {@link CalendarDay}s for the month containing
   * `startDate`. The grid always starts on the Monday preceding (or equal to)
   * the first day of the month, so every row has exactly 7 days.
   */
  generateCalendarForMonth(
    startDate: Temporal.PlainDate,
    currentMonth: Temporal.PlainDate,
    selectedDates: readonly Temporal.PlainDate[],
    dateRange: DateRange
  ): CalendarDay[][] {
    const monthStart = startDate.with({ day: 1 });
    // ISO dayOfWeek: 1 = Monday … 7 = Sunday.
    const daysToGoBack = monthStart.dayOfWeek - 1;
    let iterator = monthStart.subtract({ days: daysToGoBack });

    const calendar: CalendarDay[][] = [];
    let row: CalendarDay[] = [];

    for (let i = 0; i < CALENDAR_ROWS * CALENDAR_COLS; i++) {
      row.push(this.buildCalendarDay(iterator, currentMonth, selectedDates, dateRange));

      if (row.length === CALENDAR_COLS) {
        calendar.push(row);
        row = [];
      }

      iterator = iterator.add({ days: 1 });
    }

    return calendar;
  }

  generateMonthPickerCollection(
    currentYear: number,
    dateRange: DateRange,
    locale: string = this.locale
  ): InCalendarPicker[] {
    const months = this.getMonths(true, locale);

    return months.map((monthName, index) => {
      const date = new Temporal.PlainDate(currentYear, index + 1, 1);
      return {
        displayName: monthName,
        plainDate: date,
        isDisabled: this.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate),
      };
    });
  }

  /**
   * Generates a rolling window of years around the previously selected year.
   *
   * Called with:
   * - `start` set → anchor the window on `start` (used the first time or when
   *   the user picks an explicit year).
   * - positive `margin` → step forward by `margin` years.
   * - negative `margin` → step *backward* by roughly `2 × |margin|` years,
   *   mirroring the original moment-based navigation logic used by the year
   *   picker's "previous" button.
   */
  generateYearPickerCollection(
    start: Temporal.PlainDate | null,
    margin: number,
    dateRange: DateRange
  ): InCalendarPicker[] {
    const years = this.getYearList(start, margin);

    return years.map((year) => {
      const date = new Temporal.PlainDate(year, 1, 1);
      return {
        displayName: year.toString(),
        plainDate: date,
        isDisabled: this.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate),
      };
    });
  }

  /**
   * Locale-aware ISO-order (Monday-first) weekday labels.
   * `short` maps to `weekday: 'short'`, otherwise `'long'`.
   */
  getWeekdays(short: boolean = true, locale: string = this.locale): string[] {
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: short ? 'short' : 'long',
    });

    // Anchor on a known Monday (2024-01-01 is a Monday).
    const anchor = new Temporal.PlainDate(2024, 1, 1);
    const weekdays: string[] = [];
    for (let i = 0; i < 7; i++) {
      weekdays.push(formatter.format(new Date(anchor.add({ days: i }).toString())));
    }

    return weekdays;
  }

  /** Locale-aware month labels. `short` maps to `month: 'short'`, otherwise `'long'`. */
  getMonths(short: boolean = true, locale: string = this.locale): string[] {
    const formatter = new Intl.DateTimeFormat(locale, {
      month: short ? 'short' : 'long',
    });

    const months: string[] = [];
    for (let m = 1; m <= 12; m++) {
      months.push(formatter.format(new Date(Date.UTC(2020, m - 1, 15))));
    }

    return months;
  }

  /** Inclusive `[start, start + margin]` year list. */
  getYearList(start: Temporal.PlainDate | null, margin: number = 19): number[] {
    if (start) {
      this.previouslySelectedYear = start;
    }

    let iteratorDate: Temporal.PlainDate;
    let endDate: Temporal.PlainDate;

    if (margin < 0) {
      endDate = this.previouslySelectedYear.add({ years: margin });
      iteratorDate = endDate.add({ years: margin });
    } else {
      iteratorDate = this.previouslySelectedYear;
      endDate = iteratorDate.add({ years: margin });
    }

    const years: number[] = [];
    let cursor = iteratorDate;
    while (Temporal.PlainDate.compare(cursor, endDate) <= 0) {
      years.push(cursor.year);
      cursor = cursor.add({ years: 1 });
    }

    this.previouslySelectedYear = cursor.subtract({ years: 1 });

    return years;
  }

  findADateFromCalendar(
    date: Temporal.PlainDate | Date | string | null | undefined,
    calendarTable: CalendarDay[][]
  ): CalendarDay | undefined {
    const target = this.toPlainDate(date);
    if (!target) {
      return undefined;
    }

    for (const row of calendarTable) {
      for (const day of row) {
        if (Temporal.PlainDate.compare(day.plainDate, target) === 0) {
          return day;
        }
      }
    }

    return undefined;
  }

  getSelectedItemIndex(date: Temporal.PlainDate, selectedDates: readonly Temporal.PlainDate[]): number {
    return selectedDates.findIndex((selected) => Temporal.PlainDate.compare(selected, date) === 0);
  }

  determineIfDateIsDisabled(
    currentDate: Temporal.PlainDate,
    minDate: DateRangeBound | null | undefined,
    maxDate: DateRangeBound | null | undefined
  ): boolean {
    const min = this.toPlainDate(minDate);
    const max = this.toPlainDate(maxDate);

    const isAfterMax = !!max && Temporal.PlainDate.compare(currentDate, max) > 0;
    const isBeforeMin = !!min && Temporal.PlainDate.compare(currentDate, min) < 0;

    return isAfterMax || isBeforeMin;
  }

  determineDateRelativityToCurrentMonth(
    date: Temporal.PlainDate,
    currentMonth: Temporal.PlainDate
  ): CalendarPeriodRelativityEnum {
    const startOfMonth = currentMonth.with({ day: 1 });
    const endOfMonth = currentMonth.with({ day: currentMonth.daysInMonth });

    if (Temporal.PlainDate.compare(date, startOfMonth) < 0) {
      return CalendarPeriodRelativityEnum.Before;
    }

    if (Temporal.PlainDate.compare(date, endOfMonth) > 0) {
      return CalendarPeriodRelativityEnum.After;
    }

    return CalendarPeriodRelativityEnum.Current;
  }

  sortDatesAsc(dates: readonly Temporal.PlainDate[]): Temporal.PlainDate[] {
    return [...dates].sort((a, b) => Temporal.PlainDate.compare(a, b));
  }

  /**
   * Normalises anything the public API accepts (`PlainDate`, `Date`, ISO string)
   * into a `Temporal.PlainDate`. `Date` values are interpreted in the host's
   * time zone so the picker's grid matches what the user sees on the wall clock.
   */
  toPlainDate(input: Temporal.PlainDate | Date | string | null | undefined): Temporal.PlainDate | null {
    if (input == null) {
      return null;
    }

    if (input instanceof Temporal.PlainDate) {
      return input;
    }

    if (input instanceof Date) {
      if (Number.isNaN(input.getTime())) {
        return null;
      }
      return new Temporal.PlainDate(input.getFullYear(), input.getMonth() + 1, input.getDate());
    }

    if (typeof input === 'string') {
      // Accept both `YYYY-MM-DD` and full ISO date-time strings.
      try {
        return Temporal.PlainDate.from(input);
      } catch {
        try {
          return Temporal.PlainDateTime.from(input).toPlainDate();
        } catch {
          return null;
        }
      }
    }

    return null;
  }

  private buildCalendarDay(
    date: Temporal.PlainDate,
    currentMonth: Temporal.PlainDate,
    selectedDates: readonly Temporal.PlainDate[],
    dateRange: DateRange
  ): CalendarDay {
    return {
      displayDate: String(date.day),
      plainDate: date,
      relativityToCurrentMonth: this.determineDateRelativityToCurrentMonth(date, currentMonth),
      isDisabled: this.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate),
      isSelected: this.getSelectedItemIndex(date, selectedDates) > -1,
    };
  }
}
