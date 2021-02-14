import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatimePickerDocsComponent } from './datatime-picker-docs/datatime-picker-docs.component';
import { SharedModule } from '../shared/shared.module';
import { NgDatetimePickerModule } from '@sq-ui/ng-datetime-picker';
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { DatetimePickerRoutingModule } from './datetime-picker-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NgSqUiModule,
    NgDatetimePickerModule,
    DatetimePickerRoutingModule
  ],
  declarations: [DatatimePickerDocsComponent],
  exports: [DatatimePickerDocsComponent]
})
export class DatetimePickerModule { }
