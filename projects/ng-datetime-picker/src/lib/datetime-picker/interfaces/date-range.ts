import moment from 'moment';


export interface DateRange {
  minDate: moment.Moment | Date;
  maxDate: moment.Moment | Date;
}
