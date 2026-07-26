import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  computed,
  input,
} from "@angular/core";

@Component({
  selector: "[sq-datatable-row]",
  templateUrl: "./datatable-row.component.html",
  styleUrls: ["./datatable-row.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class DatatableRowComponent {
  readonly rowItem = input<{ [key: string]: any }>({});
  readonly width = input<string>();

  readonly columns = computed<string[]>(() => {
    if (this.width()) {
      return [];
    }

    return Object.keys(this.rowItem());
  });
}
