import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Temporal } from '@js-temporal/polyfill';
import { SqInputCore } from '@sq-ui/ng-sq-common';

import { CalendarManagerService } from '../calendar-manager.service';
import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { CalendarDay, InCalendarPicker } from '../interfaces/calendar-entities';
import { DateRange, DateRangeBound } from '../interfaces/date-range';

export type DatetimePickerValue = Temporal.PlainDate | Temporal.PlainDate[] | null;

/**
 * Signal Forms-compatible date picker.
 *
 * The canonical `value` is a `Temporal.PlainDate` when `isMultipleSelect` is
 * false, an array of `Temporal.PlainDate` when multi-select is on, or `null`
 * when nothing is selected. `minDate`/`maxDate` accept `PlainDate`, native
 * `Date`, or ISO strings and are normalised internally by
 * {@link CalendarManagerService}.
 */
@Component({
  selector: 'sq-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class DatetimePickerComponent extends SqInputCore implements FormValueControl<DatetimePickerValue> {
  private readonly calendarManager = inject(CalendarManagerService);

  readonly value = model<DatetimePickerValue>(null);

  readonly locale = input<string>('en');
  readonly minDate = input<DateRangeBound | null>(null);
  readonly maxDate = input<DateRangeBound | null>(null);
  readonly isMultipleSelect = input<boolean>(false);

  readonly dateSelectionChange = output<DatetimePickerValue>();

  readonly currentMonth = signal<Temporal.PlainDate>(Temporal.Now.plainDateISO());
  readonly isMonthsPickerEnabled = signal(false);
  readonly isYearsPickerEnabled = signal(false);
  readonly period = signal<CalendarPeriodTypeEnum>(CalendarPeriodTypeEnum.Month);
  readonly yearsList = signal<InCalendarPicker[]>([]);

  readonly weekdays = computed(() => this.calendarManager.getWeekdays(true, this.locale()));

  readonly selectedDates = computed<Temporal.PlainDate[]>(() => this.normalizeValue(this.value()));

  readonly calendar = computed<CalendarDay[][]>(() => {
    const start = this.currentMonth();
    return this.calendarManager.generateCalendarForMonth(
      start,
      start,
      this.selectedDates(),
      this.dateRange()
    );
  });

  readonly months = computed<InCalendarPicker[]>(() =>
    this.calendarManager.generateMonthPickerCollection(
      this.currentMonth().year,
      this.dateRange(),
      this.locale()
    )
  );

  readonly currentMonthLabel = computed(() => {
    const m = this.currentMonth();
    const formatter = new Intl.DateTimeFormat(this.locale(), { month: 'long' });
    return formatter.format(new Date(Date.UTC(m.year, m.month - 1, 15)));
  });
  readonly currentYearLabel = computed(() => String(this.currentMonth().year));

  readonly calendarPeriodRelativity = CalendarPeriodRelativityEnum;

  constructor() {
    super();

    // Keep the visible month in sync with an externally-set value so the
    // selected date is actually visible in the grid. Runs on effect flush,
    // which is fine — the calendar computation is orthogonal to it.
    effect(() => {
      const dates = this.selectedDates();
      if (dates.length === 0) {
        return;
      }
      untracked(() => {
        const first = dates[0];
        const current = this.currentMonth();
        if (current.year !== first.year || current.month !== first.month) {
          this.currentMonth.set(first.with({ day: 1 }));
        }
      });
    });
  }

  onDateClick(date: CalendarDay): void {
    switch (date.relativityToCurrentMonth) {
      case CalendarPeriodRelativityEnum.After:
        this.select(date);
        this.currentMonth.update((m) => m.add({ months: 1 }));
        break;
      case CalendarPeriodRelativityEnum.Before:
        this.select(date);
        this.currentMonth.update((m) => m.subtract({ months: 1 }));
        break;
      default:
        this.select(date);
    }
  }

  select(date: CalendarDay): void {
    this.commitSelection(date.plainDate);
  }

  next(): void {
    if (this.period() === CalendarPeriodTypeEnum.Month) {
      this.currentMonth.update((m) => m.add({ months: 1 }));
      return;
    }

    if (this.period() === CalendarPeriodTypeEnum.Year) {
      this.yearsList.set(
        this.calendarManager.generateYearPickerCollection(null, 19, this.dateRange())
      );
    }
  }

  previous(): void {
    if (this.period() === CalendarPeriodTypeEnum.Month) {
      this.currentMonth.update((m) => m.subtract({ months: 1 }));
      return;
    }

    if (this.period() === CalendarPeriodTypeEnum.Year) {
      this.yearsList.set(
        this.calendarManager.generateYearPickerCollection(null, -19, this.dateRange())
      );
    }
  }

  showMonthsPicker(year: number = this.currentMonth().year): void {
    this.clearSelection();
    this.isYearsPickerEnabled.set(false);
    this.isMonthsPickerEnabled.set(true);
    this.currentMonth.update((m) => m.with({ year }));
    this.period.set(CalendarPeriodTypeEnum.Month);
  }

  showYearsPicker(): void {
    this.clearSelection();
    this.isMonthsPickerEnabled.set(false);
    this.isYearsPickerEnabled.set(true);
    this.period.set(CalendarPeriodTypeEnum.Year);
    this.yearsList.set(
      this.calendarManager.generateYearPickerCollection(this.currentMonth(), 19, this.dateRange())
    );
  }

  selectMonth(month: InCalendarPicker): void {
    this.currentMonth.set(month.plainDate.with({ day: 1 }));
    this.isMonthsPickerEnabled.set(false);
  }

  selectYear(year: InCalendarPicker): void {
    this.showMonthsPicker(year.plainDate.year);
  }

  private commitSelection(date: Temporal.PlainDate): void {
    const existing = this.selectedDates();
    let nextDates: Temporal.PlainDate[];

    if (this.isMultipleSelect()) {
      const idx = this.calendarManager.getSelectedItemIndex(date, existing);
      if (idx > -1) {
        nextDates = existing.filter((_, i) => i !== idx);
      } else {
        nextDates = [...existing, date];
      }
      nextDates = this.calendarManager.sortDatesAsc(nextDates);
    } else {
      nextDates = [date];
    }

    const nextValue: DatetimePickerValue = this.isMultipleSelect()
      ? nextDates
      : nextDates[0] ?? null;

    this.value.set(nextValue);
    this.dateSelectionChange.emit(nextValue);
  }

  private clearSelection(): void {
    const nextValue: DatetimePickerValue = this.isMultipleSelect() ? [] : null;
    this.value.set(nextValue);
    this.dateSelectionChange.emit(nextValue);
  }

  private normalizeValue(value: DatetimePickerValue): Temporal.PlainDate[] {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value
        .map((v) => this.calendarManager.toPlainDate(v))
        .filter((d): d is Temporal.PlainDate => !!d);
    }
    const normalised = this.calendarManager.toPlainDate(value);
    return normalised ? [normalised] : [];
  }

  private dateRange(): DateRange {
    return { minDate: this.minDate(), maxDate: this.maxDate() };
  }
}
