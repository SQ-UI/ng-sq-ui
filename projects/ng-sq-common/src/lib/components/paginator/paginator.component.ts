import {
  Component, input, output, model, effect, signal, computed, untracked,
  ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Page } from '../../interfaces/page';
import { PageChangeEvent } from '../../interfaces/page-change-event';
import type { Size } from '../../interfaces/sizes';

@Component({
  selector: 'sq-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  imports: [NgClass],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent<TItem = unknown> {
  size = input<Size>('small');
  label = input<string>('Pagination');
  items = input<TItem[] | undefined>([]);
  itemsPerPage = input<number | undefined>(10);
  currentPage = input<number | undefined>(1);
  lastPage = input<number | undefined>(undefined);
  maxDisplayedPages = input<number | undefined>(3);
  paginatedCollection = model<TItem[]>([]);
  pageChange = output<PageChangeEvent>();

  /** The page the user (or `[currentPage]`) asked for, before clamping to the available pages. */
  private readonly requestedPage = signal<number>(1);

  private readonly pageSize = computed(() => this.itemsPerPage() || 10);

  /** `[lastPage]` wins (server-side paging); otherwise the count follows the loaded items. */
  readonly pageCount = computed(() => {
    const itemCount = (this.items() ?? []).length;

    if (itemCount === 0) {
      return 0;
    }

    return this.lastPage() || Math.ceil(itemCount / this.pageSize());
  });

  private readonly currentPageNumber = computed(() =>
    Math.min(Math.max(this.requestedPage(), 1), Math.max(this.pageCount(), 1))
  );

  /** Rebuilt (immutably) from the inputs and the current page; never mutated in place. */
  readonly pages = computed<Page[]>(() => {
    const pageCount = this.pageCount();
    const selectedIndex = this.currentPageNumber() - 1;
    const maxDisplayedPages = this.maxDisplayedPages() || 3;
    const lastWindowIndex = selectedIndex + maxDisplayedPages - 1;
    const firstTrailingIndex = pageCount - maxDisplayedPages;

    return Array.from({ length: pageCount }, (_, index) => ({
      number: index + 1,
      isSelected: index === selectedIndex,
      // Visible: the window starting at the selected page, the first page and the trailing pages.
      isHidden: !((index >= selectedIndex && index <= lastWindowIndex) ||
        index === 0 || index >= firstTrailingIndex),
    }));
  });

  /**
   * Items of the current page. With `[lastPage]` beyond the loaded items the page can be empty
   * until the parent loads it (see `(pageChange)`).
   */
  readonly _paginatedCollection = computed<TItem[]>(() => {
    const pageSize = this.pageSize();
    const lowerLimit = (this.currentPageNumber() - 1) * pageSize;

    return (this.items() ?? []).slice(lowerLimit, lowerLimit + pageSize);
  });

  readonly disablePrevBtns = computed(() => this.currentPageNumber() <= 1);
  readonly disableNextBtns = computed(() => this.currentPageNumber() >= this.pageCount());

  constructor() {
    // `[currentPage]` selects a page whenever the input itself changes.
    effect(() => {
      const currentPage = this.currentPage();
      if (currentPage && currentPage > 0) {
        untracked(() => this.requestedPage.set(currentPage));
      }
    });

    // Publishes the visible page on every change (items, sorting, page size, ...).
    effect(() => {
      const collection = this._paginatedCollection();
      untracked(() => this.paginatedCollection.set(collection));
    });
  }

  onPageClick(page: Page | undefined) {
    if (!page) {
      return;
    }

    this.requestedPage.set(page.number);
    // Emitted synchronously so the parent sees the new page within the same click.
    this.paginatedCollection.set(this._paginatedCollection());
    this.pageChange.emit({
      page: page.number,
      firstItemIndex: (page.number - 1) * this.pageSize()
    });
  }

  navigateToPage(newPageDifference: number) {
    const targetPage = this.currentPageNumber() + newPageDifference;
    this.onPageClick(this.pages()[targetPage - 1]);
  }
}
