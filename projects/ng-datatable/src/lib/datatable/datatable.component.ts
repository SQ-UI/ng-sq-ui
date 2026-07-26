import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  TemplateRef,
  input,
  output,
  computed,
  contentChild,
  viewChild,
} from "@angular/core";
import { PaginatorComponent, PaginatorConfig } from "@sq-ui/ng-sq-common";
import { DatatableHeaderDirective } from "../directives/datatable-header.directive";
import { DatatableBodyDirective } from "../directives/datatable-body.directive";
import { DatatableColumnComponent } from "../datatable-column/datatable-column.component";
import { DatatableRowComponent } from "../datatable-row/datatable-row.component";
import { SortItem } from "../shared/interfaces/sort-item";
import { DatatableColumn } from "../shared/interfaces/datatable-column";

@Component({
  selector: "sq-datatable",
  templateUrl: "./datatable.component.html",
  styleUrls: ["./datatable.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgTemplateOutlet,
    PaginatorComponent,
    DatatableColumnComponent,
    DatatableRowComponent,
  ],
})
export class DatatableComponent {
  readonly items = input<any[]>([]);
  readonly sortByAllColumns = input(false);
  readonly paginatorConfig = input<PaginatorConfig>({});
  readonly sortByColumns = input<string[]>([]);
  /** When true, only the `onSortClicked` event is emitted and the built-in default sort is skipped. */
  readonly useCustomSort = input(false);

  readonly onSortClicked = output<SortItem>();
  readonly pageChange = output<any>();

  readonly datatableHeaderTemplate = contentChild(DatatableHeaderDirective, { read: TemplateRef });
  readonly datatableBodyTemplate = contentChild(DatatableBodyDirective, { read: TemplateRef });
  readonly paginatorComponent = viewChild<PaginatorComponent>("paginator");

  readonly columnNames = computed<DatatableColumn[]>(() => {
    const firstItem = this.items()[0];

    if (!firstItem) {
      return [];
    }

    const sortByAllColumns = this.sortByAllColumns();
    const sortByColumns = this.sortByColumns();

    return Object.keys(firstItem).map((columnName) => ({
      name: columnName,
      canBeSortedAgainst: sortByAllColumns || sortByColumns.indexOf(columnName) > -1,
    }));
  });

  paginatedCollection: any[] = [];

  onPageChange(event: unknown): void {
    this.pageChange.emit(event);
  }

  sortByField(column: SortItem): void {
    this.onSortClicked.emit(column);

    if (!this.useCustomSort()) {
      this.sortItems(column.name, column.isSortedByAscending);
    }
  }

  private sortItems(columnName: string, ascending: boolean | undefined): void {
    if (typeof ascending === "undefined") {
      ascending = true;
    }

    this.paginatedCollection.sort((rowItem1, rowItem2) => {
      if (rowItem1[columnName] > rowItem2[columnName]) {
        return ascending ? 1 : -1;
      }

      if (rowItem1[columnName] < rowItem2[columnName]) {
        return ascending ? -1 : 1;
      }

      return 0;
    });
  }
}
