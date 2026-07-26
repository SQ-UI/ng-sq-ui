import { TestBed } from '@angular/core/testing';
import { Temporal } from '@js-temporal/polyfill';

import { CalendarManagerService } from './calendar-manager.service';
import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';

const NULL_RANGE = { minDate: null, maxDate: null };

describe('CalendarManagerService', () => {
  let service: CalendarManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generates a 6x7 grid whose first cell is the Monday on or before the 1st', () => {
    // 2024-05 (May 2024) starts on Wednesday (ISO dayOfWeek = 3).
    const start = new Temporal.PlainDate(2024, 5, 15);
    const calendar = service.generateCalendarForMonth(start, start, [], NULL_RANGE);

    expect(calendar.length).toBe(6);
    expect(calendar.every((row) => row.length === 7)).toBe(true);

    const first = calendar[0][0].plainDate;
    // Grid first cell is the Monday preceding May 1st, i.e. April 29 2024.
    expect(first.year).toBe(2024);
    expect(first.month).toBe(4);
    expect(first.day).toBe(29);
    expect(first.dayOfWeek).toBe(1); // Monday

    const last = calendar[5][6].plainDate;
    // 6 rows * 7 cols = 42 days from Monday Apr 29 → Sunday Jun 9 2024.
    expect(last.year).toBe(2024);
    expect(last.month).toBe(6);
    expect(last.day).toBe(9);
    expect(last.dayOfWeek).toBe(7); // Sunday
  });

  it('starts the grid exactly on the 1st when the month begins on a Monday', () => {
    // April 2024 starts on Monday.
    const monthThatStartsMonday = new Temporal.PlainDate(2024, 4, 1);
    const calendar = service.generateCalendarForMonth(
      monthThatStartsMonday,
      monthThatStartsMonday,
      [],
      NULL_RANGE
    );

    const first = calendar[0][0].plainDate;
    expect(first.day).toBe(1);
    expect(first.month).toBe(4);
    expect(first.year).toBe(2024);
  });

  it('handles the February leap-year boundary (2024)', () => {
    const feb = new Temporal.PlainDate(2024, 2, 1);
    const calendar = service.generateCalendarForMonth(feb, feb, [], NULL_RANGE);

    const flat = calendar.flat();
    const feb29 = flat.find(
      (d) => d.plainDate.year === 2024 && d.plainDate.month === 2 && d.plainDate.day === 29
    );
    expect(feb29).toBeTruthy();
    expect(feb29!.relativityToCurrentMonth).toBe(CalendarPeriodRelativityEnum.Current);
  });

  it('does not include Feb 29 in a non-leap year (2023)', () => {
    const feb = new Temporal.PlainDate(2023, 2, 15);
    const calendar = service.generateCalendarForMonth(feb, feb, [], NULL_RANGE);

    const anyFeb29 = calendar
      .flat()
      .find((d) => d.plainDate.month === 2 && d.plainDate.day === 29);
    expect(anyFeb29).toBeUndefined();
  });

  it('correctly marks month boundary cells relative to the current month', () => {
    const current = new Temporal.PlainDate(2024, 3, 15);
    const calendar = service.generateCalendarForMonth(current, current, [], NULL_RANGE);

    const beforeCell = calendar
      .flat()
      .find((d) => d.relativityToCurrentMonth === CalendarPeriodRelativityEnum.Before);
    const afterCell = calendar
      .flat()
      .find((d) => d.relativityToCurrentMonth === CalendarPeriodRelativityEnum.After);
    const currentCell = calendar
      .flat()
      .find((d) => d.plainDate.day === 15 && d.plainDate.month === 3);

    expect(beforeCell?.plainDate.month).toBe(2);
    expect(afterCell?.plainDate.month).toBe(4);
    expect(currentCell?.relativityToCurrentMonth).toBe(CalendarPeriodRelativityEnum.Current);
  });

  it('finds a date from the grid using PlainDate, Date, or ISO string', () => {
    const start = new Temporal.PlainDate(2024, 6, 1);
    const calendar = service.generateCalendarForMonth(start, start, [], NULL_RANGE);
    const target = new Temporal.PlainDate(2024, 6, 15);

    const byPlainDate = service.findADateFromCalendar(target, calendar);
    const byDate = service.findADateFromCalendar(new Date(2024, 5, 15), calendar);
    const byIso = service.findADateFromCalendar('2024-06-15', calendar);

    expect(byPlainDate?.plainDate.day).toBe(15);
    expect(byDate?.plainDate.day).toBe(15);
    expect(byIso?.plainDate.day).toBe(15);
  });

  it('disables calendar dates outside the [min, max] range', () => {
    const anchor = new Temporal.PlainDate(2024, 7, 15);
    const min = anchor.subtract({ days: 3 });
    const max = anchor.add({ days: 3 });

    const calendar = service.generateCalendarForMonth(anchor, anchor, [], {
      minDate: min,
      maxDate: max,
    });

    const dayBeforeMin = service.findADateFromCalendar(min.subtract({ days: 1 }), calendar);
    const dayAfterMax = service.findADateFromCalendar(max.add({ days: 1 }), calendar);
    const dayInsideRange = service.findADateFromCalendar(anchor, calendar);

    expect(dayBeforeMin?.isDisabled).toBe(true);
    expect(dayAfterMax?.isDisabled).toBe(true);
    expect(dayInsideRange?.isDisabled).toBe(false);
  });

  it('accepts Date + ISO string bounds for min/max', () => {
    const currentDate = new Temporal.PlainDate(2024, 8, 15);
    const calendar = service.generateCalendarForMonth(currentDate, currentDate, [], {
      minDate: new Date(2024, 7, 10),
      maxDate: '2024-08-20',
    });

    expect(service.findADateFromCalendar('2024-08-09', calendar)?.isDisabled).toBe(true);
    expect(service.findADateFromCalendar('2024-08-21', calendar)?.isDisabled).toBe(true);
    expect(service.findADateFromCalendar('2024-08-15', calendar)?.isDisabled).toBe(false);
  });

  it('generates 12 month-picker entries with locale-aware names', () => {
    service.setLocale('en');
    const months = service.generateMonthPickerCollection(2024, NULL_RANGE);
    expect(months.length).toBe(12);
    expect(months[0].plainDate.month).toBe(1);
    expect(months[11].plainDate.month).toBe(12);
    expect(months[0].displayName.toLowerCase()).toContain('jan');
  });

  it('disables months outside the min/max range', () => {
    const months = service.generateMonthPickerCollection(2024, {
      minDate: new Temporal.PlainDate(2024, 4, 1),
      maxDate: new Temporal.PlainDate(2024, 6, 30),
    });

    expect(months[0].isDisabled).toBe(true);
    expect(months[3].isDisabled).toBe(false); // April
    expect(months[5].isDisabled).toBe(false); // June
    expect(months[6].isDisabled).toBe(true); // July
  });

  it('generates a year list inclusive of both endpoints', () => {
    const start = new Temporal.PlainDate(2020, 1, 1);
    const margin = 40;
    const years = service.getYearList(start, margin);
    expect(years.length).toBe(margin + 1);
    expect(years[0]).toBe(2020);
    expect(years[years.length - 1]).toBe(2020 + margin);
  });

  it('produces month calendar entries flagged as selected when preselected dates match', () => {
    const anchor = new Temporal.PlainDate(2024, 9, 10);
    const preselected = [anchor, anchor.add({ days: 1 })];
    const calendar = service.generateCalendarForMonth(anchor, anchor, preselected, NULL_RANGE);

    expect(service.findADateFromCalendar(preselected[0], calendar)?.isSelected).toBe(true);
    expect(service.findADateFromCalendar(preselected[1], calendar)?.isSelected).toBe(true);
    expect(service.findADateFromCalendar(anchor.add({ days: 3 }), calendar)?.isSelected).toBe(false);
  });

  it('returns 7 weekday and 12 month labels via Intl for the current locale', () => {
    service.setLocale('en');
    expect(service.getWeekdays().length).toBe(7);
    expect(service.getWeekdays(false).length).toBe(7);
    expect(service.getMonths().length).toBe(12);
    expect(service.getMonths(false).length).toBe(12);
  });

  it('determines the relativity of a date to the current month', () => {
    const currentMonth = new Temporal.PlainDate(2024, 3, 15);
    expect(
      service.determineDateRelativityToCurrentMonth(
        currentMonth.subtract({ months: 1 }),
        currentMonth
      )
    ).toBe(CalendarPeriodRelativityEnum.Before);
    expect(
      service.determineDateRelativityToCurrentMonth(currentMonth.add({ months: 1 }), currentMonth)
    ).toBe(CalendarPeriodRelativityEnum.After);
    expect(service.determineDateRelativityToCurrentMonth(currentMonth, currentMonth)).toBe(
      CalendarPeriodRelativityEnum.Current
    );
  });

  it('sortDatesAsc returns a new ascending array without mutating input', () => {
    const dates = [
      new Temporal.PlainDate(2024, 3, 10),
      new Temporal.PlainDate(2023, 5, 5),
      new Temporal.PlainDate(2024, 3, 1),
    ];
    const originalOrder = dates.slice();
    const sorted = service.sortDatesAsc(dates);

    expect(dates).toEqual(originalOrder);
    expect(sorted.map((d) => d.toString())).toEqual([
      '2023-05-05',
      '2024-03-01',
      '2024-03-10',
    ]);
  });

  it('getSelectedItemIndex uses calendar-day equality (ignoring time)', () => {
    const dates = [
      new Temporal.PlainDate(2024, 1, 1),
      new Temporal.PlainDate(2024, 6, 15),
      new Temporal.PlainDate(2025, 12, 31),
    ];
    expect(service.getSelectedItemIndex(new Temporal.PlainDate(2024, 6, 15), dates)).toBe(1);
    expect(service.getSelectedItemIndex(new Temporal.PlainDate(2024, 6, 16), dates)).toBe(-1);
  });

  it('toPlainDate normalises PlainDate, Date, ISO date, and ISO date-time strings', () => {
    const pd = new Temporal.PlainDate(2024, 2, 29);
    expect(service.toPlainDate(pd)).toBe(pd);
    expect(service.toPlainDate(new Date(2024, 1, 29))?.toString()).toBe('2024-02-29');
    expect(service.toPlainDate('2024-02-29')?.toString()).toBe('2024-02-29');
    expect(service.toPlainDate('2024-02-29T10:00:00')?.toString()).toBe('2024-02-29');
    expect(service.toPlainDate(null)).toBeNull();
    expect(service.toPlainDate(undefined)).toBeNull();
    expect(service.toPlainDate('not-a-date')).toBeNull();
  });
});
