import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';


/** `null` / `undefined` mean "no limit" on that side. */
export interface DateRange {
  minDate: Temporal.PlainDate | Date | null | undefined;
  maxDate: Temporal.PlainDate | Date | null | undefined;
}
