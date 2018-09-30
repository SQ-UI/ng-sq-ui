import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimePickerComponent } from './datetime-picker.component';
import { FormsModule } from '@angular/forms';

import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';

// temporary fix for https://github.com/ng-packagr/ng-packagr/issues/217#issuecomment-360176759
import * as momentNs from 'moment';
import { CalendarManagerService } from '../calendar-manager.service';
const moment = momentNs;

describe('DatetimePickerComponent', () => {
  let component: DatetimePickerComponent;
  let fixture: ComponentFixture<DatetimePickerComponent>;
  let calendarManager: CalendarManagerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatetimePickerComponent ],
      imports: [
        FormsModule
      ],
      providers: [
        CalendarManagerService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimePickerComponent);
    component = fixture.componentInstance;
    calendarManager = TestBed.get(CalendarManagerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#should select a date correctly when [isMultipleSelect]=false', (done) => {
    component.calendar = component.getMonthCalendar(moment());
    const selectItem = component.calendar[2][5];
    component.isMultipleSelect = false;

    component.dateSelectionChange.subscribe((selectedValue) => {
      const isValueSame = selectedValue.isSame(selectItem.momentObj, 'day');
      const isValueSelected = selectItem.isSelected;
      const isEmittedValueSameAsComponentValue = Object.is(selectedValue, component.value);

      expect(isValueSame && isValueSelected && isEmittedValueSameAsComponentValue)
        .toBe(true, 'the selected date is correct');

      done();
    });

    component.select(selectItem);
    fixture.detectChanges();
  });

  it('#should select dates correctly when [isMultipleSelect]=true', (done: DoneFn) => {
    component.calendar = component.getMonthCalendar(moment());
    const expectedItems = [component.calendar[2][3], component.calendar[1][5]];
    component.isMultipleSelect = true;

    component.dateSelectionChange.subscribe((selectedValue) => {
      const isArray = Array.isArray(selectedValue);
      const isEmittedValueSameAsComponentValue = Object.is(selectedValue, component.value);
      const areValuesSameAndSelected = selectedValue.every((date, index) => {
        return date.isSame(expectedItems[index], 'day') && date.isSelected === true;
      });

      expect(isArray && areValuesSameAndSelected === false && isEmittedValueSameAsComponentValue)
        .toBe(true, 'the selected date is correct');

      done();
    });

    expectedItems.forEach((item) => {
      component.select(item);
    });

    fixture.detectChanges();
  });

  it('#should jump to previous month when a date before current month is selected', () => {
    // we are sure September 2018 doesn't start from Monday
    const monthWhichDoesNotStartWithTable = moment().year(2018).month(7);
    component.isMultipleSelect = false;
    component.calendar = component.getMonthCalendar(monthWhichDoesNotStartWithTable);
    const date = component.calendar[0][1];
    component.onDateClick(date);
    fixture.detectChanges();

    const isDateSelected = date.isSelected;
    const isCurrentMonthChanged = component.currentMonth.month() === date.momentObj.month();
    const isComponentValueSameAsSelectedDate = date.momentObj.isSame(component.value);

    expect(isDateSelected && isCurrentMonthChanged && isComponentValueSameAsSelectedDate)
      .toBe(true, 'the selected date is from previous month');
  });

  it('#should jump to next month when a date after current month is selected', () => {
    // we are sure September 2018 doesn't start from Monday
    const monthWhichDoesNotStartWithTable = moment().year(2018).month(7);
    component.isMultipleSelect = false;
    component.calendar = component.getMonthCalendar(monthWhichDoesNotStartWithTable);

    const date = component.calendar[5][1];
    component.onDateClick(date);
    fixture.detectChanges();

    const isDateSelected = date.isSelected;
    const isCurrentMonthChanged = component.currentMonth.month() === date.momentObj.month();
    const isComponentValueSameAsSelectedDate = date.momentObj.isSame(component.value);

    expect(isDateSelected && isCurrentMonthChanged && isComponentValueSameAsSelectedDate)
      .toBe(true, 'the selected date is from next month');
  });

  it('#should show only monthpicker when the user clicks on month name', () => {
    component.showMonthsPicker();
    const isOnlyMonthPickerShown = !component.isYearsPickerEnabled && component.isMonthsPickerEnabled;
    fixture.detectChanges();

    expect(isOnlyMonthPickerShown && component.period === CalendarPeriodTypeEnum.Month)
      .toBe(true, 'the selected date is from next month');
    expect(component.months).toBeTruthy();
  });

  it('#should generate a calendar corresponding to selected month', () => {
    component.showMonthsPicker();
    fixture.detectChanges();

    component.selectMonth(component.months[2]);
    fixture.detectChanges();

    const isCalendarCorrect = component.months[2].momentObj.isSame(component.currentMonth, 'month');

    expect(isCalendarCorrect && !component.isMonthsPickerEnabled)
      .toBe(true, 'the generated calendar is correct');
    expect(component.calendar).toBeTruthy();
  });

  it('#should show only yearpicker when the user clicks on year', () => {
    component.showYearsPicker();
    const isOnlyYearPickerShown = component.isYearsPickerEnabled && !component.isMonthsPickerEnabled;
    fixture.detectChanges();

    expect(isOnlyYearPickerShown && component.period === CalendarPeriodTypeEnum.Year)
      .toBe(true, 'the selected date is from next year');
    expect(component.yearsList).toBeTruthy();
  });

  it('#should show monthpicker when the user clicks on year from list', () => {
    component.showYearsPicker();
    component.selectYear(component.yearsList[0]);
    fixture.detectChanges();

    expect(!component.isYearsPickerEnabled && component.isMonthsPickerEnabled)
      .toBe(true, 'the selected date is from next year');
    expect(component.months).toBeTruthy();
  });

});

