import { NgModule } from '@angular/core';
import { FormElementsModule } from './form-elements/form-elements.module';
import { ModalModule } from './modal/modal.module';
import { ProgressBarModule } from './progress-bar/progress-bar.module';
import { SharedModule } from './shared/shared.module';
import { NgDatetimePickerModule } from 'ng-datetime-picker';
import { DatatableModule } from 'ng-datatable';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    FormElementsModule,
    NgDatetimePickerModule,
    ProgressBarModule,
    DatatableModule
  ],
  exports: [
    FormElementsModule,
    ModalModule,
    NgDatetimePickerModule,
    ProgressBarModule,
    DatatableModule
  ],
})
export class NgSqUiModule {}
