import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomEventBroadcasterService } from './services/custom-event-broadcaster.service';
import { OutsideClickListenerDirective } from './directives/outside-click-listener.directive';
import { OSDetectorService } from './services/os-detector.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    OSDetectorService,
    CustomEventBroadcasterService
  ],
  declarations: [OutsideClickListenerDirective],
  exports: [
    OutsideClickListenerDirective
  ]
})
export class NgSqCommonModule { }
