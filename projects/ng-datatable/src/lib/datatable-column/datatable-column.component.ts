import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
} from "@angular/core";
import { SortItem } from "../shared/interfaces/sort-item";

@Component({
  selector: "[sq-datatable-column]",
  templateUrl: "./datatable-column.component.html",
  styleUrls: ["./datatable-column.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class DatatableColumnComponent {
  readonly name = input<string>("");
  readonly isSortable = input(false);
  readonly width = input<string>();

  readonly onSortClicked = output<SortItem>();

  isSortedByAscending: boolean | undefined;

  sort(): void {
    switch (typeof this.isSortedByAscending) {
      case "undefined":
        this.isSortedByAscending = true;
        break;
      case "boolean":
        this.isSortedByAscending = this.isSortedByAscending ? false : undefined;
        break;
    }

    this.onSortClicked.emit({
      name: this.name(),
      isSortedByAscending: this.isSortedByAscending,
    });
  }
}
