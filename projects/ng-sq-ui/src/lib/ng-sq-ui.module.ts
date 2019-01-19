import { NgModule } from '@angular/core';
import { FormElementsModule } from './form-elements/form-elements.module';
import { ProgressBarModule } from './progress-bar/progress-bar.module';
import { NgModalModule } from '@sq-ui/ng-modal';
import { NgSqCommonModule } from '@sq-ui/ng-sq-common';
import { NgDatetimePickerModule } from '@sq-ui/ng-datetime-picker';
import { NgDatatableModule } from '@sq-ui/ng-datatable';

@NgModule({
  declarations: [],
  imports: [
    NgSqCommonModule,
    FormElementsModule,
    NgDatetimePickerModule,
    ProgressBarModule,
    NgDatatableModule
  ],
  exports: [
    FormElementsModule,
    NgModalModule,
    NgDatetimePickerModule,
    NgDatatableModule,
    ProgressBarModule,
  ]
})
export class NgSqUiModule {}
