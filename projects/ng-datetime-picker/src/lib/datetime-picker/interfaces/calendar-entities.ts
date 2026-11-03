import { CalendarPeriodRelativityEnum } from '../enums/calendar-period-relativity.enum';
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';

export interface CalendarDay {
  displayDate: string;
  date: Temporal.PlainDate;
  relativityToCurrentMonth: CalendarPeriodRelativityEnum;
  isSelected: boolean;
  isDisabled: boolean;
  /** Range selection (`[isMultipleSelect]`): first day of the selected / pending range. */
  isRangeStart?: boolean;
  /** Range selection: last day of the selected range (or of the hover preview). */
  isRangeEnd?: boolean;
  /** Range selection: between the pending start and the hovered day (not selected yet). */
  isInRangePreview?: boolean;
  /** Range selection: before the pending start date, so it cannot be picked as the end date. */
  isBeforeRangeStart?: boolean;
}

export interface InCalendarPicker {
  displayName: string;
  date: Temporal.PlainDate;
  isDisabled: boolean;
}
