import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { TimePickerComponent } from './time-picker/time-picker.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DatetimePickerComponent,
    TimePickerComponent
  ],
  exports: [
    DatetimePickerComponent,
    TimePickerComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class DatetimePickerModule { }