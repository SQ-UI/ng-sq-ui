import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ModalComponent],
  exports: [ModalComponent]
})
export class NgModalModule { }
