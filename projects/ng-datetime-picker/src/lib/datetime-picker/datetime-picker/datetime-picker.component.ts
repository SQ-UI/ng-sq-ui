import {
  Component, OnInit, ViewEncapsulation,
  ChangeDetectionStrategy, input, model, output, signal, computed,
  inject
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
export class DatetimePickerComponent implements OnInit, SqFormFieldSignals, SqFormValueControl<DatetimePickerValue> {
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

  // Internal state
  readonly weekdays = signal<string[]>([]);
  readonly months = signal<InCalendarPicker[]>([]);
  readonly yearsList = signal<InCalendarPicker[]>([]);
  readonly calendar = signal<Array<CalendarDay[]>>([]);
  readonly currentMonth = signal<Temporal.PlainDate>(Temporal.Now.plainDateISO());
  readonly isMonthsPickerEnabled = signal<boolean>(false);
  readonly isYearsPickerEnabled = signal<boolean>(false);
  readonly time = signal<TimePickerValue>(null);
  readonly period = signal<CalendarPeriodTypeEnum>(CalendarPeriodTypeEnum.Month);

  readonly calendarPeriodRelativity = CalendarPeriodRelativityEnum;

  readonly currentMonthName = computed(() => {
    const month = this.currentMonth();
    if (!month) {
      return '';
    }
    return month.toLocaleString(this.locale(), { month: 'long' });
  });

  private selectedDates = signal<Temporal.PlainDate[]>([]);

  private readonly calendarManager = inject(CalendarManagerService);

  ngOnInit() {
    this.calendarManager.setLocale(this.locale());

    const selectedDates = this.getInitialSelectedDates();
    const firstDate = selectedDates[0];

    this.weekdays.set(this.calendarManager.getWeekdays());
    this.selectedDates.set(selectedDates);
    this.calendar.set(this.getMonthCalendar(firstDate));
    this.setValueResult();
  }

  /**
   * Seeds the internal selection from the bound `value` instead of always starting on "today",
   * so `<sq-datetime-picker [(value)]="date">` opens on the value it was given.
   */
  private getInitialSelectedDates(): Temporal.PlainDate[] {
    const rawValue = this.value();
    const entries = Array.isArray(rawValue)
      ? rawValue
      : (rawValue === null || rawValue === undefined ? [] : [rawValue]);

    const parsed = entries
      .map((entry: unknown) => this.parsePlainDate(entry))
      .filter((date): date is Temporal.PlainDate => date !== null);

    if (parsed.length === 0) {
      return [Temporal.Now.plainDateISO()];
    }

    return this.isMultipleSelect() ? this.calendarManager.sortDatesAsc(parsed) : [parsed[0]];
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
    switch (date.relativityToCurrentMonth) {
      case CalendarPeriodRelativityEnum.After:
        this.select(date);
        this.next();
        break;
      case CalendarPeriodRelativityEnum.Before:
        this.select(date);
        this.previous();
        break;
      default:
        this.select(date);
        break;
    }
  }

  select(date: CalendarDay) {
    this.markDateAsSelected(date);
    this.dateSelectionChange.emit(this.value());
  }

  next() {
    if (this.period() === CalendarPeriodTypeEnum.Month) {
      const nextMonth = this.currentMonth().add({ months: 1 });
      this.calendar.set(this.getMonthCalendar(nextMonth));
    }

    if (this.period() === CalendarPeriodTypeEnum.Year) {
      const dateRange: DateRange = {
        minDate: this.minDate(),
        maxDate: this.maxDate()
      };

      this.yearsList.set(this.calendarManager.generateYearPickerCollection(null, 19, dateRange));
    }
  }

  previous() {
    if (this.period() === CalendarPeriodTypeEnum.Month) {
      const previousMonth = this.currentMonth().subtract({ months: 1 });
      this.calendar.set(this.getMonthCalendar(previousMonth));
    }

    if (this.period() === CalendarPeriodTypeEnum.Year) {
      const dateRange: DateRange = {
        minDate: this.minDate(),
        maxDate: this.maxDate()
      };

      this.yearsList.set(this.calendarManager.generateYearPickerCollection(null, -19, dateRange));
    }
  }

  getMonthCalendar(startPeriod: Temporal.PlainDate): Array<CalendarDay[]> {
    const selectedDates = this.selectedDates();
    const dateRange: DateRange = {
      minDate: this.minDate(),
      maxDate: this.maxDate()
    };

    this.currentMonth.set(startPeriod);

    return this.calendarManager.generateCalendarForMonth(startPeriod, this.currentMonth(), selectedDates, dateRange);
  }

  showMonthsPicker(year: number = this.currentMonth().year) {
    this.deselectAll();
    this.isYearsPickerEnabled.set(false);
    this.isMonthsPickerEnabled.set(true);
    this.currentMonth.update(m => m.with({ year: year }));
    const dateRange: DateRange = {
      minDate: this.minDate(),
      maxDate: this.maxDate()
    };

    this.period.set(CalendarPeriodTypeEnum.Month);
    this.months.set(this.calendarManager.generateMonthPickerCollection(year, dateRange));
  }

  showYearsPicker() {
    this.deselectAll();
    this.isMonthsPickerEnabled.set(false);
    this.isYearsPickerEnabled.set(true);
    const dateRange: DateRange = {
      minDate: this.minDate(),
      maxDate: this.maxDate()
    };

    this.period.set(CalendarPeriodTypeEnum.Year);
    this.yearsList.set(this.calendarManager.generateYearPickerCollection(this.currentMonth(), 19, dateRange));
  }

  selectMonth(month: InCalendarPicker) {
    this.calendar.set(this.getMonthCalendar(month.date));
    this.isMonthsPickerEnabled.set(false);
  }

  selectYear(year: InCalendarPicker) {
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

  private markDateAsSelected(date: CalendarDay) {
    const selectedDate = date.date;
    const currentSelected = this.selectedDates();
    const selectedIndex = this.calendarManager.getSelectedItemIndex(selectedDate, currentSelected);

    if (this.isMultipleSelect()) {
      if (selectedIndex > -1) {
        date.isSelected = false;
        this.selectedDates.update(dates => {
          const copy = [...dates];
          copy.splice(selectedIndex, 1);
          return copy;
        });
      } else {
        this.selectedDates.update(dates => [...dates, selectedDate]);
        date.isSelected = true;
      }

    } else {
      const previousDate = this.calendarManager.findADateFromCalendar(currentSelected[0], this.calendar());
      if (previousDate) {
        previousDate.isSelected = false;
      }

      this.selectedDates.set([selectedDate]);
      date.isSelected = true;
    }

    this.setValueResult();
  }

  private deselectAll() {
    const currentSelected = this.selectedDates();
    const currentCalendar = this.calendar();
    currentSelected.forEach((selectedDate) => {
      const calendarDay = this.calendarManager.findADateFromCalendar(selectedDate, currentCalendar);

      // this handles the case when we have a selected date
      // from the previous month but we haven't selected anything
      // from the current
      if (calendarDay) {
        calendarDay.isSelected = false;
      }
    });

    this.selectedDates.set([]);
    this.setValueResult();
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
    this.value.set(this.isMultipleSelect() ? result : (result[0] ?? null));
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

    return dates.map(date => {
      if (!(date instanceof Temporal.PlainDate) && !(date instanceof Temporal.PlainDateTime)) {
        return date;
      }

      let result = fmt
        .replace('YYYY', String(date.year))
        .replace('DD', String(date.day).padStart(2, '0'));

      if (date instanceof Temporal.PlainDateTime) {
        result = result
          .replace('hh', String(date.hour).padStart(2, '0'))
          .replace('mm', String(date.minute).padStart(2, '0'))
          .replace('ss', String(date.second).padStart(2, '0'));
      }

      return result.replace('MM', String(date.month).padStart(2, '0'));
    });
  }

  private setValueTimeIfNeeded(dates: TemporalCalendarDate[]): TemporalCalendarDate[] {
    const currentTime = this.time();

    if (!this.isTimepickerEnabled() || !currentTime) {
      return dates;
    }

    // PlainDate does not carry time info, so the selection is promoted to PlainDateTime.
    // The time picker provides a Temporal.PlainTime or a string.
    return dates.map(date => {
      const plainDate = date instanceof Temporal.PlainDateTime ? date.toPlainDate() : date;
      let hours = 0;
      let minutes = 0;

      if (currentTime instanceof Temporal.PlainTime) {
        hours = currentTime.hour;
        minutes = currentTime.minute;
      } else if (typeof currentTime === 'string') {
        hours = parseInt(currentTime.split(':')[0], 10);
        minutes = parseInt(currentTime.split(':')[1], 10);
      }

      return plainDate.toPlainDateTime({ hour: hours, minute: minutes });
    });
  }

  private sortValueIfNeeded(dates: TemporalCalendarDate[]): TemporalCalendarDate[] {
    if (this.isMultipleSelect()) {
      return this.calendarManager.sortDatesAsc(dates);
    }

    return dates;
  }

}
