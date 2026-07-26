import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { DatetimePickerComponent } from './datetime-picker.component';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { CalendarManagerService } from '../calendar-manager.service';
import { Temporal } from '@js-temporal/polyfill';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TimePickerStubComponent),
  multi: true,
};

@Component({
  selector: 'sq-time-picker',
  templateUrl: '../time-picker/time-picker.component.html',
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
  standalone: false
})
class TimePickerStubComponent extends TimePickerComponent {
  constructor() {
    super();
  }
}

describe('DatetimePickerComponent', () => {
  let component: DatetimePickerComponent;
  let fixture: ComponentFixture<DatetimePickerComponent>;
  let calendarManager: CalendarManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TimePickerStubComponent,
        DatetimePickerComponent
      ],
      imports: [
        FormsModule
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
    component.isTimepickerEnabled = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a date correctly when [isMultipleSelect]=false', (done) => {
    const now = Temporal.Now.plainDateISO();
    component.calendar = component.getMonthCalendar(now);
    const selectItem = component.calendar[2][5];
    component.isMultipleSelect = false;

    const subscription = component.dateSelectionChange.subscribe((selectedValue) => {
      const isValueSame = Temporal.PlainDate.compare(selectedValue as Temporal.PlainDate, selectItem.date) === 0;
      const isValueSelected = selectItem.isSelected;
      const isEmittedValueSameAsComponentValue = Object.is(selectedValue, component.value);

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
    component.isMultipleSelect = true;
    component.calendar = component.getMonthCalendar(now);
    const date1 = calendarManager.findADateFromCalendar(now.add({ days: 1 }), component.calendar);
    const date2 = calendarManager.findADateFromCalendar(now.add({ days: 4 }), component.calendar);
    const expectedItems = [date1, date2];
    vi.spyOn(component, 'select');

    expectedItems.forEach((item, index) => {
      component.select(item);
      fixture.detectChanges();

      const isArray = Array.isArray(component.value);
      const addedDate = component.value.find((selectedDate: Temporal.PlainDate) => {
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
    component.isMultipleSelect = false;
    component.calendar = component.getMonthCalendar(monthWhichDoesNotStartWithTable);
    const date = component.calendar[0][1];
    component.onDateClick(date);
    fixture.detectChanges();

    const isDateSelected = date.isSelected;
    const isCurrentMonthChanged = component.currentMonth.month === date.date.month;
    const isComponentValueSameAsSelectedDate = Temporal.PlainDate.compare(date.date, component.value as Temporal.PlainDate) === 0;

    expect(isDateSelected && isCurrentMonthChanged && isComponentValueSameAsSelectedDate)
      .toBe(true);
  });

  it('should jump to next month when a date after current month is selected', () => {
    // we are sure September 2018 doesn't start from Monday
    const monthWhichDoesNotStartWithTable = Temporal.PlainDate.from({ year: 2018, month: 8, day: 1 });
    component.isMultipleSelect = false;
    component.calendar = component.getMonthCalendar(monthWhichDoesNotStartWithTable);

    const date = component.calendar[5][1];
    component.onDateClick(date);
    fixture.detectChanges();

    const isDateSelected = date.isSelected;
    const isCurrentMonthChanged = component.currentMonth.month === date.date.month;
    const isComponentValueSameAsSelectedDate = Temporal.PlainDate.compare(date.date, component.value as Temporal.PlainDate) === 0;

    expect(isDateSelected && isCurrentMonthChanged && isComponentValueSameAsSelectedDate)
      .toBe(true);
  });

  it('should show only monthpicker when the user clicks on month name', () => {
    component.showMonthsPicker();
    const isOnlyMonthPickerShown = !component.isYearsPickerEnabled && component.isMonthsPickerEnabled;
    fixture.detectChanges();

    expect(isOnlyMonthPickerShown && component.period === CalendarPeriodTypeEnum.Month)
      .toBe(true);
    expect(component.months).toBeTruthy();
  });

  it('should generate a calendar corresponding to selected month', () => {
    component.showMonthsPicker();
    fixture.detectChanges();

    component.selectMonth(component.months[2]);
    fixture.detectChanges();

    const isCalendarCorrect = component.months[2].date.month === component.currentMonth.month;

    expect(isCalendarCorrect && !component.isMonthsPickerEnabled)
      .toBe(true);
    expect(component.calendar).toBeTruthy();
  });

  it('should show only yearpicker when the user clicks on year', () => {
    component.showYearsPicker();
    const isOnlyYearPickerShown = component.isYearsPickerEnabled && !component.isMonthsPickerEnabled;
    fixture.detectChanges();

    expect(isOnlyYearPickerShown && component.period === CalendarPeriodTypeEnum.Year)
      .toBe(true);
    expect(component.yearsList).toBeTruthy();
  });

  it('should show monthpicker when the user clicks on year from list', () => {
    component.showYearsPicker();
    component.selectYear(component.yearsList[0]);
    fixture.detectChanges();

    expect(!component.isYearsPickerEnabled && component.isMonthsPickerEnabled)
      .toBe(true);
    expect(component.months).toBeTruthy();
  });

});
