import {
  Component, forwardRef, OnInit, ViewEncapsulation,
  Input, Output, EventEmitter,
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
import moment from 'moment';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatetimePickerComponent),
  multi: true
};

@Component({
  selector: 'sq-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class DatetimePickerComponent extends InputCoreComponent implements OnInit, OnChanges {
  @Input() locale = 'en';
  @Input() maxDate: moment.Moment | Date;
  @Input() minDate: moment.Moment | Date;
  @Input() isMultipleSelect = false;
  @Input() format: string;
  @Input() isTimepickerEnabled = false;
  @Input() dateObjectType: string = DateObjectType.Moment;
  @Input() timepickerConfig: TimepickerConfig;

  @Output() dateSelectionChange: EventEmitter<moment.Moment | Date> = new EventEmitter<moment.Moment | Date>();

  weekdays: string[];
  months: InCalendarPicker[];
  yearsList: InCalendarPicker[];
  calendar: Array<CalendarDay[]>;
  currentMonth: moment.Moment;
  isMonthsPickerEnabled = false;
  isYearsPickerEnabled = false;
  time: moment.Moment;
  calendarPeriodRelativity = CalendarPeriodRelativityEnum;
  period: CalendarPeriodTypeEnum = CalendarPeriodTypeEnum.Month;

  private selectedDates: List<moment.Moment> = List<moment.Moment>();
  private parsedSelectedDates: any;

  constructor(private calendarManager: CalendarManagerService) {
    super();
  }

  ngOnInit() {
    moment.locale(this.locale);
    this.calendarManager.setLocale(this.locale);
    const now = moment().hours(0).minutes(0).locale(this.locale);
    this.weekdays = this.calendarManager.getWeekdays();
    this.calendar = this.getMonthCalendar(now.clone());
  }

  ngOnChanges(changesObj) {
    if (changesObj.timepickerConfig && changesObj.timepickerConfig.currentValue) {
      this.setValueResult();
    }
  }

  override writeValue(newValue): void {
    super.writeValue(newValue);

    if (newValue) {
      this.deselectAll();

      if (Array.isArray(newValue)) {
        newValue.forEach((date) => {
          const convertedDate = this.calendarManager.findADateFromCalendar(moment(date), this.calendar);
          this.markDateAsSelected(convertedDate);
        });
      } else {
        const calendarDay = this.calendarManager.findADateFromCalendar(moment(newValue), this.calendar);
        this.markDateAsSelected(calendarDay);
      }
    } else {
      const now = moment().hours(0).minutes(0).locale(this.locale);
      const convertedDate = this.calendarManager.findADateFromCalendar(now, this.calendar);
      this.markDateAsSelected(convertedDate);
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
    const month = this.currentMonth.clone();

    if (date.relativityToCurrentMonth === CalendarPeriodRelativityEnum.Before) {
      month.subtract(1, 'month');
    }

    if (date.relativityToCurrentMonth === CalendarPeriodRelativityEnum.After) {
      month.add(1, 'month');
    }

    this.markDateAsSelected(date);
    this.dateSelectionChange.emit(this.value);
  }

  next() {
    if (this.period === CalendarPeriodTypeEnum.Month) {
      const nextMonth = this.currentMonth.add(1, 'month');
      this.calendar = this.getMonthCalendar(nextMonth);
    }

    if (this.period === CalendarPeriodTypeEnum.Year) {
      const dateRange = {
        minDate: moment(this.minDate),
        maxDate: moment(this.maxDate)
      };

      this.yearsList = this.calendarManager.generateYearPickerCollection(null, 19, dateRange);
    }
  }

  previous() {
    if (this.period === CalendarPeriodTypeEnum.Month) {
      const previousMonth = this.currentMonth.subtract(1, 'month');
      this.calendar = this.getMonthCalendar(previousMonth);
    }

    if (this.period === CalendarPeriodTypeEnum.Year) {
      const dateRange = {
        minDate: moment(this.minDate),
        maxDate: moment(this.maxDate)
      };

      this.yearsList = this.calendarManager.generateYearPickerCollection(null, -19, dateRange);
    }
  }

  getMonthCalendar(startPeriod: moment.Moment): Array<CalendarDay[]> {
    const selectedDates = this.selectedDates.toArray();
    const dateRange: DateRange = {
      minDate: this.minDate,
      maxDate: this.maxDate
    };

    this.currentMonth = startPeriod.clone();

    return this.calendarManager.generateCalendarForMonth(startPeriod, this.currentMonth, selectedDates, dateRange);
  }

  showMonthsPicker(year: number = this.currentMonth.year()) {
    this.deselectAll();
    this.isYearsPickerEnabled = false;
    this.isMonthsPickerEnabled = true;
    this.currentMonth.year(year);
    const dateRange = {
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
    const dateRange = {
      minDate: this.minDate,
      maxDate: this.maxDate
    };

    this.period = CalendarPeriodTypeEnum.Year;
    this.yearsList = this.calendarManager.generateYearPickerCollection(this.currentMonth, 19, dateRange);
  }

  selectMonth(month) {
    this.calendar = this.getMonthCalendar(month.momentObj);
    this.isMonthsPickerEnabled = false;
  }

  selectYear(year) {
    this.showMonthsPicker(year.momentObj.year());
  }

  onTimeChange() {
    this.setValueResult();
    this.dateSelectionChange.emit(this.value);
  }

  private markDateAsSelected(date: CalendarDay) {
    const selectedMomentObj = moment(date.momentObj);
    const selectedIndex = this.calendarManager.getSelectedItemIndex(selectedMomentObj, this.selectedDates.toArray());

    if (this.isMultipleSelect) {
      if (selectedIndex > -1) {
        date.isSelected = false;
        this.selectedDates = this.selectedDates.remove(selectedIndex);
      } else {
        this.selectedDates = this.selectedDates.push(selectedMomentObj);
        date.isSelected = true;
      }

    } else {
      const previousDate = this.calendarManager.findADateFromCalendar(this.selectedDates.get(0), this.calendar);
      if (previousDate) {
        previousDate.isSelected = false;
      }

      this.selectedDates = this.selectedDates.clear();
      this.selectedDates = this.selectedDates.push(selectedMomentObj);
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
          this.parsedSelectedDates = this.parsedSelectedDates.map((momentObj) => {
            return momentObj.toDate();
          });
          break;
        case DateObjectType.Unix:
          this.parsedSelectedDates = this.parsedSelectedDates.map((momentObj) => {
            return momentObj.toDate().getTime();
          });
          break;
      }
    }
  }

  private toValueFormatIfNeeded() {
    if (this.format) {
      const formattedDates = this.parsedSelectedDates.map((date) => {
        return moment(date).format(this.format);
      });

      this.parsedSelectedDates = formattedDates;
    }
  }

  private setValueTimeIfNeeded() {
    if (this.isTimepickerEnabled && this.time) {
      const datesWithTime = this.parsedSelectedDates.map((momentObj) => {
        return momentObj.hours(this.time.hours()).minutes(this.time.minutes());
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
}
