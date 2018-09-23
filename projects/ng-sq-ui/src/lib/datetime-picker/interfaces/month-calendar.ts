import { CalendarDay } from './calendar-entities';

export interface MonthCalendar {
  table: Array<CalendarDay[]>;
  previouslySelected: CalendarDay[];
}
