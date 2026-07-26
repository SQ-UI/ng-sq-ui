import { Temporal } from '@js-temporal/polyfill';


export interface DateRange {
  minDate: Temporal.PlainDate | Date | undefined;
  maxDate: Temporal.PlainDate | Date | undefined;
}
