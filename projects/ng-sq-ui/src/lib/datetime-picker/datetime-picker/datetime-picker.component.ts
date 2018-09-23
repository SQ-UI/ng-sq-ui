import {
  Component, forwardRef, OnInit, ViewEncapsulation,
  Input, Output, EventEmitter, AfterViewInit
} from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarDay } from '../interfaces/calendar-day';
import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import { DateRange } from '../interfaces/date-range';
import { MonthCalendar } from '../interfaces/month-calendar';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { CalendarManagerService } from '../calendar-manager.service';
import { DateObjectType } from '../enums/date-object-type.enum';
import { List } from 'immutable';
// temporary fix for https://github.com/ng-packagr/ng-packagr/issues/217#issuecomment-360176759
import * as momentNs from 'moment';
const moment = momentNs;

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
export class DatetimePickerComponent extends InputCoreComponent implements OnInit, AfterViewInit {
  @Input() locale = 'en';
  @Input() maxDate: momentNs.Moment | Date;
  @Input() minDate: momentNs.Moment | Date;
  @Input() range = false;
  @Input() format: string;
  @Input() dateObjectType: string = DateObjectType.Moment;
  @Output() dateSelectionChange: EventEmitter<momentNs.Moment | Date> = new EventEmitter<momentNs.Moment | Date>();

  weekdays: string[];
  calendar: MonthCalendar;
  currentMonth: momentNs.Moment;
  period: CalendarPeriodTypeEnum = CalendarPeriodTypeEnum.Month;
  calendarPeriodRelativity = CalendarPeriodRelativityEnum;

  private selectedDates: List<momentNs.Moment> = List<momentNs.Moment>();

  constructor(private calendarManager: CalendarManagerService) {
    super();
  }

  ngOnInit() {
    moment.locale(this.locale);
    this.calendarManager.setLocale(this.locale);
    const now = moment().hours(0).minutes(0).locale(this.locale);
    this.selectedDates = List([now.clone()]);
    this.initializeAuthorValuesIfAny();
    this.currentMonth = now.clone();
    this.weekdays = this.calendarManager.getWeekdays();
    this.calendar = this.getMonthCalendar(now.clone());
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setValueResult();
    });
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
  }

  next() {
    if (this.period === CalendarPeriodTypeEnum.Month) {
      const nextMonth = this.currentMonth.add(1, 'month');
      this.calendar = this.getMonthCalendar(nextMonth);
    }
  }

  previous() {
    if (this.period === CalendarPeriodTypeEnum.Month) {
      const previousMonth = this.currentMonth.subtract(1, 'month');
      this.calendar = this.getMonthCalendar(previousMonth);
    }
  }

  getMonthCalendar(startPeriod: momentNs.Moment): MonthCalendar {
    const selectedDates = this.selectedDates.toArray();
    const dateRange: DateRange = {
      minDate: this.minDate,
      maxDate: this.maxDate
    };

    return this.calendarManager.generateCalendarForMonth(startPeriod, this.currentMonth, selectedDates, dateRange);
  }

  private initializeAuthorValuesIfAny() {
    const subscription = this._modelToViewChange.subscribe((newValue) => {
      if (this.selectedDates.size === 1 && this.selectedDates.get(0).isSame(moment(), 'day')) {
        if (newValue) {
          if (Array.isArray(newValue)) {
            newValue.forEach((date) => {
              const convertedDate = this.convertToCalendarDay(date);
              this.markDateAsSelected(convertedDate);
            });
          } else {
            const calendarDay = this.convertToCalendarDay(newValue);
            this.markDateAsSelected(calendarDay);
          }
        }
      }

      subscription.unsubscribe();
    });
  }

  private markDateAsSelected(date: CalendarDay) {
    const selectedMomentObj = moment(date.momentObj);
    const selectedIndex = this.calendarManager.getSelectedItemIndex(selectedMomentObj, this.selectedDates.toArray());

    if (this.range) {
      if (selectedIndex > -1) {
        date.isSelected = false;
        this.selectedDates = this.selectedDates.remove(selectedIndex);
      } else {
        this.selectedDates = this.selectedDates.push(selectedMomentObj);
        date.isSelected = true;
      }

    } else {
      const previousDate = this.calendarManager.findADateFromCalendar(this.selectedDates.get(0), this.calendar.table);
      previousDate.isSelected = false;

      this.selectedDates = this.selectedDates.clear();
      this.selectedDates = this.selectedDates.push(selectedMomentObj);
      date.isSelected = true;
    }

    this.setValueResult();
  }

  private convertToCalendarDay(date: momentNs.Moment | Date): CalendarDay {
    const dateCopy = moment(date);

    return {
      displayDate: dateCopy.format('D'),
      momentObj: dateCopy,
      relativityToCurrentMonth: this.calendarManager.determineDateRelativityToCurrentMonth(dateCopy, this.currentMonth),
      isDisabled: this.calendarManager.determineIfDateIsDisabled(dateCopy, this.minDate, this.maxDate),
      isSelected: this.calendarManager.getSelectedItemIndex(dateCopy, this.selectedDates.toArray()) > -1
    };
  }

  private setValueResult() {
    let result: any = this.selectedDates.toArray();

    if (this.dateObjectType === DateObjectType.Date) {
      result = result.map((momentObj) => {
        return momentObj.toDate();
      });
    }

    if (this.range) {
      this.value = this.calendarManager.sortDatesAsc(result);
    } else {
      this.value = result[0];
    }
  }
}
