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
import { generateFormFieldId } from '@sq-ui/ng-sq-common';
import { Temporal } from '@js-temporal/polyfill';

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
export class DatetimePickerComponent implements OnInit {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

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
  readonly value = model<any>(null);

  // Output
  readonly dateSelectionChange = output<Temporal.PlainDate | Date>();

  // Internal state
  readonly weekdays = signal<string[]>([]);
  readonly months = signal<InCalendarPicker[]>([]);
  readonly yearsList = signal<InCalendarPicker[]>([]);
  readonly calendar = signal<Array<CalendarDay[]>>([]);
  readonly currentMonth = signal<Temporal.PlainDate>(Temporal.Now.plainDateISO());
  readonly isMonthsPickerEnabled = signal<boolean>(false);
  readonly isYearsPickerEnabled = signal<boolean>(false);
  readonly time = signal<any>(null);
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
    const now = Temporal.Now.plainDateISO();
    this.selectedDates.set([now]);
    this.weekdays.set(this.calendarManager.getWeekdays());
    this.calendar.set(this.getMonthCalendar(now));
    this.setValueResult();
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

  onTimeChange(newTime: any) {
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
    let parsedSelectedDates: any[] = [...this.selectedDates()];

    if (parsedSelectedDates.length > 0) {
      parsedSelectedDates = this.setValueTimeIfNeeded(parsedSelectedDates);
      parsedSelectedDates = this.sortValueIfNeeded(parsedSelectedDates);
      parsedSelectedDates = this.toValueDateObjectTypeIfNeeded(parsedSelectedDates);
      parsedSelectedDates = this.toValueFormatIfNeeded(parsedSelectedDates);
    }

    if (this.isMultipleSelect()) {
      this.value.set(parsedSelectedDates);
    } else {
      this.value.set(parsedSelectedDates[0] ?? null);
    }
  }

  private toValueDateObjectTypeIfNeeded(dates: any[]): any[] {
    if (!this.format()) {
      switch (this.dateObjectType()) {
        case DateObjectType.Date:
          return dates.map((plainDate: Temporal.PlainDate) => {
            return new Date(plainDate.year, plainDate.month - 1, plainDate.day);
          });
        case DateObjectType.Unix:
          return dates.map((plainDate: Temporal.PlainDate) => {
            return new Date(plainDate.year, plainDate.month - 1, plainDate.day).getTime();
          });
      }
    }
    return dates;
  }

  private toValueFormatIfNeeded(dates: any[]): any[] {
    const fmt = this.format();
    if (fmt) {
      return dates.map((date: Temporal.PlainDate) => {
        return fmt
          .replace('YYYY', String(date.year))
          .replace('MM', String(date.month).padStart(2, '0'))
          .replace('DD', String(date.day).padStart(2, '0'));
      });
    }
    return dates;
  }

  private setValueTimeIfNeeded(dates: any[]): any[] {
    const currentTime = this.time();
    if (this.isTimepickerEnabled() && currentTime) {
      // Time handling: time picker provides a Temporal.PlainTime or a string.
      // PlainDate does not carry time info, so we convert to PlainDateTime when time is needed.
      return dates.map((plainDate: Temporal.PlainDate) => {
        let hours: number;
        let minutes: number;

        if (currentTime instanceof Temporal.PlainTime) {
          hours = currentTime.hour;
          minutes = currentTime.minute;
        } else if (typeof currentTime === 'string') {
          hours = parseInt(currentTime.split(':')[0], 10);
          minutes = parseInt(currentTime.split(':')[1], 10);
        } else {
          hours = 0;
          minutes = 0;
        }

        return plainDate.toPlainDateTime({ hour: hours, minute: minutes });
      });
    }
    return dates;
  }

  private sortValueIfNeeded(dates: any[]): any[] {
    if (this.isMultipleSelect()) {
      return this.calendarManager.sortDatesAsc(dates);
    }
    return dates;
  }

  /**
   * Converts a Date or Temporal.PlainDate to Temporal.PlainDate.
   */
  private toPlainDate(date: any): Temporal.PlainDate {
    if (date instanceof Date) {
      return Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      });
    }
    if (typeof date === 'string' || typeof date === 'number') {
      const d = new Date(date);
      return Temporal.PlainDate.from({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate()
      });
    }
    return date;
  }
}
