import { NgModule } from '@angular/core';
import { DatetimePickerModule } from './datetime-picker/datetime-picker.module';

@NgModule({
  imports: [
    DatetimePickerModule
  ],
  declarations: [],
  exports: [DatetimePickerModule]
})
export class NgDatetimePickerModule { }
