import { Component, input, output, signal, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { SortItem } from '../shared/interfaces/sort-item';

@Component({
  selector: '[sq-datatable-column]',
  standalone: true,
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableColumnComponent {
  readonly name = input<string>();
  readonly isSortable = input<boolean>(false);
  readonly width = input<string>();

  readonly onSortClicked = output<SortItem>();

  readonly sortState = signal<boolean | undefined>(undefined);

  get isSortedByAscending(): boolean | undefined {
    return this.sortState();
  }

  sort() {
    const current = this.sortState();

    switch (typeof current) {
      case 'undefined':
        this.sortState.set(true);
        break;
      case 'boolean':
        this.sortState.set(current ? false : undefined);
        break;
    }

    this.onSortClicked.emit({
      name: this.name(),
      isSortedByAscending: this.sortState()
    });
  }
}
