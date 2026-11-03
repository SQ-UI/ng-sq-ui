/**
 * Payload of the `pageChange` output of `sq-paginator` (and the re-emitted one of `sq-datatable`).
 */
export interface PageChangeEvent {
  page: number;
  firstItemIndex: number;
}
