import {
  Component, ViewEncapsulation,
  ChangeDetectionStrategy, input, model, output, signal, computed,
  effect, untracked, inject
} from '@angular/core';
import { NgClass } from '@angular/common';
import { CalendarDay, InCalendarPicker } from '../interfaces/calendar-entities';
import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import { DateRange } from '../interfaces/date-range';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { DateObjectType } from '../enums/date-object-type.enum';
import { TimepickerConfig } from '../interfaces/timepicker-config';
import { CalendarManagerService } from '../calendar-manager.service';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { FORM_FIELD_DEFAULTS, generateFormFieldId } from '@sq-ui/ng-sq-common';
import type { SqFormFieldSignals, SqFormValueControl } from '@sq-ui/ng-sq-common';
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';
import type { DatetimePickerDate, DatetimePickerValue, TimePickerValue } from '../interfaces/datetime-picker-value';

/** The date shapes the picker tracks internally before converting to the configured output type. */
type TemporalCalendarDate = Temporal.PlainDate | Temporal.PlainDateTime;

/** Marks "nothing emitted yet", so the first `value` read is always applied. */
const NOT_EMITTED = Symbol('not-emitted');

@Component({
  selector: 'sq-datetime-picker',
  standalone: true,
  imports: [NgClass, TimePickerComponent],
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CalendarManagerService]
})
export class DatetimePickerComponent implements SqFormFieldSignals, SqFormValueControl<DatetimePickerValue> {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>(FORM_FIELD_DEFAULTS.controlLabel);
  readonly controlPlaceholder = input<string>(FORM_FIELD_DEFAULTS.controlPlaceholder);
  readonly required = input<boolean>(FORM_FIELD_DEFAULTS.required);
  readonly pattern = input<readonly RegExp[]>(FORM_FIELD_DEFAULTS.pattern);
  readonly disabled = input<boolean>(FORM_FIELD_DEFAULTS.disabled);

  /** Signals that the user left the control, so `[formField]` can mark the field as touched. */
  readonly touch = output<void>();

  // Component-specific signal inputs
  readonly locale = input<string>('en');
  readonly maxDate = input<Temporal.PlainDate | Date | undefined>(undefined);
  readonly minDate = input<Temporal.PlainDate | Date | undefined>(undefined);
  readonly isMultipleSelect = input<boolean>(false);
  readonly format = input<string | undefined>(undefined);
  readonly isTimepickerEnabled = input<boolean>(false);
  readonly dateObjectType = input<string>(DateObjectType.PlainDate);
  readonly timepickerConfig = input<TimepickerConfig | undefined>(undefined);

  // Two-way binding model
  readonly value = model<DatetimePickerValue>(null);

  // Output
  readonly dateSelectionChange = output<DatetimePickerValue>();

  private readonly calendarManager = inject(CalendarManagerService);

  // Internal state
  readonly months = signal<InCalendarPicker[]>([]);
  readonly yearsList = signal<InCalendarPicker[]>([]);
  readonly currentMonth = signal<Temporal.PlainDate>(Temporal.Now.plainDateISO());
  readonly isMonthsPickerEnabled = signal<boolean>(false);
  readonly isYearsPickerEnabled = signal<boolean>(false);
  readonly time = signal<TimePickerValue>(null);
  readonly period = signal<CalendarPeriodTypeEnum>(CalendarPeriodTypeEnum.Month);

  readonly calendarPeriodRelativity = CalendarPeriodRelativityEnum;

  private readonly selectedDates = signal<Temporal.PlainDate[]>([]);

  private readonly dateRange = computed<DateRange>(() => ({
    minDate: this.minDate(),
    maxDate: this.maxDate(),
  }));

  readonly weekdays = computed(() => this.calendarManager.getWeekdays(true, this.locale()));

  /**
   * Range selection (`[isMultipleSelect]`): the start date picked by the first click, while the user
   * has not picked the end date yet. Independent of the visible month, so navigating keeps it.
   */
  readonly pendingRangeStart = signal<Temporal.PlainDate | null>(null);

  /** Range selection: the day under the mouse, used to preview the range before the second click. */
  private readonly hoveredDate = signal<Temporal.PlainDate | null>(null);

  /** Derived from the visible month, the selection and the range, so it is never mutated in place. */
  readonly calendar = computed<Array<CalendarDay[]>>(() => {
    const month = this.currentMonth();
    const selectedDates = this.selectedDates();
    const calendar = this.calendarManager.generateCalendarForMonth(month, month, selectedDates, this.dateRange());

    if (!this.isMultipleSelect()) {
      return calendar;
    }

    const compare = Temporal.PlainDate.compare;
    const pendingStart = this.pendingRangeStart();

    if (pendingStart) {
      const hovered = this.hoveredDate();
      const previewEnd = hovered && compare(hovered, pendingStart) > 0 ? hovered : null;

      return calendar.map(week => week.map(day => {
        const toStart = compare(day.date, pendingStart);
        const toPreviewEnd = previewEnd ? compare(day.date, previewEnd) : 1;

        return {
          ...day,
          isRangeStart: toStart === 0,
          isRangeEnd: toPreviewEnd === 0,
          isInRangePreview: toStart > 0 && toPreviewEnd <= 0,
          isBeforeRangeStart: toStart < 0,
        };
      }));
    }

    const rangeStart = selectedDates[0];
    const rangeEnd = selectedDates[selectedDates.length - 1];

    if (!rangeStart) {
      return calendar;
    }

    return calendar.map(week => week.map(day => ({
      ...day,
      isRangeStart: compare(day.date, rangeStart) === 0,
      isRangeEnd: compare(day.date, rangeEnd) === 0,
    })));
  });

  readonly currentMonthName = computed(() => {
    const month = this.currentMonth();
    if (!month) {
      return '';
    }
    return month.toLocaleString(this.locale(), { month: 'long' });
  });

  /** The value this component last wrote, so its own echo through `[(value)]` is ignored. */
  private lastEmittedValue: DatetimePickerValue | typeof NOT_EMITTED = NOT_EMITTED;

  constructor() {
    // Month names for the month picker follow `[locale]`.
    effect(() => {
      const locale = this.locale();
      untracked(() => this.calendarManager.setLocale(locale));
    });

    // Seeds the selection from `[(value)]` / `[formField]`, initially and on every later write
    // (patch, reset) that did not come from this component.
    effect(() => {
      const incoming = this.value();
      untracked(() => this.applyIncomingValue(incoming));
    });
  }

  private applyIncomingValue(incoming: DatetimePickerValue) {
    const isFirstRun = this.lastEmittedValue === NOT_EMITTED;

    if (!isFirstRun && Object.is(incoming, this.lastEmittedValue)) {
      return;
    }

    const entries = Array.isArray(incoming)
      ? incoming
      : (incoming === null || incoming === undefined ? [] : [incoming]);

    const timeEntry = entries.find((entry): entry is Temporal.PlainDateTime => entry instanceof Temporal.PlainDateTime);
    if (timeEntry) {
      this.time.set(timeEntry.toPlainTime());
    }

    let parsed = entries
      .map((entry: unknown) => this.parsePlainDate(entry))
      .filter((date): date is Temporal.PlainDate => date !== null);

    // Without a value the picker has always started with today selected.
    if (parsed.length === 0 && isFirstRun) {
      parsed = [Temporal.Now.plainDateISO()];
    }

    const selected = this.isMultipleSelect() ? this.calendarManager.sortDatesAsc(parsed) : parsed.slice(0, 1);

    // A value written from outside replaces any range the user was in the middle of picking.
    this.pendingRangeStart.set(null);
    this.hoveredDate.set(null);
    this.selectedDates.set(selected);
    if (selected[0]) {
      this.currentMonth.set(selected[0]);
    }

    this.setValueResult();
  }

  private parsePlainDate(entry: unknown): Temporal.PlainDate | null {
    if (entry instanceof Temporal.PlainDate) {
      return entry;
    }

    if (entry instanceof Temporal.PlainDateTime) {
      return entry.toPlainDate();
    }

    if (entry instanceof Date) {
      return Temporal.PlainDate.from({
        year: entry.getFullYear(),
        month: entry.getMonth() + 1,
        day: entry.getDate(),
      });
    }

    if (typeof entry === 'number' && Number.isFinite(entry)) {
      const date = new Date(entry);
      return Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      });
    }

    if (typeof entry === 'string' && entry.trim() !== '') {
      try {
        return Temporal.PlainDate.from(entry);
      } catch {
        return null;
      }
    }

    return null;
  }

  onDateClick(date: CalendarDay) {
    if (this.disabled() || date.isDisabled) {
      return;
    }

    if (!this.select(date)) {
      return;
    }

    switch (date.relativityToCurrentMonth) {
      case CalendarPeriodRelativityEnum.After:
        this.next();
        break;
      case CalendarPeriodRelativityEnum.Before:
        this.previous();
        break;
    }
  }

  /**
   * Selects `date`. Returns `false` (and changes nothing) when it is rejected: with
   * `[isMultipleSelect]`, a date before the pending range start cannot become the end date.
   */
  select(date: CalendarDay): boolean {
    if (!this.markDateAsSelected(date)) {
      return false;
    }

    this.dateSelectionChange.emit(this.value());
    return true;
  }

  /**
   * Range selection: previews the range while the mouse moves over the days. Touch input is
   * ignored, so a tap never leaves a stale preview behind.
   */
  onDateHover(date: CalendarDay, event?: PointerEvent) {
    if (!this.isMultipleSelect() || !this.pendingRangeStart() || this.disabled()) {
      return;
    }

    if (event && event.pointerType !== 'mouse') {
      return;
    }

    this.hoveredDate.set(date.isDisabled ? null : date.date);
  }

  /** Range selection: clears the hover preview when the mouse leaves the calendar. */
  onCalendarLeave() {
    this.hoveredDate.set(null);
  }

  next() {
    if (this.disabled()) {
      return;
    }

    if (this.period() === CalendarPeriodTypeEnum.Month) {
      this.currentMonth.update(month => month.add({ months: 1 }));
    }

    if (this.period() === CalendarPeriodTypeEnum.Year) {
      this.yearsList.set(this.calendarManager.generateYearPickerCollection(null, 19, this.dateRange()));
    }
  }

  previous() {
    if (this.disabled()) {
      return;
    }

    if (this.period() === CalendarPeriodTypeEnum.Month) {
      this.currentMonth.update(month => month.subtract({ months: 1 }));
    }

    if (this.period() === CalendarPeriodTypeEnum.Year) {
      this.yearsList.set(this.calendarManager.generateYearPickerCollection(null, -19, this.dateRange()));
    }
  }

  /** Shows the month containing `startPeriod` and returns its calendar. */
  getMonthCalendar(startPeriod: Temporal.PlainDate): Array<CalendarDay[]> {
    this.currentMonth.set(startPeriod);
    return this.calendar();
  }

  showMonthsPicker(year: number = this.currentMonth().year) {
    if (this.disabled()) {
      return;
    }

    // The selection is kept: browsing months/years must not clear the bound value.
    this.isYearsPickerEnabled.set(false);
    this.isMonthsPickerEnabled.set(true);
    this.currentMonth.update(m => m.with({ year: year }));

    this.period.set(CalendarPeriodTypeEnum.Month);
    this.months.set(this.calendarManager.generateMonthPickerCollection(year, this.dateRange()));
  }

  showYearsPicker() {
    if (this.disabled()) {
      return;
    }

    this.isMonthsPickerEnabled.set(false);
    this.isYearsPickerEnabled.set(true);

    this.period.set(CalendarPeriodTypeEnum.Year);
    this.yearsList.set(this.calendarManager.generateYearPickerCollection(this.currentMonth(), 19, this.dateRange()));
  }

  selectMonth(month: InCalendarPicker) {
    if (this.disabled() || month.isDisabled) {
      return;
    }

    this.currentMonth.set(month.date);
    this.isMonthsPickerEnabled.set(false);
  }

  selectYear(year: InCalendarPicker) {
    if (this.disabled() || year.isDisabled) {
      return;
    }

    this.showMonthsPicker(year.date.year);
  }

  onTimeChange(newTime: TimePickerValue) {
    // Ignore the echo of the value this component just emitted; reacting to it re-triggers the
    // child's effects and spins change detection.
    if (String(newTime) === String(this.time())) {
      return;
    }

    this.time.set(newTime);
    this.setValueResult();
    this.dateSelectionChange.emit(this.value());
  }

  /** Marks the field touched once focus leaves the picker (not while moving between its buttons). */
  onFocusOut(event: FocusEvent) {
    const wrapper = event.currentTarget as HTMLElement | null;
    const next = event.relatedTarget as Node | null;

    if (!wrapper || !next || !wrapper.contains(next)) {
      this.touch.emit();
    }
  }

  /** Returns `false` when the date is rejected (an end date before the pending range start). */
  private markDateAsSelected(date: CalendarDay): boolean {
    const selectedDate = date.date;

    if (this.isMultipleSelect()) {
      const pendingStart = this.pendingRangeStart();

      if (!pendingStart) {
        // First click: starts a new range. The value already reports the start date.
        this.pendingRangeStart.set(selectedDate);
        this.selectedDates.set([selectedDate]);
      } else {
        // Second click: completes the range, which can never end before it starts.
        if (Temporal.PlainDate.compare(selectedDate, pendingStart) < 0) {
          return false;
        }

        this.selectedDates.set(this.calendarManager.getDatesBetween(pendingStart, selectedDate));
        this.pendingRangeStart.set(null);
        this.hoveredDate.set(null);
      }
    } else {
      this.selectedDates.set([selectedDate]);
    }

    this.setValueResult();
    return true;
  }

  private setValueResult() {
    let selectedDates: TemporalCalendarDate[] = [...this.selectedDates()];

    if (selectedDates.length > 0) {
      selectedDates = this.setValueTimeIfNeeded(selectedDates);
      selectedDates = this.sortValueIfNeeded(selectedDates);
    }

    const converted = this.toValueDateObjectTypeIfNeeded(selectedDates);
    const result = this.toValueFormatIfNeeded(converted);

    // `isMultipleSelect` decides whether the model carries the whole selection or a single date.
    const nextValue = this.isMultipleSelect() ? result : (result[0] ?? null);
    this.lastEmittedValue = nextValue;
    this.value.set(nextValue);
  }

  private toValueDateObjectTypeIfNeeded(dates: TemporalCalendarDate[]): DatetimePickerDate[] {
    const objectType = this.dateObjectType();

    if (this.format() || objectType === DateObjectType.PlainDate) {
      return dates;
    }

    return dates.map(date => {
      const asDate = date instanceof Temporal.PlainDateTime
        ? new Date(date.year, date.month - 1, date.day, date.hour, date.minute, date.second)
        : new Date(date.year, date.month - 1, date.day);

      return objectType === DateObjectType.Unix ? asDate.getTime() : asDate;
    });
  }

  private toValueFormatIfNeeded(dates: DatetimePickerDate[]): DatetimePickerDate[] {
    const fmt = this.format();

    if (!fmt) {
      return dates;
    }

    const pad = (part: number) => String(part).padStart(2, '0');

    return dates.map(date => {
      if (!(date instanceof Temporal.PlainDate) && !(date instanceof Temporal.PlainDateTime)) {
        return date;
      }

      // Every occurrence of a token is replaced (`replaceAll`); tokens are case-sensitive, so `MM`
      // (month) and `mm` (minutes) never collide.
      let result = fmt
        .replaceAll('YYYY', String(date.year))
        .replaceAll('MM', pad(date.month))
        .replaceAll('DD', pad(date.day));

      if (date instanceof Temporal.PlainDateTime) {
        result = result
          .replaceAll('hh', pad(date.hour))
          .replaceAll('mm', pad(date.minute))
          .replaceAll('ss', pad(date.second));
      }

      return result;
    });
  }

  private setValueTimeIfNeeded(dates: TemporalCalendarDate[]): TemporalCalendarDate[] {
    const currentTime = this.toPlainTime(this.time());

    if (!this.isTimepickerEnabled() || !currentTime) {
      return dates;
    }

    // PlainDate does not carry time info, so the selection is promoted to PlainDateTime.
    return dates.map(date => {
      const plainDate = date instanceof Temporal.PlainDateTime ? date.toPlainDate() : date;
      return plainDate.toPlainDateTime({ hour: currentTime.hour, minute: currentTime.minute });
    });
  }

  /** The time picker emits a `Temporal.PlainTime`, or a `HH:mm` / `hh:mm AM` string. */
  private toPlainTime(time: TimePickerValue): Temporal.PlainTime | null {
    if (time instanceof Temporal.PlainTime) {
      return time;
    }

    const match = typeof time === 'string' ? /^\s*(\d{1,2}):(\d{2})\s*(am|pm)?\s*$/i.exec(time) : null;
    if (!match) {
      return null;
    }

    let hour = parseInt(match[1], 10);
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === 'pm' && hour < 12) {
      hour += 12;
    } else if (meridiem === 'am' && hour === 12) {
      hour = 0;
    }

    return Temporal.PlainTime.from({ hour: Math.min(hour, 23), minute: Math.min(parseInt(match[2], 10), 59) });
  }

  private sortValueIfNeeded(dates: TemporalCalendarDate[]): TemporalCalendarDate[] {
    if (this.isMultipleSelect()) {
      return this.calendarManager.sortDatesAsc(dates);
    }

    return dates;
  }

}
