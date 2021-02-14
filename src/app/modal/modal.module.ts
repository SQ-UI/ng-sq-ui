import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDocsComponent } from './modal-docs/modal-docs.component';
import { NgModalModule } from '@sq-ui/ng-modal';
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';
import { SharedModule } from '../shared/shared.module';
import { ModalRoutingModule } from './modal-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgModalModule,
    NgSqUiModule,
    ModalRoutingModule
  ],
  declarations: [ModalDocsComponent],
  exports: [ModalDocsComponent]
})
export class ModalModule { }
