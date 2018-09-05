import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutsideClickListenerDirective } from './directives/outside-click-listener.directive';
import { CustomEventBroadcasterService } from './services/custom-event-broadcaster.service';
import { OSDetectorService } from './services/os-detector.service';
import { LabelValuePair } from './interfaces/label-value-pair';

export { LabelValuePair };
export { OutsideClickListenerDirective };
export { OSDetectorService };

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [CustomEventBroadcasterService, OSDetectorService],
  declarations: [OutsideClickListenerDirective],
  exports: [OutsideClickListenerDirective]
})
export class SharedModule { }
