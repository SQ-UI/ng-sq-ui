import { CalendarDay } from './calendar-day';

export interface MonthCalendar {
  table: Array<CalendarDay[]>;
  previouslySelected: CalendarDay[];
}
