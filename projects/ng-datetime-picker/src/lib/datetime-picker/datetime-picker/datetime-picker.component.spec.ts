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

  describe('range selection ([isMultipleSelect]=true)', () => {
    const march = (day: number) => Temporal.PlainDate.from({ year: 2026, month: 3, day });
    const valueDays = () => (component.value() as Temporal.PlainDate[]).map(date => date.toString());

    beforeEach(() => {
      fixture.componentRef.setInput('isMultipleSelect', true);
      fixture.detectChanges();
      component.getMonthCalendar(march(1));
      fixture.detectChanges();
    });

    it('should start a range on the first click and fill it in on the second', () => {
      const emitted: unknown[] = [];
      component.dateSelectionChange.subscribe(value => emitted.push(value));

      component.onDateClick(dayOf(march(10))!);
      expect(component.pendingRangeStart()?.toString()).toBe('2026-03-10');
      expect(valueDays()).toEqual(['2026-03-10']);
      expect(dayOf(march(10))?.isRangeStart).toBe(true);

      component.onDateClick(dayOf(march(13))!);
      fixture.detectChanges();

      expect(component.pendingRangeStart()).toBeNull();
      expect(valueDays()).toEqual(['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13']);
      expect([10, 11, 12, 13].every(day => dayOf(march(day))?.isSelected)).toBe(true);
      expect(dayOf(march(9))?.isSelected).toBe(false);
      expect(dayOf(march(14))?.isSelected).toBe(false);
      expect(dayOf(march(10))?.isRangeStart).toBe(true);
      expect(dayOf(march(13))?.isRangeEnd).toBe(true);
      expect(emitted.length).toBe(2);
    });

    it('should not accept an end date before the start date', () => {
      const emitted: unknown[] = [];
      component.onDateClick(dayOf(march(10))!);
      component.dateSelectionChange.subscribe(value => emitted.push(value));

      expect(dayOf(march(9))?.isBeforeRangeStart).toBe(true);
      expect(component.select(dayOf(march(9))!)).toBe(false);
      component.onDateClick(dayOf(march(5))!);

      expect(valueDays()).toEqual(['2026-03-10']);
      expect(component.pendingRangeStart()?.toString()).toBe('2026-03-10');
      expect(emitted).toEqual([]);
    });

    it('should not change the month when a rejected end date belongs to the previous month', () => {
      // April 2026 starts on a Wednesday, so its first row shows the end of March.
      component.getMonthCalendar(Temporal.PlainDate.from('2026-04-01'));
      component.onDateClick(dayOf(Temporal.PlainDate.from('2026-04-10'))!);
      const previousMonthDay = component.calendar()[0][0];
      expect(previousMonthDay.date.month).toBe(3);

      component.onDateClick(previousMonthDay);

      expect(component.currentMonth().month).toBe(4);
      expect(valueDays()).toEqual(['2026-04-10']);
    });

    it('should keep the pending start date while changing the month', () => {
      component.onDateClick(dayOf(march(30))!);

      component.next();
      component.previous();
      component.next();
      component.showMonthsPicker();
      component.selectMonth(component.months()[3]); // April
      fixture.detectChanges();

      expect(component.pendingRangeStart()?.toString()).toBe('2026-03-30');

      component.onDateClick(dayOf(Temporal.PlainDate.from('2026-04-02'))!);

      expect(valueDays()).toEqual(['2026-03-30', '2026-03-31', '2026-04-01', '2026-04-02']);
    });

    it('should preview the range while the mouse moves over the days', () => {
      component.onDateClick(dayOf(march(10))!);
      const mouse = { pointerType: 'mouse' } as PointerEvent;

      component.onDateHover(dayOf(march(12))!, mouse);
      fixture.detectChanges();

      expect([11, 12].every(day => dayOf(march(day))?.isInRangePreview)).toBe(true);
      expect(dayOf(march(12))?.isRangeEnd).toBe(true);
      expect(dayOf(march(13))?.isInRangePreview).toBe(false);
      expect(fixture.nativeElement.querySelectorAll('.cell.range-preview').length).toBe(2);

      // Hovering before the start previews nothing.
      component.onDateHover(dayOf(march(8))!, mouse);
      expect(component.calendar().flat().some(day => day.isInRangePreview)).toBe(false);

      component.onDateHover(dayOf(march(12))!, mouse);
      component.onCalendarLeave();
      expect(component.calendar().flat().some(day => day.isInRangePreview)).toBe(false);
    });

    it('should ignore touch input for the hover preview', () => {
      component.onDateClick(dayOf(march(10))!);

      component.onDateHover(dayOf(march(12))!, { pointerType: 'touch' } as PointerEvent);

      expect(component.calendar().flat().some(day => day.isInRangePreview)).toBe(false);
    });

    it('should select a single day when the start date is clicked again', () => {
      component.onDateClick(dayOf(march(10))!);
      component.onDateClick(dayOf(march(10))!);

      expect(valueDays()).toEqual(['2026-03-10']);
      expect(component.pendingRangeStart()).toBeNull();
    });

    it('should start a new range after a completed one', () => {
      component.onDateClick(dayOf(march(10))!);
      component.onDateClick(dayOf(march(12))!);
      component.onDateClick(dayOf(march(3))!);

      expect(valueDays()).toEqual(['2026-03-03']);
      expect(component.pendingRangeStart()?.toString()).toBe('2026-03-03');
    });

    it('should drop the pending start when a value is written from outside', () => {
      component.onDateClick(dayOf(march(10))!);

      component.value.set([march(20), march(21)]);
      fixture.detectChanges();

      expect(component.pendingRangeStart()).toBeNull();
      expect(dayOf(march(20))?.isRangeStart).toBe(true);
      expect(dayOf(march(21))?.isRangeEnd).toBe(true);
    });
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
