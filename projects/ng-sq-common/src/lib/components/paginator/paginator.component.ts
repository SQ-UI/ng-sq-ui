import {
  Component, input, output, effect, signal, untracked,
  ChangeDetectionStrategy, ViewEncapsulation
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Page } from '../../interfaces/page';

@Component({
  selector: 'sq-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  imports: [NgClass],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginatorComponent {
  items = input<any[]>([]);
  itemsPerPage = input<number>(10);
  currentPage = input<number>(1);
  lastPage = input<number | undefined>(undefined);
  maxDisplayedPages = input<number>(3);
  paginatedCollection = input<any[]>([]);

  paginatedCollectionChange = output<any[]>();
  pageChange = output<{ page: number, firstItemIndex: number }>();

  pages = signal<Page[]>([]);
  _paginatedCollection = signal<any[]>([]);
  disableNextBtns = signal<boolean>(false);
  disablePrevBtns = signal<boolean>(true);

  private currentPageNumber = signal<number>(1);
  private hasSelectedCurrentPageByAuthor = false;

  constructor() {
    effect(() => {
      const items = this.items();
      if (items) {
        untracked(() => {
          this.generatePaginatedCollection(this.currentPageNumber());
          this.updatePageCount(this.lastPage());

          if (this.currentPage() && !this.hasSelectedCurrentPageByAuthor) {
            this.selectCurrentPageProgramatically();
          }

          this.toggleControlEnabling();
        });
      }
    });

    effect(() => {
      const itemsPerPage = this.itemsPerPage();
      if (itemsPerPage && itemsPerPage > 0) {
        untracked(() => this.updatePageCount(this.lastPage()));
      }
    });

    effect(() => {
      const currentPage = this.currentPage();
      if (currentPage && currentPage > 0) {
        this.hasSelectedCurrentPageByAuthor = false;
        untracked(() => this.selectCurrentPageProgramatically());
      }
    });

    effect(() => {
      const lastPage = this.lastPage();
      if (lastPage && lastPage > 0) {
        untracked(() => this.updatePageCount(lastPage));
      }
    });

    effect(() => {
      const maxDisplayedPages = this.maxDisplayedPages();
      if (maxDisplayedPages && maxDisplayedPages > 0) {
        untracked(() => this.updatePageCount(this.lastPage()));
      }
    });
  }

  onPageClick(page: Page) {
    this.selectPage(page);
    const paginatedColl = this._paginatedCollection();
    this.pageChange.emit({
      page: page.number,
      firstItemIndex: this.items().indexOf(paginatedColl[0])
    });
  }

  navigateToPage(newPageDifference: number) {
    const currentPages = this.pages();
    const selectedItemIndex = currentPages.findIndex((pageItem) => {
      return pageItem.isSelected === true;
    });

    const newPageItem = currentPages[selectedItemIndex + newPageDifference];
    this.onPageClick(newPageItem);
  }

  private updatePageCount(lastPage?: number) {
    const items = this.items();
    const itemsPerPage = this.itemsPerPage();
    const maxDisplayedPages = this.maxDisplayedPages();
    const pageCount = lastPage || Math.ceil(items.length / itemsPerPage);
    const newPages: Page[] = [];

    if (!pageCount || items.length === 0) {
      this.pages.set(newPages);
      return;
    }

    if (pageCount === 1) {
      newPages.push({
        number: 1,
        isSelected: false,
        isHidden: false
      });
    } else {
      for (let i = 1; i <= pageCount; i++) {
        newPages.push({
          number: i,
          isSelected: false,
          isHidden: true
        });
      }
    }

    const currentPageNum = this.currentPageNumber();
    const selectedItem = newPages.find((pageItem) => {
      return pageItem.number === currentPageNum;
    });

    if (selectedItem) {
      selectedItem.isSelected = true;
    }

    this.hidePages(newPages, maxDisplayedPages);
    this.pages.set(newPages);
  }

  private selectPage(page: Page) {
    const currentPages = [...this.pages()];
    const previousPage = currentPages.find((pageItem) => {
      return pageItem.isSelected === true;
    });

    if (previousPage) {
      previousPage.isSelected = false;
    }
    page.isSelected = true;

    this.pages.set(currentPages);
    this.toggleControlEnabling(page);
    this.generatePaginatedCollection(page.number);
  }

  private generatePaginatedCollection(newPage: number) {
    const items = this.items();
    const itemsPerPage = this.itemsPerPage();
    let newUpperLimit = itemsPerPage * newPage;
    let lowerLimit = newUpperLimit - itemsPerPage;

    if (!items[lowerLimit]) {
      newUpperLimit = items.length - 1;
      lowerLimit = newUpperLimit - itemsPerPage;
    }

    const newCollection = items.slice(lowerLimit, newUpperLimit);
    this._paginatedCollection.set(newCollection);
    this.currentPageNumber.set(newPage);

    setTimeout(() => {
      this.paginatedCollectionChange.emit(newCollection);
    }, 100);
  }

  private toggleControlEnabling(page?: Page) {
    const currentPages = this.pages();
    if (!page) {
      const currentPageNum = this.currentPageNumber();
      page = currentPages.find((pageItem) => {
        return pageItem.number === currentPageNum;
      });
    }

    if (page) {
      this.disablePrevBtns.set(currentPages.indexOf(page) === 0);
      this.disableNextBtns.set(currentPages.indexOf(page) === currentPages.length - 1);
    }
  }

  private hidePages(pagesArray: Page[], maxDisplayedPages: number) {
    const selectedItemIndex = pagesArray.findIndex((pageItem) => {
      return pageItem.isSelected === true;
    });

    const lastVisiblePagesFromBeginning = selectedItemIndex + maxDisplayedPages - 1;
    const lastVisiblePagesFromEnd = pagesArray.length - 1 - maxDisplayedPages;

    pagesArray.forEach((pageItem, index) => {
      if ((index >= selectedItemIndex && index <= lastVisiblePagesFromBeginning) ||
        index === 0 || index > lastVisiblePagesFromEnd) {
        pageItem.isHidden = false;
      }
    });
  }

  private selectCurrentPageProgramatically() {
    const currentPages = this.pages();
    const currentPage = this.currentPage();
    const pageToSelect = currentPages.find((page: Page) => {
      return page.number === currentPage;
    });

    if (pageToSelect) {
      this.selectPage(pageToSelect);
      this.hidePages([...currentPages], this.maxDisplayedPages());
      this.pages.set([...currentPages]);
      this.hasSelectedCurrentPageByAuthor = true;
    }
  }
}
