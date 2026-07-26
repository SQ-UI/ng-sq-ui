import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import { Temporal } from '@js-temporal/polyfill';

export interface CalendarDay {
  displayDate: string;
  date: Temporal.PlainDate;
  relativityToCurrentMonth: CalendarPeriodRelativityEnum;
  isSelected: boolean;
  isDisabled: boolean;
}

export interface InCalendarPicker {
  displayName: string;
  date: Temporal.PlainDate;
  isDisabled: boolean;
}
