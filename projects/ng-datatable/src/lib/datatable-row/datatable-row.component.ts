import { Component, computed, input, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: '[sq-datatable-row]',
  standalone: true,
  templateUrl: './datatable-row.component.html',
  styleUrls: ['./datatable-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableRowComponent {
  /** The row is rendered generically: any object works, the keys come from the object itself. */
  readonly rowItem = input<unknown>();
  /**
   * Column order to render. `sq-datatable` passes the header's columns so every row lines up with
   * them; when unbound, the row's own keys are used.
   */
  readonly columns = input<readonly string[] | undefined>(undefined);
  /** @deprecated Has no effect; it used to hide every cell when set. */
  readonly width = input<string>();

  readonly columnKeys = computed<readonly string[]>(() => {
    const columns = this.columns();
    if (columns) {
      return columns;
    }

    const item = this.rowItem();
    return item ? Object.keys(item as Record<string, unknown>) : [];
  });

  /** Cell text per column; interpolating an object rendered `[object Object]`, so stringify once. */
  readonly cells = computed<Record<string, string>>(() => {
    const item = this.rowItem();
    if (!item) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(item as Record<string, unknown>)
        .map(([key, value]) => [key, value === null || value === undefined ? '' : String(value)])
    );
  });
}
