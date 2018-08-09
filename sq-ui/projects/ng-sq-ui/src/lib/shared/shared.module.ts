import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutsideClickListenerDirective } from './directives/outside-click-listener.directive';
import { CustomEventBroadcasterService } from './services/custom-event-broadcaster.service';
import { LabelValuePair } from './interfaces/label-value-pair';
import { SearchResult } from './interfaces/search-result';
export { LabelValuePair, SearchResult };
export { OutsideClickListenerDirective };

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [CustomEventBroadcasterService],
  declarations: [OutsideClickListenerDirective],
  exports: [OutsideClickListenerDirective]
})
export class SharedModule { }
