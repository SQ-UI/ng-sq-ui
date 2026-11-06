import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DropdownComponent, type DropdownSize, type DropdownOption } from '@sq-ui/ng-form-elements';

@Component({
  selector: 'sq-dropdown-preview',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './dropdown-preview.component.html',
  styleUrls: ['./dropdown-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownPreviewComponent {
  readonly sizes: { value: DropdownSize; label: string; rowHeight: number }[] = [
    { value: 's', label: 'S', rowHeight: 40 }, { value: 'm', label: 'M', rowHeight: 48 },
    { value: 'l', label: 'L', rowHeight: 60 },
  ];
  readonly options: DropdownOption[] = [
    { label: 'Option Default', value: 'default' },
    { label: 'Option Middle Selected', value: 'selected' },
    { label: 'Option Bottom Disabled', value: 'disabled', disabled: true },
  ];
  readonly selected = { label: 'Selected', value: 'selected' };
  readonly longOptions: DropdownOption[] = [
    { label: 'Option Top', value: 1 }, { label: 'Option Hover', value: 2 },
    { label: 'Option Middle', value: 3 }, { label: 'Option Disabled', value: 4, disabled: true },
    { label: 'Option Middle', value: 5 }, { label: 'Option Bottom', value: 6 },
  ];
}
