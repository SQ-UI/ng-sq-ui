import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SqUiComponent } from './sq-ui/sq-ui.component';
import { routing } from './sq-ui-routing';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  declarations: [SqUiComponent]
})
export class SqUiModule { }
