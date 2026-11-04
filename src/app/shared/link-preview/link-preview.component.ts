import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sq-link-preview',
  standalone: true,
  templateUrl: './link-preview.component.html',
  styleUrls: ['./link-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPreviewComponent {
  readonly anchorStates = [
    { name: 'brand', label: 'Brand' }, { name: 'hover', label: 'Hover' },
    { name: 'active', label: 'Active' }, { name: 'disabled', label: 'Disabled' },
  ];
}
