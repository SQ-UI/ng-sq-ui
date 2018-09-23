import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import * as momentNs from 'moment';
const moment = momentNs;

export interface CalendarDay {
  displayDate: string;
  momentObj: momentNs.Moment;
  relativityToCurrentMonth: CalendarPeriodRelativityEnum;
  isSelected: boolean;
  isDisabled: boolean;
}

export interface InCalendarPicker {
  displayName: string;
  momentObj: momentNs.Moment;
}
