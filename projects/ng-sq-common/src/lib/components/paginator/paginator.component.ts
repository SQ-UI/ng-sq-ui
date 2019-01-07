import {
  Component, OnInit, Input, Output,
  EventEmitter, OnChanges, ViewEncapsulation
} from '@angular/core';
import { Page } from '../../interfaces/page';

@Component({
  selector: 'sq-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaginatorComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Input() lastPage: number;
  @Input() maxDisplayedPages: number = 3;
  @Input() paginatedCollection = [];
  @Output() paginatedCollectionChange = new EventEmitter();
  @Output() pageChange: EventEmitter<{ page: number, firstItemIndex: number }> = new EventEmitter();

  pages: Page[] = [];
  _paginatedCollection = [];
  disableNextBtns: boolean = false;
  disablePrevBtns: boolean = true;

  private currentPageNumber = 1;
  private hasSelectedCurrentPageByAuthor = false;

  constructor() { }

  ngOnInit() {
    this.itemsPerPage = this.itemsPerPage || 10;
    this.maxDisplayedPages = this.maxDisplayedPages || 3;
  }

  ngOnChanges(changesObj) {
    if (changesObj.items && changesObj.items.currentValue) {
      this.generatePaginatedCollection(this.currentPageNumber);
      this.updatePageCount(this.lastPage);

      if (this.currentPage && !this.hasSelectedCurrentPageByAuthor) {
        this.selectCurrentPageProgramatically();
      }

      this.toggleControlEnabling();
    }

    if (changesObj.itemsPerPage && changesObj.itemsPerPage.currentValue &&
        changesObj.itemsPerPage.currentValue > 0) {
      this.updatePageCount(this.lastPage);
    }

    if (changesObj.currentPage && changesObj.currentPage.currentValue &&
        changesObj.currentPage.currentValue > 0) {
      this.hasSelectedCurrentPageByAuthor = false;
      this.selectCurrentPageProgramatically();
    }

    if (changesObj.lastPage && changesObj.lastPage.currentValue &&
        changesObj.lastPage.currentValue > 0) {
      this.updatePageCount(changesObj.lastPage.currentValue);
    }

    if (changesObj.maxDisplayedPages && changesObj.maxDisplayedPages.currentValue &&
      changesObj.maxDisplayedPages.currentValue > 0) {
      this.updatePageCount(this.lastPage);
    }
  }

  onPageClick(page) {
    this.selectPage(page);
    this.pageChange.emit({
      page: page.number,
      firstItemIndex: this.items.indexOf(this._paginatedCollection[0])
    });
  }

  navigateToPage(newPageDifference: number) {
    const selectedItemIndex = this.pages.findIndex((pageItem) => {
      return pageItem.isSelected === true;
    });

    const newPageItem = this.pages[selectedItemIndex + newPageDifference];
    this.onPageClick(newPageItem);
  }

  private updatePageCount(lastPage?: number) {
    const pageCount = lastPage || Math.ceil(this.items.length / this.itemsPerPage);
    this.pages = [];

    if (!pageCount || this.items.length === 0) {
      return;
    }

    if (pageCount === 1) {
      this.pages.push({
        number: 1,
        isSelected: false,
        isHidden: false
      });
    } else {
      for (let i = 1; i <= pageCount; i++) {
        this.pages.push({
          number: i,
          isSelected: false,
          isHidden: true
        });
      }
    }

    const selectedItem = this.pages.find((pageItem) => {
      return pageItem.number === this.currentPageNumber;
    });

    selectedItem.isSelected = true;

    this.hidePages();
  }

  private selectPage(page: Page) {
    const previousPage = this.pages.find((pageItem) => {
      return pageItem.isSelected === true;
    });

    previousPage.isSelected = false;
    page.isSelected = true;

    this.toggleControlEnabling(page);
    this.generatePaginatedCollection(page.number);
  }

  private generatePaginatedCollection(newPage: number) {
    let newUpperLimit = this.itemsPerPage * newPage;
    let lowerLimit = newUpperLimit - this.itemsPerPage;

    if (!this.items[lowerLimit]) {
      newUpperLimit = this.items.length - 1;
      lowerLimit = newUpperLimit - this.itemsPerPage;
    }

    this._paginatedCollection = this.items.slice(lowerLimit, newUpperLimit);
    this.currentPageNumber = newPage;

    setTimeout(() => {
      this.paginatedCollectionChange.emit(this._paginatedCollection);
    }, 100);
  }

  private toggleControlEnabling(page?: Page) {
    if (!page) {
      page = this.pages.find((pageItem) => {
        return pageItem.number === this.currentPageNumber;
      });
    }

    this.disablePrevBtns = (this.pages.indexOf(page) === 0);
    this.disableNextBtns = (this.pages.indexOf(page) === this.pages.length - 1);
  }

  private hidePages() {
    const selectedItemIndex = this.pages.findIndex((pageItem) => {
      return pageItem.isSelected === true;
    });

    const lastVisiblePagesFromBeginning = selectedItemIndex + this.maxDisplayedPages - 1;
    const lastVisiblePagesFromEnd = this.pages.length - 1 - this.maxDisplayedPages;

    this.pages.forEach((pageItem, index) => {
      if ((index >= selectedItemIndex && index <= lastVisiblePagesFromBeginning) ||
        index === 0 || index > lastVisiblePagesFromEnd) {
        pageItem.isHidden = false;
      }
    });
  }

  private selectCurrentPageProgramatically() {
    const pageToSelect = this.pages.find((page: Page) => {
      return page.number === this.currentPage;
    });

    if (pageToSelect) {
      this.selectPage(pageToSelect);
      this.hidePages();
      this.hasSelectedCurrentPageByAuthor = true;
    }
  }

}
