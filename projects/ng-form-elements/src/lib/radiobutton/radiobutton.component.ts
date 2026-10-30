import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, computed, contentChild, output, inject, DestroyRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FORM_FIELD_DEFAULTS, generateFormFieldId } from '@sq-ui/ng-sq-common';
import { CustomEventBroadcasterService } from '@sq-ui/ng-sq-common';
import { SqRadiobuttonLabelTemplateDirective } from './radiobutton.template.directive';
import type { SqFormFieldSignals, SqFormValueControl } from '@sq-ui/ng-sq-common';

/** Payload broadcast on `sqRadio:selected` so only one radio per group stays selected. */
interface SqRadioSelectedDetails<TValue> {
  group: string;
  sqRadio: { radioValue: TValue | null };
}

@Component({
  selector: 'sq-radiobutton',
  standalone: true,
  templateUrl: './radiobutton.component.html',
  styleUrls: ['./radiobutton.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class RadiobuttonComponent<TValue = unknown> implements SqFormFieldSignals, SqFormValueControl<TValue | null> {
  private readonly eventBroadcaster = inject(CustomEventBroadcasterService);
  private readonly destroyRef = inject(DestroyRef);

  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>(FORM_FIELD_DEFAULTS.controlLabel);
  readonly controlPlaceholder = input<string>(FORM_FIELD_DEFAULTS.controlPlaceholder);
  readonly required = input<boolean>(FORM_FIELD_DEFAULTS.required);
  readonly pattern = input<readonly RegExp[]>(FORM_FIELD_DEFAULTS.pattern);
  readonly disabled = input<boolean>(FORM_FIELD_DEFAULTS.disabled);

  /** Signals that the user left the control, so `[formField]` can mark the field as touched. */
  readonly touch = output<void>();

  // Two-way binding value
  readonly value = model<TValue | null>(null);

  // Radio-specific inputs and state
  /**
   * The value this radio represents. Opaque here (`unknown`): it is written into `value` as-is, so
   * the component only has to be generic over `value` to keep the binding typed.
   */
  readonly radioValue = input<unknown>(null);
  readonly isSelected = computed(() => Object.is(this.value(), this.radioValue()));
  readonly isSelectedChange = output<boolean>();

  // Content child for custom label template
  readonly labelTemplate = contentChild(SqRadiobuttonLabelTemplateDirective);

  constructor() {
    const subscription = this.eventBroadcaster.subscribeFor<SqRadioSelectedDetails<TValue>>(
      'sqRadio:selected',
      (eventDetails) => {
        const details = eventDetails?.details;

        if (details && details.group === this.name() &&
          !Object.is(this.radioValue(), details.sqRadio.radioValue)) {
          this.value.set(details.sqRadio.radioValue);
          this.isSelectedChange.emit(false);
        }
      }
    );

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  selectRadio() {
    const radioValue = this.radioValue() as TValue | null;
    this.value.set(radioValue);

    this.eventBroadcaster.broadcastEvent<SqRadioSelectedDetails<TValue>>(
      'sqRadio:selected',
      {
        details: {
          group: this.name(),
          sqRadio: { radioValue: radioValue }
        }
      }
    );

    this.isSelectedChange.emit(true);
  }
}
