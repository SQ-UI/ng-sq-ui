import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSqCommonModule } from '@sq-ui/ng-sq-common';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  imports: [
    CommonModule,
    NgSqCommonModule
  ],
  declarations: [ModalComponent],
  exports: [ModalComponent]
})
export class NgModalModule { }
