import { NgModule } from '@angular/core';
import { FormElementsModule } from './form-elements/form-elements.module';
import { ModalModule } from './modal/modal.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    FormElementsModule,
    SharedModule
  ],
  declarations: [],
  exports: [FormElementsModule, ModalModule]
})
export class NgSqUiModule { }
