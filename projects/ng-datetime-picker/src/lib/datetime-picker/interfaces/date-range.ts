import { Temporal } from '@js-temporal/polyfill';

/**
 * Value shapes accepted by {@link DateRange} bounds.
 *
 * - `Temporal.PlainDate` — preferred, calendar-only date.
 * - `Date` — normalised to `PlainDate` via the host's timezone.
 * - `string` — ISO 8601 date (or date-time); parsed via `Temporal.PlainDate.from`.
 */
export type DateRangeBound = Temporal.PlainDate | Date | string;

export interface DateRange {
  minDate: DateRangeBound | null | undefined;
  maxDate: DateRangeBound | null | undefined;
}
