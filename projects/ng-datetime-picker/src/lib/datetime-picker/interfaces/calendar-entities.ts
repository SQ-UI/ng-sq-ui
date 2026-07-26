import { Temporal } from '@js-temporal/polyfill';
import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';

export interface CalendarDay {
  displayDate: string;
  plainDate: Temporal.PlainDate;
  relativityToCurrentMonth: CalendarPeriodRelativityEnum;
  isSelected: boolean;
  isDisabled: boolean;
}

export interface InCalendarPicker {
  displayName: string;
  plainDate: Temporal.PlainDate;
  isDisabled: boolean;
}
