import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormValueControl } from '@angular/forms/signals';
import { RadioGroupRegistry, SqInputCore } from '@sq-ui/ng-sq-common';
import { SqRadiobuttonLabelTemplateDirective } from './radiobutton.template.directive';

@Component({
  selector: 'sq-radiobutton',
  templateUrl: './radiobutton.component.html',
  styleUrls: ['./radiobutton.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class RadiobuttonComponent extends SqInputCore implements FormValueControl<any> {
  private readonly registry = inject(RadioGroupRegistry);

  readonly radioValue = input<any>(undefined);
  readonly value = model<any>(undefined);

  readonly radioButtonTemplate = contentChild(SqRadiobuttonLabelTemplateDirective, { read: TemplateRef });

  private readonly groupValue = computed(() => this.registry.group(this.name())());

  readonly isSelected = computed(() => Object.is(this.groupValue(), this.radioValue()));

  constructor() {
    super();

    effect(() => this.syncFromGroup());
  }

  selectRadio(): void {
    this.registry.select(this.name(), this.radioValue());
    this.value.set(this.radioValue());
  }

  protected syncFromGroup(): void {
    const selected = this.groupValue();

    if (selected !== null && !Object.is(selected, this.radioValue()) && !Object.is(this.value(), selected)) {
      this.value.set(selected);
    }
  }
}
