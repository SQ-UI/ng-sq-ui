import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaginatorComponent, type Size } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-paginator-preview',
  standalone: true,
  imports: [PaginatorComponent],
  templateUrl: './paginator-preview.component.html',
  styleUrls: ['./paginator-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorPreviewComponent {
  readonly sizes: { label: string; value: Size }[] = [
    { label: 'S', value: 'small' }, { label: 'M', value: 'medium' }, { label: 'L', value: 'large' },
  ];
  readonly items = Array.from({ length: 110 }, (_, index) => index + 1);
}
