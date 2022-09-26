import { NgModule } from '@angular/core';
import { NgFormElementsModule } from '@sq-ui/ng-form-elements';
import { NgProgressBarModule } from '@sq-ui/ng-progress-bar';
import { NgModalModule } from '@sq-ui/ng-modal';
import { NgSqCommonModule } from '@sq-ui/ng-sq-common';
import { NgDatetimePickerModule } from '@sq-ui/ng-datetime-picker';
import { NgDatatableModule } from '@sq-ui/ng-datatable';

@NgModule({
  declarations: [],
  imports: [
    NgSqCommonModule,
    NgFormElementsModule,
    NgDatetimePickerModule,
    NgProgressBarModule,
    NgDatatableModule
  ],
  exports: [
    NgFormElementsModule,
    NgModalModule,
    NgDatetimePickerModule,
    NgDatatableModule,
    NgProgressBarModule,
    NgSqCommonModule
  ]
})
export class NgSqUiModule {}
