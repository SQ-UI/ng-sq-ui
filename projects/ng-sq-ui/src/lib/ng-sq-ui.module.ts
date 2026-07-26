import { NgModule } from '@angular/core';
import { NgFormElementsModule } from '@sq-ui/ng-form-elements';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';
import { ModalComponent } from '@sq-ui/ng-modal';
import { PaginatorComponent, OutsideClickListenerDirective, ScrolledToBottomListenerDirective } from '@sq-ui/ng-sq-common';
import { NgDatetimePickerModule } from '@sq-ui/ng-datetime-picker';
import { NgDatatableModule } from '@sq-ui/ng-datatable';

@NgModule({
  declarations: [],
  imports: [
    PaginatorComponent,
    OutsideClickListenerDirective,
    ScrolledToBottomListenerDirective,
    NgFormElementsModule,
    NgDatetimePickerModule,
    ProgressBarComponent,
    NgDatatableModule
  ],
  exports: [
    NgFormElementsModule,
    ModalComponent,
    NgDatetimePickerModule,
    NgDatatableModule,
    ProgressBarComponent,
    PaginatorComponent,
    OutsideClickListenerDirective,
    ScrolledToBottomListenerDirective
  ]
})
export class NgSqUiModule {}
