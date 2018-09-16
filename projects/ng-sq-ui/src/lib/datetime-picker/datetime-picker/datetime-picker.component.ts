import {
  Component, forwardRef, OnInit, ViewEncapsulation,
  Input, Output, EventEmitter
} from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarDay } from '../interfaces/calendar-day';
import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import { DateRange } from '../interfaces/date-range';
import { MonthCalendar } from '../interfaces/month-calendar';
import { CalendarPeriodTypeEnum } from '../enums/calendar-period-type.enum';
import { CalendarManagerService } from '../calendar-manager.service';
import { List, is } from 'immutable';
// temporary fix for https://github.com/ng-packagr/ng-packagr/issues/217#issuecomment-360176759
import * as momentNs from 'moment';
import { DateObjectType } from '../enums/date-object-type.enum';
import {Subscription} from 'rxjs';
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
export class DatetimePickerComponent extends InputCoreComponent implements OnInit {
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
  private valueChangedSubscription: Subscription;

  constructor(private calendarManager: CalendarManagerService) {
    super();
  }

  ngOnInit() {
    moment.locale(this.locale);
    this.calendarManager.setLocale(this.locale);
    const now = moment().locale(this.locale);
    this.selectedDates = List([now.clone()]);
    this.currentMonth = now.clone();
    this.weekdays = this.calendarManager.getWeekdays();
    this.calendar = this.getMonthCalendar(now.clone());

    this.initializeAuthorValuesIfAny();
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
    this.valueChangedSubscription = this._valueChange.subscribe((predefinedDateValue) => {
      if (predefinedDateValue) {
        this.calendar.previouslySelected.forEach((date) => {
          date.isSelected = false;
        });

        if (Array.isArray(predefinedDateValue)) {
          this.calendar.previouslySelected = predefinedDateValue.map((date) => {
            const correspondingCalendarDay = this.calendarManager.findADateFromCalendar(date, this.calendar.table);
            correspondingCalendarDay.isSelected = true;
            this.selectedDates = this.selectedDates.push(correspondingCalendarDay.momentObj);

            return correspondingCalendarDay;
          });

        } else {
          const correspondingCalendarDay = this.calendarManager.findADateFromCalendar(predefinedDateValue, this.calendar.table);
          correspondingCalendarDay.isSelected = true;
          this.calendar.previouslySelected = [correspondingCalendarDay];
          this.selectedDates = List([correspondingCalendarDay.momentObj]);
        }
      }

      this.valueChangedSubscription.unsubscribe();
    });
  }

  private markDateAsSelected(date: CalendarDay) {
    const selectedMomentObj = moment(date.momentObj);

    date.isSelected = true;
    const isAlreadySelected = this.calendarManager.determineIfDateIsSelected(date, this.calendar.previouslySelected);

    if (this.range) {
      const dateIndex = this.calendarManager.getDateIndex(date, this.calendar.previouslySelected);
      if (isAlreadySelected) {
        this.calendar.previouslySelected[dateIndex].isSelected = false;
        this.calendar.previouslySelected.splice(dateIndex, 1);
        this.selectedDates = this.selectedDates.remove(dateIndex);
      } else {
        this.selectedDates = this.selectedDates.push(selectedMomentObj);
        this.calendar.previouslySelected.push(date);
      }

    } else {
      this.selectedDates = this.selectedDates.clear();
      this.selectedDates = this.selectedDates.push(selectedMomentObj);

      if (this.calendar.previouslySelected.length > 0 && !Object.is(date, this.calendar.previouslySelected[0])) {
        this.calendar.previouslySelected[0].isSelected = false;
        this.calendar.previouslySelected.pop();
      }
    }

    this.calendar.previouslySelected.push(date);
    this.setValueResult();
  }

  private setValueResult() {
    let result: any = this.selectedDates.toArray();

    if (this.dateObjectType === DateObjectType.Date) {
      result = result.map((momentObj) => {
        return momentObj.toDate();
      });
    }

    if (this.range) {
      this.value = result;
    } else {
      this.value = result[0];
    }
  }
}
