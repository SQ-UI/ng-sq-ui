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
  readonly width = input<string>();

  readonly columnKeys = computed(() => {
    const item = this.rowItem();
    if (!this.width() && item) {
      return Object.keys(item as unknown as Record<string, unknown>);
    }
    return [];
  });

  /** Cell text per column; interpolating an object rendered `[object Object]`, so stringify once. */
  readonly cells = computed<Record<string, string>>(() => {
    const item = this.rowItem();
    if (!item) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(item as unknown as Record<string, unknown>)
        .map(([key, value]) => [key, value === null || value === undefined ? '' : String(value)])
    );
  });
}
