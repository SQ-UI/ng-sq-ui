import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';


export interface DateRange {
  minDate: Temporal.PlainDate | Date | undefined;
  maxDate: Temporal.PlainDate | Date | undefined;
}
