import { TestBed } from '@angular/core/testing';
import { Temporal } from '@js-temporal/polyfill';

import { CalendarManagerService } from '../calendar-manager.service';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { DatetimePickerComponent } from './datetime-picker.component';

type StubbableInput = 'locale' | 'minDate' | 'maxDate' | 'isMultipleSelect';

function stubInput<T>(component: DatetimePickerComponent, name: StubbableInput, value: T): void {
  Object.defineProperty(component, name, { value: () => value, configurable: true });
}

describe('DatetimePickerComponent', () => {
  let component: DatetimePickerComponent;
  let calendarManager: CalendarManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new DatetimePickerComponent());
    calendarManager = TestBed.inject(CalendarManagerService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise with an empty selection and the current month grid', () => {
    expect(component.value()).toBeNull();
    expect(component.calendar().length).toBe(6);
    expect(component.calendar().every((row) => row.length === 7)).toBe(true);
  });

  it('should select a single date when isMultipleSelect=false and expose PlainDate as value', () => {
    stubInput(component, 'isMultipleSelect', false);
    const cell = component.calendar()[2][3];

    let emitted: unknown = 'no-emit';
    component.dateSelectionChange.subscribe((v) => (emitted = v));

    component.select(cell);

    const value = component.value();
    expect(value instanceof Temporal.PlainDate).toBe(true);
    expect(Temporal.PlainDate.compare(value as Temporal.PlainDate, cell.plainDate)).toBe(0);
    expect(emitted).toBe(value);
  });

  it('should collect selections into an array when isMultipleSelect=true', () => {
    stubInput(component, 'isMultipleSelect', true);
    const first = component.calendar()[1][2];
    const second = component.calendar()[1][5];

    component.select(first);
    component.select(second);

    const value = component.value();
    expect(Array.isArray(value)).toBe(true);
    const arr = value as Temporal.PlainDate[];
    expect(arr.length).toBe(2);
    // The service returns sorted ascending on multi-select emission.
    expect(Temporal.PlainDate.compare(arr[0], arr[1])).toBeLessThanOrEqual(0);
    expect(arr.some((d) => Temporal.PlainDate.compare(d, first.plainDate) === 0)).toBe(true);
    expect(arr.some((d) => Temporal.PlainDate.compare(d, second.plainDate) === 0)).toBe(true);
  });

  it('toggles a previously selected date off when isMultipleSelect=true', () => {
    stubInput(component, 'isMultipleSelect', true);
    const cell = component.calendar()[2][2];

    component.select(cell);
    expect((component.value() as Temporal.PlainDate[]).length).toBe(1);

    // Re-fetch the same day from the (freshly-rendered) grid so we hit the same PlainDate.
    const refreshed = calendarManager.findADateFromCalendar(cell.plainDate, component.calendar());
    component.select(refreshed!);
    expect((component.value() as Temporal.PlainDate[]).length).toBe(0);
  });

  it('jumps to the previous month when a "before" cell is clicked', () => {
    // September 2024 starts on a Sunday — the first row has 5 "before" cells.
    component.currentMonth.set(new Temporal.PlainDate(2024, 9, 15));
    const beforeCell = component.calendar()[0][1];
    expect(beforeCell.plainDate.month).toBe(8);

    component.onDateClick(beforeCell);

    expect(component.currentMonth().month).toBe(8);
    expect(
      Temporal.PlainDate.compare(component.value() as Temporal.PlainDate, beforeCell.plainDate)
    ).toBe(0);
  });

  it('jumps to the next month when an "after" cell is clicked', () => {
    component.currentMonth.set(new Temporal.PlainDate(2024, 9, 15));
    const lastRow = component.calendar()[5];
    const afterCell = lastRow[lastRow.length - 1];
    expect(afterCell.plainDate.month).toBe(10);

    component.onDateClick(afterCell);

    expect(component.currentMonth().month).toBe(10);
    expect(
      Temporal.PlainDate.compare(component.value() as Temporal.PlainDate, afterCell.plainDate)
    ).toBe(0);
  });

  it('shows the months picker with 12 entries and switches period', () => {
    component.showMonthsPicker();
    expect(component.isMonthsPickerEnabled()).toBe(true);
    expect(component.isYearsPickerEnabled()).toBe(false);
    expect(component.period()).toBe(CalendarPeriodTypeEnum.Month);
    expect(component.months().length).toBe(12);
  });

  it('selectMonth switches the current month and closes the months picker', () => {
    component.showMonthsPicker();
    const march = component.months()[2];
    component.selectMonth(march);

    expect(component.isMonthsPickerEnabled()).toBe(false);
    expect(component.currentMonth().month).toBe(march.plainDate.month);
  });

  it('shows the years picker with entries and switches period', () => {
    component.showYearsPicker();
    expect(component.isYearsPickerEnabled()).toBe(true);
    expect(component.isMonthsPickerEnabled()).toBe(false);
    expect(component.period()).toBe(CalendarPeriodTypeEnum.Year);
    expect(component.yearsList().length).toBeGreaterThan(0);
  });

  it('selectYear from the years picker opens the months picker for that year', () => {
    component.showYearsPicker();
    const firstYear = component.yearsList()[0];
    component.selectYear(firstYear);

    expect(component.isMonthsPickerEnabled()).toBe(true);
    expect(component.isYearsPickerEnabled()).toBe(false);
    expect(component.currentMonth().year).toBe(firstYear.plainDate.year);
  });

  it('normalises a PlainDate value set externally into selectedDates', () => {
    const external = new Temporal.PlainDate(2024, 2, 29); // leap-day
    component.value.set(external);
    TestBed.tick();

    const cell = calendarManager.findADateFromCalendar(external, component.calendar());
    expect(cell?.isSelected).toBe(true);
    expect(component.currentMonth().year).toBe(2024);
    expect(component.currentMonth().month).toBe(2);
  });

  it('accepts an array of Date/ISO string values when isMultipleSelect=true', () => {
    stubInput(component, 'isMultipleSelect', true);
    component.value.set(['2024-05-01', new Date(2024, 4, 5)]);
    TestBed.tick();

    const may1 = calendarManager.findADateFromCalendar('2024-05-01', component.calendar());
    const may5 = calendarManager.findADateFromCalendar('2024-05-05', component.calendar());
    expect(may1?.isSelected).toBe(true);
    expect(may5?.isSelected).toBe(true);
  });
});
