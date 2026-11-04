import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatatableComponent } from '@sq-ui/ng-datatable';

@Component({
  selector: 'sq-table-preview',
  standalone: true,
  imports: [DatatableComponent],
  templateUrl: './table-preview.component.html',
  styleUrls: ['./table-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePreviewComponent {
  readonly rows = Array.from({ length: 66 }, () => ({
    'Title 1': 'Item 1', 'Hover': 'Item 2', 'Title 3': 'Item 3', 'Title 4': 'Item 4',
    'Title 5': 'Item 5', 'Title 6': 'Item 6', 'Title 7': 'Item 7', 'Title 8': 'Item 8',
  }));
  readonly pagination = { itemsPerPage: 6, maxDisplayedPages: 3 };
}
