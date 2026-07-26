import { Temporal } from '@js-temporal/polyfill';


export interface DateRange {
  minDate: Temporal.PlainDate | Date;
  maxDate: Temporal.PlainDate | Date;
}
