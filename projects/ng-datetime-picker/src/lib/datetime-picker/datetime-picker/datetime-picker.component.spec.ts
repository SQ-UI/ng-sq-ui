import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatetimePickerComponent } from './datetime-picker.component';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { CalendarManagerService } from '../calendar-manager.service';
import { Temporal } from '@js-temporal/polyfill';

describe('DatetimePickerComponent', () => {
  let component: DatetimePickerComponent;
  let fixture: ComponentFixture<DatetimePickerComponent>;
  let calendarManager: CalendarManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DatetimePickerComponent
      ],
      providers: [
        CalendarManagerService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimePickerComponent);
    component = fixture.componentInstance;
    calendarManager = TestBed.inject(CalendarManagerService);
    fixture.componentRef.setInput('isTimepickerEnabled', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a date correctly when [isMultipleSelect]=false', (done) => {
    const now = Temporal.Now.plainDateISO();
    component.calendar.set(component.getMonthCalendar(now));
    const selectItem = component.calendar()[2][5];
    fixture.componentRef.setInput('isMultipleSelect', false);

    const subscription = component.dateSelectionChange.subscribe((selectedValue) => {
      const isValueSame = Temporal.PlainDate.compare(selectedValue as Temporal.PlainDate, selectItem.date) === 0;
      const isValueSelected = selectItem.isSelected;
      const isEmittedValueSameAsComponentValue = Object.is(selectedValue, component.value());

      expect(isValueSame && isValueSelected && isEmittedValueSameAsComponentValue)
        .toBe(true);

      done();
      subscription.unsubscribe();
    });

    component.select(selectItem);
    fixture.detectChanges();
  });

  it('should select dates correctly when [isMultipleSelect]=true', () => {
    const now = Temporal.Now.plainDateISO();
    fixture.componentRef.setInput('isMultipleSelect', true);
    component.calendar.set(component.getMonthCalendar(now));
    const date1 = calendarManager.findADateFromCalendar(now.add({ days: 1 }), component.calendar());
    const date2 = calendarManager.findADateFromCalendar(now.add({ days: 4 }), component.calendar());
    const expectedItems = [date1, date2];
    vi.spyOn(component, 'select');

    expectedItems.forEach((item, index) => {
      component.select(item);
      fixture.detectChanges();

      const currentValue = component.value();
      const isArray = Array.isArray(currentValue);
      const addedDate = currentValue.find((selectedDate: Temporal.PlainDate) => {
        return Temporal.PlainDate.compare(selectedDate, item.date) === 0;
      });

      const areValuesSameAndSelected = !!addedDate;

      expect(isArray && areValuesSameAndSelected)
        .toBe(true);
    });

    expect(component.select).toHaveBeenCalledTimes(expectedItems.length);
  });

  it('should jump to previous month when a date before current month is selected', () => {
    // we are sure September 2018 doesn't start from Monday
    const monthWhichDoesNotStartWithTable = Temporal.PlainDate.from({ year: 2018, month: 8, day: 1 });
    fixture.componentRef.setInput('isMultipleSelect', false);
    component.calendar.set(component.getMonthCalendar(monthWhichDoesNotStartWithTable));
    const date = component.calendar()[0][1];
    component.onDateClick(date);
    fixture.detectChanges();

    const isDateSelected = date.isSelected;
    const isCurrentMonthChanged = component.currentMonth().month === date.date.month;
    const isComponentValueSameAsSelectedDate = Temporal.PlainDate.compare(date.date, component.value() as Temporal.PlainDate) === 0;

    expect(isDateSelected && isCurrentMonthChanged && isComponentValueSameAsSelectedDate)
      .toBe(true);
  });

  it('should jump to next month when a date after current month is selected', () => {
    // we are sure September 2018 doesn't start from Monday
    const monthWhichDoesNotStartWithTable = Temporal.PlainDate.from({ year: 2018, month: 8, day: 1 });
    fixture.componentRef.setInput('isMultipleSelect', false);
    component.calendar.set(component.getMonthCalendar(monthWhichDoesNotStartWithTable));

    const date = component.calendar()[5][1];
    component.onDateClick(date);
    fixture.detectChanges();

    const isDateSelected = date.isSelected;
    const isCurrentMonthChanged = component.currentMonth().month === date.date.month;
    const isComponentValueSameAsSelectedDate = Temporal.PlainDate.compare(date.date, component.value() as Temporal.PlainDate) === 0;

    expect(isDateSelected && isCurrentMonthChanged && isComponentValueSameAsSelectedDate)
      .toBe(true);
  });

  it('should show only monthpicker when the user clicks on month name', () => {
    component.showMonthsPicker();
    const isOnlyMonthPickerShown = !component.isYearsPickerEnabled() && component.isMonthsPickerEnabled();
    fixture.detectChanges();

    expect(isOnlyMonthPickerShown && component.period() === CalendarPeriodTypeEnum.Month)
      .toBe(true);
    expect(component.months()).toBeTruthy();
  });

  it('should generate a calendar corresponding to selected month', () => {
    component.showMonthsPicker();
    fixture.detectChanges();

    component.selectMonth(component.months()[2]);
    fixture.detectChanges();

    const isCalendarCorrect = component.months()[2].date.month === component.currentMonth().month;

    expect(isCalendarCorrect && !component.isMonthsPickerEnabled())
      .toBe(true);
    expect(component.calendar()).toBeTruthy();
  });

  it('should show only yearpicker when the user clicks on year', () => {
    component.showYearsPicker();
    const isOnlyYearPickerShown = component.isYearsPickerEnabled() && !component.isMonthsPickerEnabled();
    fixture.detectChanges();

    expect(isOnlyYearPickerShown && component.period() === CalendarPeriodTypeEnum.Year)
      .toBe(true);
    expect(component.yearsList()).toBeTruthy();
  });

  it('should show monthpicker when the user clicks on year from list', () => {
    component.showYearsPicker();
    component.selectYear(component.yearsList()[0]);
    fixture.detectChanges();

    expect(!component.isYearsPickerEnabled() && component.isMonthsPickerEnabled())
      .toBe(true);
    expect(component.months()).toBeTruthy();
  });

});
