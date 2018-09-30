import { NgModule } from '@angular/core';
import { FormElementsModule } from './form-elements/form-elements.module';
import { ModalModule } from './modal/modal.module';
import { SharedModule } from './shared/shared.module';
import { DatetimePickerModule } from './datetime-picker/datetime-picker.module';

@NgModule({
  imports: [
    SharedModule,
    FormElementsModule,
    DatetimePickerModule
  ],
  exports: [
    FormElementsModule,
    ModalModule,
    DatetimePickerModule
  ]
})
export class NgSqUiModule { }
