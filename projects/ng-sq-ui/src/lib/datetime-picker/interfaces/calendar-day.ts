import { CalendarPeriodRelativity } from '../enums/calendar-period-relativity';

export interface CalendarDay {
  displayDate: string;
  relativityToCurrentMonth: CalendarPeriodRelativity;
  isSelected: boolean;
  isDisabled: boolean;
}
