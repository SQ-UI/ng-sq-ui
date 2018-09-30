import { TestBed } from '@angular/core/testing';
import { CalendarPeriodRelativityEnum } from './enums/calendar-period-relativity.enum';
// temporary fix for https://github.com/ng-packagr/ng-packagr/issues/217#issuecomment-360176759
import * as momentNs from 'moment';
const moment = momentNs;

import { CalendarManagerService } from './calendar-manager.service';

let previouslySelectedYear;

function getYearList(start: momentNs.Moment, margin: number = 19): number[] {
  let yearIterator;
  let endYear;

  if (start) {
    previouslySelectedYear = start.clone();
  }

  if (margin < 0) {
    endYear = moment(previouslySelectedYear).add(margin, 'years');
    yearIterator = moment(endYear).add(margin, 'years');
  } else {
    yearIterator = moment(previouslySelectedYear);
    endYear = moment(yearIterator).add(margin, 'years');
  }

  const yearList = [];

  while (yearIterator.isSameOrBefore(endYear)) {
    yearList.push(yearIterator.clone().year());
    yearIterator.add(1, 'year');
  }

  previouslySelectedYear = yearIterator.subtract(1, 'year').clone();

  return yearList;
}

describe('CalendarManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    expect(service).toBeTruthy();
  });

  it('#should create a calendar month table correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const startDate = moment().startOf('month');
    const isStartOfTable = startDate.weekday() === 0;

    if (!isStartOfTable) {
      let daysToGoBack = startDate.weekday();
      daysToGoBack = (daysToGoBack === 0) ? 1 : daysToGoBack;
      startDate.subtract(daysToGoBack, 'days');
    }

    // the calendar should be 6 rows x 7 days
    const endDate = moment(startDate).add(41, 'days');

    const calendar = service.generateCalendarForMonth(moment(), moment(), [], {minDate: null, maxDate: null});
    const firstCalendarDay = calendar[0][0];
    const lastCalendarDay = calendar[calendar.length - 1][calendar[calendar.length - 1].length - 1];

    const firstDayIsCorrect = firstCalendarDay.momentObj.isSame(startDate, 'day');
    const lastDayIsCorrect = lastCalendarDay.momentObj.isSame(endDate, 'day');

    const everyRowHas7Days = calendar.every((row) => {
      return row.length === 7;
    });

    expect(firstDayIsCorrect && lastDayIsCorrect && calendar.length === 6 && everyRowHas7Days)
      .toBe(true, 'table should be 6 rows x 7 days and the starting day should be adjusted if needed');
  });

  it('#should find a date from month calendar correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const dayToFind = moment();

    const calendar = service.generateCalendarForMonth(moment(), moment(), [], {minDate: null, maxDate: null});
    const searchResult = service.findADateFromCalendar(dayToFind, calendar);

    expect((searchResult.momentObj).isSame(dayToFind, 'day'))
      .toBe(true, 'the search date and the result date should be the same month and day');
  });

  it('#should disable calendar dates that are outside the [min, max] range', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const minDate = moment().startOf('month');
    const maxDate = moment(minDate).add(7, 'days');

    const calendar = service.generateCalendarForMonth(moment(), moment(), [], {minDate: minDate, maxDate: maxDate});
    const dayBeforeMin = service.findADateFromCalendar(moment(minDate).subtract(1, 'day'), calendar);
    const dayAfterMax = service.findADateFromCalendar(moment(maxDate).add(1, 'day'), calendar);

    expect(dayBeforeMin.isDisabled && dayAfterMax.isDisabled)
      .toBe(true, 'the date before minDate and the date after maxDate should be disabled');
  });

  it('#should generate a list of years with a given margin correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const margin = 40;
    const startDate = moment();
    const endDate = moment(startDate).add(margin, 'years');

    const yearsList = service.getYearList(startDate, margin);

    expect(yearsList.length === margin + 1 &&
                yearsList[0] === startDate.year() &&
                yearsList[yearsList.length - 1] === endDate.year())
      .toBe(true, `the start date and the end date should be ${margin} years apart`);
  });

  it('#should generate a month calendar with preselected dates', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const preselectedDates = [moment(), moment().add(1, 'day')];
    const calendar = service.generateCalendarForMonth(moment(), moment(), preselectedDates, {minDate: null, maxDate: null});

    const preselectedDate1 = service.findADateFromCalendar(preselectedDates[0], calendar);
    const preselectedDate2 = service.findADateFromCalendar(preselectedDates[1], calendar);

    expect(preselectedDate1.isSelected && preselectedDate2.isSelected)
      .toBe(true, 'the preselected dates should be marked as selected in the calendar');
  });

  it('#should generate a list of months correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const momentMonthsLong = moment.months();
    const monthsListLong = service.getMonths(false);
    const momentMonthsShort = moment.monthsShort();
    const monthsListShort = service.getMonths();

    const longMonthsCorrect = monthsListLong.every((month, index) => {
      return month === momentMonthsLong[index];
    });

    const shortMonthsCorrect = momentMonthsShort.every((month, index) => {
      return month === monthsListShort[index];
    });

    expect(longMonthsCorrect && shortMonthsCorrect)
      .toBe(true, 'moment and service long and short months lists match');
  });

  it('#should generate a list of weekdays correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const momentWeekdaysLong = moment.weekdays();
    const weekdaysListLong = service.getWeekdays(false);
    const momentWeekdaysShort = moment.weekdaysShort();
    const weekdaysListShort = service.getWeekdays();

    const longWeekdaysCorrect = weekdaysListLong.every((month, index) => {
      return month === momentWeekdaysLong[index];
    });

    const shortWeekdaysCorrect = weekdaysListShort.every((month, index) => {
      return month === momentWeekdaysShort[index];
    });

    expect(longWeekdaysCorrect && shortWeekdaysCorrect)
      .toBe(true, 'moment and service long and short weekdays lists match');
  });

  it('#should determine date relativity correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const beforeCurrentMonthDate = moment().subtract(1, 'month');
    const afterCurrentMonthDate = moment().add(1, 'month');

    const beforeDateIsCorrectlyMarked = service.determineDateRelativityToCurrentMonth(beforeCurrentMonthDate, moment());
    const afterDateIsCorrectlyMarked = service.determineDateRelativityToCurrentMonth(afterCurrentMonthDate, moment());
    const currentDateIsCorrectlyMarked = service.determineDateRelativityToCurrentMonth(moment(), moment());

    expect(beforeDateIsCorrectlyMarked === CalendarPeriodRelativityEnum.Before &&
                afterDateIsCorrectlyMarked === CalendarPeriodRelativityEnum.After &&
                currentDateIsCorrectlyMarked === CalendarPeriodRelativityEnum.Current)
      .toBe(true, 'the dates are correctly marked relatively to the current month');
  });

  it('#should generate a month picker correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const momentMonthsShort = moment.monthsShort();
    const dateRange = {
      minDate: moment().add(1, 'month'),
      maxDate: moment().add(2, 'months')
    };

    const expectedPickerItems = momentMonthsShort.map((monthName, index) => {
      const date = moment().year(moment().year()).month(index);

      return {
        displayName: monthName,
        momentObj: date,
        isDisabled: service.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });

    const actualPickerItems = service.generateMonthPickerCollection(moment().year(), dateRange);

    const arePickerItemsCorrect = actualPickerItems.every((pickerItem, index) => {
      const isDisplayNameOK = pickerItem.displayName === expectedPickerItems[index].displayName;
      const isMomentObjOK = pickerItem.momentObj.isSame(expectedPickerItems[index].momentObj, 'day');
      const isDisabledOK = pickerItem.isDisabled === expectedPickerItems[index].isDisabled;

      return isDisplayNameOK && isMomentObjOK && isDisabledOK;
    });

    expect(arePickerItemsCorrect)
      .toBe(true, 'month picker items are correctly generated');
  });

  it('#should generate a year picker correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const margin = 20;
    const testYearsList = getYearList(moment(), margin);
    const dateRange = {
      minDate: moment().add(1, 'year'),
      maxDate: moment().add(2, 'years')
    };

    const expectedPickerItems = testYearsList.map((year) => {
      const date = moment().year(year);

      return {
        displayName: year.toString(),
        momentObj: date,
        isDisabled: service.determineIfDateIsDisabled(date, dateRange.minDate, dateRange.maxDate)
      };
    });

    const actualPickerItems = service.generateYearPickerCollection(moment(), margin, dateRange);

    const arePickerItemsCorrect = actualPickerItems.every((pickerItem, index) => {
      const isDisplayNameOK = pickerItem.displayName === expectedPickerItems[index].displayName;
      const isMomentObjOK = pickerItem.momentObj.isSame(expectedPickerItems[index].momentObj, 'day');
      const isDisabledOK = pickerItem.isDisabled === expectedPickerItems[index].isDisabled;

      return isDisplayNameOK && isMomentObjOK && isDisabledOK;
    });

    expect(arePickerItemsCorrect)
      .toBe(true, 'year picker items are correctly generated');
  });

  it('#should find the index of a selected date correctly', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    const preselectedDates = [moment().add(1, 'day'), moment(), moment().add(1, 'month'), moment().add(1, 'year')];
    const dateToFind = moment().add(1, 'month');

    const expectedIndex = preselectedDates.findIndex((selectedDate) => {
      return moment(selectedDate).isSame(dateToFind, 'day');
    });

    const actualIndex = service.getSelectedItemIndex(dateToFind, preselectedDates);

    expect(expectedIndex === actualIndex)
      .toBe(true, 'the returned date index is correct');
  });
});

