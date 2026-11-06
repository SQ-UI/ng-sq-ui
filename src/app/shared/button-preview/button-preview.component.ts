import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, type ButtonSize, type ButtonTone } from '@sq-ui/ng-form-elements';

@Component({
  selector: 'sq-button-preview',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './button-preview.component.html',
  styleUrls: ['./button-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPreviewComponent {
  readonly variants: { label: string; tone: ButtonTone; state: string }[] = [
    { label: 'Brand', tone: 'brand', state: 'default' },
    { label: 'OK', tone: 'ok', state: 'default' },
    { label: 'Warning', tone: 'warning', state: 'default' },
    { label: 'Critical', tone: 'critical', state: 'default' },
    { label: 'Hover', tone: 'brand', state: 'hover' },
    { label: 'Disabled', tone: 'brand', state: 'disabled' },
  ];
  readonly sizes: { name: string; value: ButtonSize; height: number }[] = [
    { name: 'S', value: 's', height: 24 }, { name: 'M', value: 'm', height: 32 },
    { name: 'L', value: 'l', height: 40 }, { name: 'XL', value: 'xl', height: 56 },
  ];
}
