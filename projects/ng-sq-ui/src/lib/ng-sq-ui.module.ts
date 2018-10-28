import { NgModule } from '@angular/core';
import { FormElementsModule } from './form-elements/form-elements.module';
import { ModalModule } from './modal/modal.module';
import { ProgressBarModule } from './progress-bar/progress-bar.module';
import { NgSqCommonModule } from '@sq-ui/ng-sq-common';
import { NgDatetimePickerModule } from 'ng-datetime-picker';
import { DatatableModule } from 'ng-datatable';

@NgModule({
  declarations: [],
  imports: [
    NgSqCommonModule,
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
