import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DatetimePickerComponent
  ],
  exports: [
    DatetimePickerComponent
  ]
})
export class DatetimePickerModule { }
