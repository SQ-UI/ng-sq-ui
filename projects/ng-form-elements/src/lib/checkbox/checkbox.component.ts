import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormCheckboxControl } from '@angular/forms/signals';
import { SqInputCore } from '@sq-ui/ng-sq-common';
import { SqCheckboxLabelTemplateDirective } from './checkbox.template.directive';

@Component({
  selector: 'sq-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class CheckboxComponent extends SqInputCore implements FormCheckboxControl {
  readonly checked = model(false);

  readonly checkboxTemplate = contentChild(SqCheckboxLabelTemplateDirective, { read: TemplateRef });

  toggleCheckboxSelection(): void {
    this.checked.update((isChecked) => !isChecked);
  }
}
