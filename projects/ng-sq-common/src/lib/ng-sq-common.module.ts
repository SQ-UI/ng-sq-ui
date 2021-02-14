import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomEventBroadcasterService } from './services/custom-event-broadcaster.service';
import { OutsideClickListenerDirective } from './directives/outside-click-listener.directive';
import { OSDetectorService } from './services/os-detector.service';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { ScrolledToBottomListenerDirective } from './directives/scrolled-to-bottom-listener.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    OSDetectorService,
    CustomEventBroadcasterService
  ],
  declarations: [
    OutsideClickListenerDirective,
    PaginatorComponent,
    ScrolledToBottomListenerDirective
  ],
  exports: [
    OutsideClickListenerDirective,
    PaginatorComponent,
    ScrolledToBottomListenerDirective
  ]
})
export class NgSqCommonModule { }
