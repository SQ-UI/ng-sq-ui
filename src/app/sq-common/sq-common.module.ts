import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqCommonComponent } from './common/sq-common.component';
import { routing } from './sq-common-routing';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  declarations: [SqCommonComponent],
  exports: [SqCommonComponent]
})
export class SqCommonModule { }
