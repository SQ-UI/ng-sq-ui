import { TestBed } from '@angular/core/testing';
import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';
import { Temporal } from '@js-temporal/polyfill';

import { CalendarManagerService } from './calendar-manager.service';

let previouslySelectedYear: Temporal.PlainDate;

function getYearList(start: Temporal.PlainDate, margin: number = 19): number[] {
  let yearIterator: Temporal.PlainDate;
  let endYear: Temporal.PlainDate;

  if (start) {
    previouslySelectedYear = start;
  }

  if (margin < 0) {
    endYear = previouslySelectedYear.add({ years: margin });
    yearIterator = endYear.add({ years: margin });
  } else {
    yearIterator = previouslySelectedYear;
    endYear = yearIterator.add({ years: margin });
  }

  const yearList: number[] = [];

  while (Temporal.PlainDate.compare(yearIterator, endYear) <= 0) {
    yearList.push(yearIterator.year);
    yearIterator = yearIterator.add({ years: 1 });
  }

  previouslySelectedYear = yearIterator.subtract({ years: 1 });

  return yearList;
}

describe('CalendarManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      CalendarManagerService
    ]
  }));

  it('should be created', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    expect(service).toBeTruthy();
  });

  it('should create a calendar month table correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();
    const monthStart = now.with({ day: 1 });

    // dayOfWeek: 1=Mon..7=Sun. Convert to Sunday=0 style for locale-aware offset.
    const startDayOfWeek = monthStart.dayOfWeek % 7; // Mon=1..Sat=6,Sun=0
    const isStartOfTable = startDayOfWeek === 0;

    let startDate = monthStart;
    if (!isStartOfTable) {
      let daysToGoBack = startDayOfWeek;
      daysToGoBack = (daysToGoBack === 0) ? 1 : daysToGoBack;
      startDate = startDate.subtract({ days: daysToGoBack });
    }

    // the calendar should be 6 rows x 7 days
    const endDate = startDate.add({ days: 41 });

    const calendar = service.generateCalendarForMonth(now, now, [], { minDate: null, maxDate: null });
    const firstCalendarDay = calendar[0][0];
    const lastCalendarDay = calendar[calendar.length - 1][calendar[calendar.length - 1].length - 1];

    const firstDayIsCorrect = Temporal.PlainDate.compare(firstCalendarDay.date, startDate) === 0;
    const lastDayIsCorrect = Temporal.PlainDate.compare(lastCalendarDay.date, endDate) === 0;

    const everyRowHas7Days = calendar.every((row) => {
      return row.length === 7;
    });

    expect(firstDayIsCorrect && lastDayIsCorrect && calendar.length === 6 && everyRowHas7Days)
      .toBe(true);
  });

  it('should find a date from month calendar correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();

    const calendar = service.generateCalendarForMonth(now, now, [], { minDate: null, maxDate: null });
    const searchResult = service.findADateFromCalendar(now, calendar);

    expect(Temporal.PlainDate.compare(searchResult.date, now) === 0)
      .toBe(true);
  });

  it('should disable calendar dates that are outside the [min, max] range', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();
    const minDate = now.with({ day: 1 }).add({ days: 3 });
    const maxDate = minDate.add({ days: 7 });

    const calendar = service.generateCalendarForMonth(now, now, [], { minDate: minDate, maxDate: maxDate });
    const dayBeforeMin = service.findADateFromCalendar(minDate.subtract({ days: 1 }), calendar);
    const dayAfterMax = service.findADateFromCalendar(maxDate.add({ days: 1 }), calendar);

    expect(dayBeforeMin.isDisabled && dayAfterMax.isDisabled)
      .toBe(true);
  });

  it('should generate a list of years with a given margin correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const margin = 40;
    const now = Temporal.Now.plainDateISO();
    const endDate = now.add({ years: margin });

    const yearsList = service.getYearList(now, margin);

    expect(yearsList.length === margin + 1 &&
      yearsList[0] === now.year &&
      yearsList[yearsList.length - 1] === endDate.year)
      .toBe(true);
  });

  it('should generate a month calendar with preselected dates', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();
    const preselectedDates = [now, now.add({ days: 1 })];
    const calendar = service.generateCalendarForMonth(now, now, preselectedDates, { minDate: null, maxDate: null });

    const preselectedDate1 = service.findADateFromCalendar(preselectedDates[0], calendar);
    const preselectedDate2 = service.findADateFromCalendar(preselectedDates[1], calendar);

    expect(preselectedDate1.isSelected && preselectedDate2.isSelected)
      .toBe(true);
  });

  it('should generate a list of months correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);

    // Generate expected month names using Intl (same approach as the service)
    const expectedMonthsLong: string[] = [];
    const expectedMonthsShort: string[] = [];
    for (let m = 1; m <= 12; m++) {
      const date = Temporal.PlainDate.from({ year: 2000, month: m, day: 1 });
      expectedMonthsLong.push(date.toLocaleString('en', { month: 'long' }));
      expectedMonthsShort.push(date.toLocaleString('en', { month: 'short' }));
    }

    const monthsListLong = service.getMonths(false);
    const monthsListShort = service.getMonths();

    const longMonthsCorrect = monthsListLong.every((month, index) => {
      return month === expectedMonthsLong[index];
    });

    const shortMonthsCorrect = expectedMonthsShort.every((month, index) => {
      return month === monthsListShort[index];
    });

    expect(longMonthsCorrect && shortMonthsCorrect)
      .toBe(true);
  });

  it('should generate a list of weekdays correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);

    // Generate expected weekday names using Intl (same approach as the service)
    const referenceSunday = Temporal.PlainDate.from('2023-01-01'); // Known Sunday
    const expectedWeekdaysLong: string[] = [];
    const expectedWeekdaysShort: string[] = [];
    for (let i = 0; i < 7; i++) {
      const day = referenceSunday.add({ days: i });
      expectedWeekdaysLong.push(day.toLocaleString('en', { weekday: 'long' }));
      expectedWeekdaysShort.push(day.toLocaleString('en', { weekday: 'short' }));
    }

    const weekdaysListLong = service.getWeekdays(false);
    const weekdaysListShort = service.getWeekdays();

    const longWeekdaysCorrect = weekdaysListLong.every((weekday, index) => {
      return weekday === expectedWeekdaysLong[index];
    });

    const shortWeekdaysCorrect = weekdaysListShort.every((weekday, index) => {
      return weekday === expectedWeekdaysShort[index];
    });

    expect(longWeekdaysCorrect && shortWeekdaysCorrect)
      .toBe(true);
  });

  it('should determine date relativity correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();
    const beforeCurrentMonthDate = now.subtract({ months: 1 });
    const afterCurrentMonthDate = now.add({ months: 1 });

    const beforeDateIsCorrectlyMarked = service.determineDateRelativityToCurrentMonth(beforeCurrentMonthDate, now);
    const afterDateIsCorrectlyMarked = service.determineDateRelativityToCurrentMonth(afterCurrentMonthDate, now);
    const currentDateIsCorrectlyMarked = service.determineDateRelativityToCurrentMonth(now, now);

    expect(beforeDateIsCorrectlyMarked === CalendarPeriodRelativityEnum.Before &&
      afterDateIsCorrectlyMarked === CalendarPeriodRelativityEnum.After &&
      currentDateIsCorrectlyMarked === CalendarPeriodRelativityEnum.Current)
      .toBe(true);
  });

  it('should generate a month picker correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();
    const monthsShort: string[] = [];
    for (let m = 1; m <= 12; m++) {
      const d = Temporal.PlainDate.from({ year: 2000, month: m, day: 1 });
      monthsShort.push(d.toLocaleString('en', { month: 'short' }));
    }

    const minDate = now.add({ months: 1 });
    const maxDate = now.add({ months: 2 });
    const dateRange = {
      minDate: minDate,
      maxDate: maxDate
    };

    const expectedPickerItems = monthsShort.map((monthName, index) => {
      const date = Temporal.PlainDate.from({ year: now.year, month: index + 1, day: 1 });

      return {
        displayName: monthName,
        date: date,
        isDisabled: service.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });

    const actualPickerItems = service.generateMonthPickerCollection(now.year, dateRange);

    const arePickerItemsCorrect = actualPickerItems.every((pickerItem, index) => {
      const isDisplayNameOK = pickerItem.displayName === expectedPickerItems[index].displayName;
      const isDateOK = Temporal.PlainDate.compare(pickerItem.date, expectedPickerItems[index].date) === 0;
      const isDisabledOK = pickerItem.isDisabled === expectedPickerItems[index].isDisabled;

      return isDisplayNameOK && isDateOK && isDisabledOK;
    });

    expect(arePickerItemsCorrect)
      .toBe(true);
  });

  it('should generate a year picker correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();
    const margin = 20;
    const testYearsList = getYearList(now, margin);
    const minDate = now.add({ years: 1 });
    const maxDate = now.add({ years: 2 });
    const dateRange = {
      minDate: minDate,
      maxDate: maxDate
    };

    const expectedPickerItems = testYearsList.map((year) => {
      const date = Temporal.PlainDate.from({ year: year, month: 1, day: 1 });

      return {
        displayName: year.toString(),
        date: date,
        isDisabled: service.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });

    const actualPickerItems = service.generateYearPickerCollection(now, margin, dateRange);

    const arePickerItemsCorrect = actualPickerItems.every((pickerItem, index) => {
      const isDisplayNameOK = pickerItem.displayName === expectedPickerItems[index].displayName;
      const isDateOK = Temporal.PlainDate.compare(pickerItem.date, expectedPickerItems[index].date) === 0;
      const isDisabledOK = pickerItem.isDisabled === expectedPickerItems[index].isDisabled;

      return isDisplayNameOK && isDateOK && isDisabledOK;
    });

    expect(arePickerItemsCorrect)
      .toBe(true);
  });

  it('should find the index of a selected date correctly', () => {
    const service: CalendarManagerService = TestBed.inject(CalendarManagerService);
    const now = Temporal.Now.plainDateISO();
    const preselectedDates = [now.add({ days: 1 }), now, now.add({ months: 1 }), now.add({ years: 1 })];
    const dateToFind = now.add({ months: 1 });

    const expectedIndex = preselectedDates.findIndex((selectedDate) => {
      return Temporal.PlainDate.compare(selectedDate, dateToFind) === 0;
    });

    const actualIndex = service.getSelectedItemIndex(dateToFind, preselectedDates);

    expect(expectedIndex === actualIndex)
      .toBe(true);
  });
});
