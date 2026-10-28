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
  readonly rowItem = input<{[key: string]: any}>();
  readonly width = input<string>();

  readonly columnKeys = computed(() => {
    const item = this.rowItem();
    if (!this.width() && item) {
      return Object.keys(item);
    }
    return [];
  });
}
