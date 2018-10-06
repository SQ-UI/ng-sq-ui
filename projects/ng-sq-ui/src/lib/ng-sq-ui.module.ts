import { NgModule } from '@angular/core';
import { FormElementsModule } from './form-elements/form-elements.module';
import { ModalModule } from './modal/modal.module';
import { SharedModule } from './shared/shared.module';
import { NgDatetimePickerModule } from 'ng-datetime-picker';

@NgModule({
  imports: [SharedModule, FormElementsModule, NgDatetimePickerModule],
  exports: [FormElementsModule, ModalModule, NgDatetimePickerModule],
})
export class NgSqUiModule {}
