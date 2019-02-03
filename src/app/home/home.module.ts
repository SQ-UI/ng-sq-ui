import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { routing } from './home-routing';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomeModule { }
