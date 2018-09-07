import { NgModule } from '@angular/core';
import { FormElementsModule } from './form-elements/form-elements.module';
import { ModalModule } from './modal/modal.module';
import { ProgressBarModule } from './progress-bar/progress-bar.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [FormElementsModule, SharedModule, ProgressBarModule],
  declarations: [],
  exports: [FormElementsModule, ModalModule, ProgressBarModule],
})
export class NgSqUiModule {}
