import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatetimePickerComponent } from './datetime-picker.component';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { CalendarDay } from '../interfaces/calendar-entities';
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';

describe('DatetimePickerComponent', () => {
  let component: DatetimePickerComponent;
  let fixture: ComponentFixture<DatetimePickerComponent>;

  /** The calendar is derived state: look a day up in the current calendar, after any change. */
  function dayOf(date: Temporal.PlainDate): CalendarDay | undefined {
    return component.calendar()
      .reduce((acc, week) => acc.concat(week), [])
      .find(day => Temporal.PlainDate.compare(day.date, date) === 0);
  }

  function selectedDays(): CalendarDay[] {
    return component.calendar()
      .reduce((acc, week) => acc.concat(week), [])
      .filter(day => day.isSelected);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DatetimePickerComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimePickerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isTimepickerEnabled', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select a date correctly when [isMultipleSelect]=false', () => {
    return new Promise<void>((resolve) => {
      const now = Temporal.Now.plainDateISO();
      component.getMonthCalendar(now);
      const selectItem = component.calendar()[2][5];
      fixture.componentRef.setInput('isMultipleSelect', false);

      const subscription = component.dateSelectionChange.subscribe((selectedValue) => {
        expect(Temporal.PlainDate.compare(selectedValue as Temporal.PlainDate, selectItem.date)).toBe(0);
        expect(dayOf(selectItem.date)?.isSelected).toBe(true);
        expect(Object.is(selectedValue, component.value())).toBe(true);
        expect(selectedDays().length).toBe(1);

        subscription.unsubscribe();
        resolve();
      });

      component.select(selectItem);
      fixture.detectChanges();
    });
  });

  it('should select dates correctly when [isMultipleSelect]=true', () => {
    const now = Temporal.Now.plainDateISO();
    fixture.componentRef.setInput('isMultipleSelect', true);
    component.getMonthCalendar(now);
    const expectedItems = [now.add({ days: 1 }), now.add({ days: 4 })].map(date => dayOf(date)!);
    vi.spyOn(component, 'select');

    expectedItems.forEach((item) => {
      component.select(item);
      fixture.detectChanges();

      const currentValue = component.value();
      const selectedDates = Array.isArray(currentValue) ? currentValue : [];
      const addedDate = selectedDates.find((selectedDate) =>
        selectedDate instanceof Temporal.PlainDate && Temporal.PlainDate.compare(selectedDate, item.date) === 0
      );

      expect(Array.isArray(currentValue)).toBe(true);
      expect(addedDate).toBeDefined();
    });

    expect(component.select).toHaveBeenCalledTimes(expectedItems.length);
  });

  it('should deselect a date clicked twice when [isMultipleSelect]=true', () => {
    const now = Temporal.Now.plainDateISO();
    fixture.componentRef.setInput('isMultipleSelect', true);
    component.getMonthCalendar(now);
    const target = now.add({ days: 2 });

    component.select(dayOf(target)!);
    component.select(dayOf(target)!);
    fixture.detectChanges();

    expect(dayOf(target)?.isSelected).toBe(false);
  });

  it('should jump to previous month when a date before current month is selected', () => {
    // August 2018 doesn't start on the first column of the table
    const monthWhichDoesNotStartWithTable = Temporal.PlainDate.from({ year: 2018, month: 8, day: 1 });
    fixture.componentRef.setInput('isMultipleSelect', false);
    component.getMonthCalendar(monthWhichDoesNotStartWithTable);
    const date = component.calendar()[0][1];
    component.onDateClick(date);
    fixture.detectChanges();

    expect(component.currentMonth().month).toBe(date.date.month);
    expect(dayOf(date.date)?.isSelected).toBe(true);
    expect(Temporal.PlainDate.compare(date.date, component.value() as Temporal.PlainDate)).toBe(0);
  });

  it('should jump to next month when a date after current month is selected', () => {
    const monthWhichDoesNotStartWithTable = Temporal.PlainDate.from({ year: 2018, month: 8, day: 1 });
    fixture.componentRef.setInput('isMultipleSelect', false);
    component.getMonthCalendar(monthWhichDoesNotStartWithTable);

    const date = component.calendar()[5][1];
    component.onDateClick(date);
    fixture.detectChanges();

    expect(component.currentMonth().month).toBe(date.date.month);
    expect(dayOf(date.date)?.isSelected).toBe(true);
    expect(Temporal.PlainDate.compare(date.date, component.value() as Temporal.PlainDate)).toBe(0);
  });

  it('should ignore clicks on dates outside [minDate]/[maxDate]', () => {
    const today = Temporal.Now.plainDateISO();
    fixture.componentRef.setInput('minDate', today);
    fixture.detectChanges();
    const before = component.value();

    const disabledDay = { ...dayOf(today)!, date: today.subtract({ days: 1 }), isDisabled: true };
    component.onDateClick(disabledDay);

    expect(component.value()).toBe(before);
  });

  it('should ignore interaction while [disabled]', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const before = component.value();
    const month = component.currentMonth();

    component.onDateClick(component.calendar()[2][3]);
    component.next();
    component.showYearsPicker();

    expect(component.value()).toBe(before);
    expect(component.currentMonth()).toBe(month);
    expect(component.isYearsPickerEnabled()).toBe(false);
  });

  it('should show only monthpicker when the user clicks on month name', () => {
    component.showMonthsPicker();
    const isOnlyMonthPickerShown = !component.isYearsPickerEnabled() && component.isMonthsPickerEnabled();
    fixture.detectChanges();

    expect(isOnlyMonthPickerShown && component.period() === CalendarPeriodTypeEnum.Month)
      .toBe(true);
    expect(component.months()).toBeTruthy();
  });

  it('should keep the selection when browsing months and years', () => {
    const selected = Temporal.PlainDate.from({ year: 2026, month: 2, day: 17 });
    component.value.set(selected);
    fixture.detectChanges();

    component.showMonthsPicker();
    component.showYearsPicker();
    fixture.detectChanges();

    expect(component.value()).toEqual(selected);
  });

  it('should generate a calendar corresponding to selected month', () => {
    component.showMonthsPicker();
    fixture.detectChanges();

    component.selectMonth(component.months()[2]);
    fixture.detectChanges();

    expect(component.months()[2].date.month).toBe(component.currentMonth().month);
    expect(component.isMonthsPickerEnabled()).toBe(false);
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

  it('should page through years without repeating a year', () => {
    component.showYearsPicker();
    const first = component.yearsList().map(year => Number(year.displayName));

    component.next();
    const second = component.yearsList().map(year => Number(year.displayName));

    component.previous();
    const backToFirst = component.yearsList().map(year => Number(year.displayName));

    component.previous();
    const beforeFirst = component.yearsList().map(year => Number(year.displayName));

    expect(second[0]).toBe(first[first.length - 1] + 1);
    expect(backToFirst).toEqual(first);
    expect(beforeFirst[beforeFirst.length - 1]).toBe(first[0] - 1);
    expect(beforeFirst.length).toBe(first.length);
  });

  it('should show monthpicker when the user clicks on year from list', () => {
    component.showYearsPicker();
    component.selectYear(component.yearsList()[0]);
    fixture.detectChanges();

    expect(!component.isYearsPickerEnabled() && component.isMonthsPickerEnabled())
      .toBe(true);
    expect(component.months()).toBeTruthy();
  });

  it('should open on the month of the provided [value]', () => {
    const value = Temporal.PlainDate.from({ year: 2026, month: 2, day: 17 });
    const valueFixture = TestBed.createComponent(DatetimePickerComponent);
    valueFixture.componentRef.setInput('isTimepickerEnabled', false);
    valueFixture.componentRef.setInput('value', value);
    valueFixture.detectChanges();

    const picker = valueFixture.componentInstance;
    expect(picker.currentMonth().month).toEqual(2);
    expect(picker.currentMonth().year).toEqual(2026);

    const selectedDay = picker.calendar()
      .reduce((acc, week) => acc.concat(week), [])
      .find(day => day.isSelected);
    expect(selectedDay?.date.day).toEqual(17);
    expect(valueFixture.componentInstance.value()).toEqual(value);
  });

  it('should follow programmatic writes to the value model after init', () => {
    const later = Temporal.PlainDate.from({ year: 2030, month: 11, day: 5 });

    component.value.set(later);
    fixture.detectChanges();

    expect(component.currentMonth().year).toBe(2030);
    expect(component.currentMonth().month).toBe(11);
    expect(dayOf(later)?.isSelected).toBe(true);
    expect(selectedDays().length).toBe(1);
  });

  it('should clear the selection when the value is reset to null after init', () => {
    component.value.set(null);
    fixture.detectChanges();

    expect(selectedDays().length).toBe(0);
    expect(component.value()).toBeNull();
  });

  it('should fall back to today when no [value] is provided', () => {
    expect(component.currentMonth().month).toEqual(Temporal.Now.plainDateISO().month);
    expect(component.currentMonth().year).toEqual(Temporal.Now.plainDateISO().year);
  });

  it('should replace every occurrence of a [format] token', () => {
    fixture.componentRef.setInput('format', 'DD/MM/YYYY (YYYY)');
    fixture.detectChanges();

    component.value.set(Temporal.PlainDate.from({ year: 2026, month: 3, day: 9 }));
    fixture.detectChanges();

    expect(component.value()).toBe('09/03/2026 (2026)');
  });

  it('should apply a meridiem string time to the selected date', () => {
    fixture.componentRef.setInput('isTimepickerEnabled', true);
    fixture.detectChanges();

    component.onTimeChange('02:30 PM');

    const value = component.value() as Temporal.PlainDateTime;
    expect(value instanceof Temporal.PlainDateTime).toBe(true);
    expect(value.hour).toBe(14);
    expect(value.minute).toBe(30);
  });

  it('should emit touch when focus leaves the picker', () => {
    const touched = vi.fn();
    component.touch.subscribe(touched);
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('.datetime-picker-wrapper');
    const inner: HTMLElement = wrapper.querySelector('button')!;

    wrapper.dispatchEvent(new FocusEvent('focusout', { relatedTarget: inner, bubbles: true }));
    expect(touched).not.toHaveBeenCalled();

    wrapper.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body, bubbles: true }));
    expect(touched).toHaveBeenCalledTimes(1);
  });
});
