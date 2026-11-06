import type { Size } from './sizes';

export interface PaginatorConfig {
  size?: Size;
  itemsPerPage?: number;
  currentPage?: number;
  lastPage?: number;
  maxDisplayedPages?: number;
}
