import {
  Component, OnInit, Input, OnDestroy,
  Output, EventEmitter, ViewEncapsulation, forwardRef, ContentChild, TemplateRef
} from '@angular/core';
import { CustomEventDetails } from '@sq-ui/ng-sq-common';
import { CustomEventBroadcasterService } from '@sq-ui/ng-sq-common';
import { InputCoreComponent } from '@sq-ui/ng-sq-common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SqRadiobuttonLabelTemplateDirective } from './radiobutton-templates.directive';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadiobuttonComponent),
  multi: true
};

@Component({
  selector: 'sq-radiobutton',
  templateUrl: './radiobutton.component.html',
  styleUrls: ['./radiobutton.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class RadiobuttonComponent extends InputCoreComponent implements OnInit, OnDestroy {
  private eventBroadcasterSubscription: Subscription;
  @Input() radioValue: any;
  @Input() controlLabel: string;

  @Input() isSelected: boolean;
  @Output() isSelectedChange = new EventEmitter<boolean>();

  @ContentChild(SqRadiobuttonLabelTemplateDirective, { read: TemplateRef }) radioButtonTemplate: TemplateRef<any>;

  constructor(private eventBroadcaster: CustomEventBroadcasterService) {
    super();
  }

  ngOnInit() {
    this.eventBroadcasterSubscription = this.eventBroadcaster.subscribeFor(
      'sqRadio:selected',
      (eventDetails: CustomEventDetails) => {
        if (eventDetails.details.group === this.name &&
          !Object.is(this.radioValue, eventDetails.details.sqRadio.radioValue)) {
          this.isSelected = false;
          this.value = eventDetails.details.sqRadio.radioValue;
          this.isSelectedChange.emit(false);
        }
      });
  }

  ngOnDestroy() {
    this.eventBroadcasterSubscription.unsubscribe();
  }

  selectRadio() {
    this.eventBroadcaster.broadcastEvent(
      'sqRadio:selected',
      {
        details: {
          group: this.name,
          sqRadio: this
        }
      });

    this.isSelected = true;
    this.value = this.radioValue;
    this.isSelectedChange.emit(true);
  }
}
