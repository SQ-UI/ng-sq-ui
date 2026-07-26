import {
  Component, forwardRef, OnInit, ViewEncapsulation,
  Input, Output, EventEmitter, AfterViewInit,
  OnChanges
} from '@angular/core';
import { InputCoreComponent } from '@sq-ui/ng-sq-common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarDay, InCalendarPicker } from '../interfaces/calendar-entities';
import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import { DateRange } from '../interfaces/date-range';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { DateObjectType } from '../enums/date-object-type.enum';
import { TimepickerConfig } from '../interfaces/timepicker-config';
import { List } from 'immutable';
import { CalendarManagerService } from '../calendar-manager.service';
import { Temporal } from '@js-temporal/polyfill';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatetimePickerComponent),
  multi: true
};

@Component({
  selector: 'sq-datetime-picker',
  standalone: false,
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class DatetimePickerComponent extends InputCoreComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() locale = 'en';
  @Input() maxDate: Temporal.PlainDate | Date;
  @Input() minDate: Temporal.PlainDate | Date;
  @Input() isMultipleSelect = false;
  @Input() format: string;
  @Input() isTimepickerEnabled = false;
  @Input() dateObjectType: string = DateObjectType.PlainDate;
  @Input() timepickerConfig: TimepickerConfig;

  @Output() dateSelectionChange: EventEmitter<Temporal.PlainDate | Date> = new EventEmitter<Temporal.PlainDate | Date>();

  weekdays: string[];
  months: InCalendarPicker[];
  yearsList: InCalendarPicker[];
  calendar: Array<CalendarDay[]>;
  currentMonth: Temporal.PlainDate;
  isMonthsPickerEnabled = false;
  isYearsPickerEnabled = false;
  time: any;
  calendarPeriodRelativity = CalendarPeriodRelativityEnum;
  period: CalendarPeriodTypeEnum = CalendarPeriodTypeEnum.Month;

  get currentMonthName(): string {
    if (!this.currentMonth) {
      return '';
    }
    return this.currentMonth.toLocaleString(this.locale, { month: 'long' });
  }

  private selectedDates: List<Temporal.PlainDate> = List<Temporal.PlainDate>();
  private parsedSelectedDates: any;

  constructor(private calendarManager: CalendarManagerService) {
    super();
  }

  ngOnInit() {
    this.calendarManager.setLocale(this.locale);
    const now = Temporal.Now.plainDateISO();
    this.selectedDates = List([now]);
    this.weekdays = this.calendarManager.getWeekdays();
    this.calendar = this.getMonthCalendar(now);
    this.initializeAuthorValuesIfAny();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setValueResult();
    });
  }

  ngOnChanges(changesObj) {
    if (changesObj.timepickerConfig && changesObj.timepickerConfig.currentValue) {
      this.setValueResult();
    }
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
    this.dateSelectionChange.emit(this.value);
  }

  next() {
    if (this.period === CalendarPeriodTypeEnum.Month) {
      const nextMonth = this.currentMonth.add({ months: 1 });
      this.calendar = this.getMonthCalendar(nextMonth);
    }

    if (this.period === CalendarPeriodTypeEnum.Year) {
      const dateRange: DateRange = {
        minDate: this.minDate,
        maxDate: this.maxDate
      };

      this.yearsList = this.calendarManager.generateYearPickerCollection(null, 19, dateRange);
    }
  }

  previous() {
    if (this.period === CalendarPeriodTypeEnum.Month) {
      const previousMonth = this.currentMonth.subtract({ months: 1 });
      this.calendar = this.getMonthCalendar(previousMonth);
    }

    if (this.period === CalendarPeriodTypeEnum.Year) {
      const dateRange: DateRange = {
        minDate: this.minDate,
        maxDate: this.maxDate
      };

      this.yearsList = this.calendarManager.generateYearPickerCollection(null, -19, dateRange);
    }
  }

  getMonthCalendar(startPeriod: Temporal.PlainDate): Array<CalendarDay[]> {
    const selectedDates = this.selectedDates.toArray();
    const dateRange: DateRange = {
      minDate: this.minDate,
      maxDate: this.maxDate
    };

    this.currentMonth = startPeriod;

    return this.calendarManager.generateCalendarForMonth(startPeriod, this.currentMonth, selectedDates, dateRange);
  }

  showMonthsPicker(year: number = this.currentMonth.year) {
    this.deselectAll();
    this.isYearsPickerEnabled = false;
    this.isMonthsPickerEnabled = true;
    this.currentMonth = this.currentMonth.with({ year: year });
    const dateRange: DateRange = {
      minDate: this.minDate,
      maxDate: this.maxDate
    };

    this.period = CalendarPeriodTypeEnum.Month;
    this.months = this.calendarManager.generateMonthPickerCollection(year, dateRange);
  }

  showYearsPicker() {
    this.deselectAll();
    this.isMonthsPickerEnabled = false;
    this.isYearsPickerEnabled = true;
    const dateRange: DateRange = {
      minDate: this.minDate,
      maxDate: this.maxDate
    };

    this.period = CalendarPeriodTypeEnum.Year;
    this.yearsList = this.calendarManager.generateYearPickerCollection(this.currentMonth, 19, dateRange);
  }

  selectMonth(month: InCalendarPicker) {
    this.calendar = this.getMonthCalendar(month.date);
    this.isMonthsPickerEnabled = false;
  }

  selectYear(year: InCalendarPicker) {
    this.showMonthsPicker(year.date.year);
  }

  onTimeChange() {
    this.setValueResult();
    this.dateSelectionChange.emit(this.value);
  }

  private initializeAuthorValuesIfAny() {
    const subscription = this._modelToViewChange.subscribe((newValue) => {
      const today = Temporal.Now.plainDateISO();
      if (this.selectedDates.size === 1 && Temporal.PlainDate.compare(this.selectedDates.get(0), today) === 0) {
        if (newValue) {
          this.deselectAll();

          if (Array.isArray(newValue)) {
            newValue.forEach((date) => {
              const convertedDate = this.calendarManager.findADateFromCalendar(this.toPlainDate(date), this.calendar);
              this.markDateAsSelected(convertedDate);
            });
          } else {
            const calendarDay = this.calendarManager.findADateFromCalendar(this.toPlainDate(newValue), this.calendar);
            this.markDateAsSelected(calendarDay);
          }
        }
      }

      subscription.unsubscribe();
    });
  }

  private markDateAsSelected(date: CalendarDay) {
    const selectedDate = date.date;
    const selectedIndex = this.calendarManager.getSelectedItemIndex(selectedDate, this.selectedDates.toArray());

    if (this.isMultipleSelect) {
      if (selectedIndex > -1) {
        date.isSelected = false;
        this.selectedDates = this.selectedDates.remove(selectedIndex);
      } else {
        this.selectedDates = this.selectedDates.push(selectedDate);
        date.isSelected = true;
      }

    } else {
      const previousDate = this.calendarManager.findADateFromCalendar(this.selectedDates.get(0), this.calendar);
      if (previousDate) {
        previousDate.isSelected = false;
      }

      this.selectedDates = this.selectedDates.clear();
      this.selectedDates = this.selectedDates.push(selectedDate);
      date.isSelected = true;
    }

    this.setValueResult();
  }

  private deselectAll() {
    this.selectedDates.toArray().forEach((selectedDate) => {
      const calendarDay = this.calendarManager.findADateFromCalendar(selectedDate, this.calendar);

      // this handles the case when we have a selected date
      // from the previous month but we haven't selected anything
      // from the current
      if (calendarDay) {
        calendarDay.isSelected = false;
      }
    });

    this.selectedDates = List([]);
    this.setValueResult();
  }

  private setValueResult() {
    this.parsedSelectedDates = this.selectedDates.toArray();

    if (this.parsedSelectedDates.length > 0) {
      this.setValueTimeIfNeeded();
      this.sortValueIfNeeded();
      this.toValueDateObjectTypeIfNeeded();
      this.toValueFormatIfNeeded();
    }

    if (this.isMultipleSelect) {
      this.value = this.parsedSelectedDates;
    } else {
      this.value = this.parsedSelectedDates[0];
    }
  }

  private toValueDateObjectTypeIfNeeded() {
    if (!this.format) {
      switch (this.dateObjectType) {
        case DateObjectType.Date:
          this.parsedSelectedDates = this.parsedSelectedDates.map((plainDate: Temporal.PlainDate) => {
            return new Date(plainDate.year, plainDate.month - 1, plainDate.day);
          });
          break;
        case DateObjectType.Unix:
          this.parsedSelectedDates = this.parsedSelectedDates.map((plainDate: Temporal.PlainDate) => {
            return new Date(plainDate.year, plainDate.month - 1, plainDate.day).getTime();
          });
          break;
      }
    }
  }

  private toValueFormatIfNeeded() {
    if (this.format) {
      const formattedDates = this.parsedSelectedDates.map((date: Temporal.PlainDate) => {
        return date.toLocaleString(this.locale);
      });

      this.parsedSelectedDates = formattedDates;
    }
  }

  private setValueTimeIfNeeded() {
    if (this.isTimepickerEnabled && this.time) {
      // Time handling: time picker provides hours/minutes as a string or moment object.
      // Since we are migrating dates only, time picker integration is preserved as-is.
      // PlainDate does not carry time info, so we convert to PlainDateTime when time is needed.
      const datesWithTime = this.parsedSelectedDates.map((plainDate: Temporal.PlainDate) => {
        const hours = typeof this.time === 'string'
          ? parseInt(this.time.split(':')[0], 10)
          : this.time.hours();
        const minutes = typeof this.time === 'string'
          ? parseInt(this.time.split(':')[1], 10)
          : this.time.minutes();
        return plainDate.toPlainDateTime({ hour: hours, minute: minutes });
      });

      this.parsedSelectedDates = datesWithTime;
    }
  }

  private sortValueIfNeeded() {
    if (this.isMultipleSelect) {
      const sortedDates = this.calendarManager.sortDatesAsc(this.parsedSelectedDates);
      this.parsedSelectedDates = sortedDates;
    }
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
