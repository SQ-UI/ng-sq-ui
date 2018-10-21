import * as momentNs from 'moment';
const moment = momentNs;

export interface DateRange {
  minDate: momentNs.Moment | Date;
  maxDate: momentNs.Moment | Date;
}
