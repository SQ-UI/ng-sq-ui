import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import moment from 'moment';

export interface CalendarDay {
  displayDate: string;
  momentObj: moment.Moment;
  relativityToCurrentMonth: CalendarPeriodRelativityEnum;
  isSelected: boolean;
  isDisabled: boolean;
}

export interface InCalendarPicker {
  displayName: string;
  momentObj: moment.Moment;
  isDisabled: boolean;
}
