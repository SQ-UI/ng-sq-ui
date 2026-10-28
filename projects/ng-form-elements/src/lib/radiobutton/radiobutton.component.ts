import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, computed, contentChild, output, inject, DestroyRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { generateFormFieldId } from '@sq-ui/ng-sq-common';
import { CustomEventBroadcasterService } from '@sq-ui/ng-sq-common';
import { SqRadiobuttonLabelTemplateDirective } from './radiobutton.template.directive';

@Component({
  selector: 'sq-radiobutton',
  standalone: true,
  templateUrl: './radiobutton.component.html',
  styleUrls: ['./radiobutton.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgTemplateOutlet, SqRadiobuttonLabelTemplateDirective],
})
export class RadiobuttonComponent {
  private readonly eventBroadcaster = inject(CustomEventBroadcasterService);
  private readonly destroyRef = inject(DestroyRef);

  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Two-way binding value
  readonly value = model<any>(null);

  // Radio-specific inputs and state
  readonly radioValue = input<any>(null);
  readonly isSelected = computed(() => Object.is(this.value(), this.radioValue()));
  readonly isSelectedChange = output<boolean>();

  // Content child for custom label template
  readonly labelTemplate = contentChild(SqRadiobuttonLabelTemplateDirective);

  constructor() {
    const subscription = this.eventBroadcaster.subscribeFor(
      'sqRadio:selected',
      (eventDetails) => {
        if (eventDetails && eventDetails.details.group === this.name() &&
          !Object.is(this.radioValue(), eventDetails.details.sqRadio.radioValue)) {
          this.value.set(eventDetails.details.sqRadio.radioValue);
          this.isSelectedChange.emit(false);
        }
      }
    );

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  selectRadio() {
    this.value.set(this.radioValue());

    this.eventBroadcaster.broadcastEvent(
      'sqRadio:selected',
      {
        details: {
          group: this.name(),
          sqRadio: { radioValue: this.radioValue() }
        }
      }
    );

    this.isSelectedChange.emit(true);
  }
}
