import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CalendarManagerService } from './calendar-manager.service';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { TimePickerComponent } from './time-picker/time-picker.component';

@NgModule({
  imports: [
    TimePickerComponent,
    DatetimePickerComponent
  ],
  exports: [
    TimePickerComponent,
    DatetimePickerComponent
  ],
  providers: [CalendarManagerService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class DatetimePickerModule { }
