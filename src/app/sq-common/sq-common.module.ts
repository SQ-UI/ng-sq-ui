import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqCommonComponent } from './common/sq-common.component';
import { routing } from './sq-common-routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    routing
  ],
  declarations: [SqCommonComponent],
  exports: [SqCommonComponent]
})
export class SqCommonModule { }
