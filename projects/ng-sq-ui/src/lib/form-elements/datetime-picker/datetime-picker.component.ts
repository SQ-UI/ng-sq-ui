import { Component, forwardRef, OnInit, ViewEncapsulation } from '@angular/core';
import { InputCoreComponent } from '../../shared/entities/input-core-component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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
export class DatetimePickerComponent extends InputCoreComponent implements OnInit {
  weekdays: string[];
  currentDate = moment();
  currentYear = moment().year();
  table = [];

  constructor() {
    super();
  }

  ngOnInit() {
    moment.locale('bg');
    this.weekdays = this.getWeekdays();
    this.table = this.getDatesByWeekdaysMapForMonth(this.currentDate.month());
  }

  getNextCalendarPeriod(current: momentNs.Moment, amount: number, unit: momentNs.unitOfTime.Base) {
    return current.add(amount, unit);
  }

  getPreviousCalendarPeriod(current: momentNs.Moment, amount: number, unit: momentNs.unitOfTime.Base) {
    return current.subtract(amount, unit);
  }

  getWeekdays(short: boolean = true) {
    return short ? moment.weekdaysShort(true) : moment.weekdays(true);
  }

  getDatesByWeekdaysMapForMonth(month: number) {
    const dateIterator = moment().year(this.currentYear).month(month).startOf('month');
    const tableEnd = this.getNextCalendarPeriod(dateIterator, 1, 'month');
    const isStartOfChosenMonthStartOfDisplayedTable = (dateIterator.weekday() === 0);
    const isEndOfNextMonthEndOfDisplayedTable = (tableEnd.weekday() === 6);
    const map = [];

    if (!isStartOfChosenMonthStartOfDisplayedTable) {
      let daysToGoBack = dateIterator.weekday() - 1;
      daysToGoBack = daysToGoBack === 0 ? 1 : daysToGoBack;
      dateIterator.subtract(daysToGoBack, 'days');
    }

    if (!isEndOfNextMonthEndOfDisplayedTable) {
      let daysToGoForward = 6 - tableEnd.weekday();
      daysToGoForward = daysToGoForward === 6 ? 5 : daysToGoForward;
      tableEnd.add(daysToGoForward, 'days');
    }

    while (dateIterator.isSameOrBefore(tableEnd)) {
      let tableRow = [];
      let item = dateIterator.clone();

      if (tableRow.length <= 7) {
        tableRow.push(item.format('DD'));
      } else {
        map.push(tableRow);
        tableRow = [item.format('DD')];
      }

      dateIterator.add(1, 'day');
    }

    return map;
  }

}
