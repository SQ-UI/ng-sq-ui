import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqCommonComponent } from './common/sq-common.component';
import { SqCommonRoutingModule } from './sq-common-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SqCommonRoutingModule
  ],
  declarations: [SqCommonComponent],
  exports: [SqCommonComponent]
})
export class SqCommonModule { }
