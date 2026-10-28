import { Component, ViewEncapsulation, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'sq-form-group',
  standalone: true,
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGroupComponent {
  groupLabel = input<string>('');
}
