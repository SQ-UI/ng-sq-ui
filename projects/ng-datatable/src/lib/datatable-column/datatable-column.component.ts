import {
  Component, input, output, linkedSignal, ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { SortItem } from '../shared/interfaces/sort-item';

@Component({
  selector: '[sq-datatable-column]',
  standalone: true,
  templateUrl: './datatable-column.component.html',
  styleUrls: ['./datatable-column.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-sort]': 'isSortable() ? (sortState() === true ? "ascending" : sortState() === false ? "descending" : "none") : null',
  },
})
export class DatatableColumnComponent {
  readonly name = input.required<string>();
  readonly isSortable = input<boolean>(false);
  /**
   * Name of the column the table is currently sorted by. When another column becomes active this
   * column drops back to "unsorted". Leave it unbound to manage each column's state independently.
   */
  readonly activeSortColumn = input<string | null | undefined>(undefined);

  readonly onSortClicked = output<SortItem>();

  /** `true` = ascending, `false` = descending, `undefined` = original order. */
  readonly sortState = linkedSignal<string | null | undefined, boolean | undefined>({
    source: this.activeSortColumn,
    computation: (activeColumn, previous) =>
      activeColumn !== undefined && activeColumn !== this.name() ? undefined : previous?.value,
  });

  sort() {
    const current = this.sortState();
    // Cycles ascending -> descending -> original order.
    const next = current === undefined ? true : (current ? false : undefined);

    this.sortState.set(next);
    this.onSortClicked.emit({
      name: this.name(),
      isSortedByAscending: next
    });
  }
}
