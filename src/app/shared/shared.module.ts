import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModuleOverviewComponent } from './module-overview/module-overview.component';
import { CollapseContentComponent } from './collapse-content/collapse-content.component';
export { NavItem } from './nav-item';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    ModuleOverviewComponent,
    CollapseContentComponent
  ],
  exports: [
    ModuleOverviewComponent,
    CollapseContentComponent
  ]
})
export class SharedModule { }
