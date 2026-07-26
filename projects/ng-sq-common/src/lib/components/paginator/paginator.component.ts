import { NgClass } from "@angular/common";
import {
  Component,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  output,
  model,
} from "@angular/core";
import { Page } from "../../interfaces/page";

@Component({
  selector: "sq-paginator",
  templateUrl: "./paginator.component.html",
  styleUrls: ["./paginator.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass],
})
export class PaginatorComponent implements OnChanges {
  readonly items = input<any[]>([]);
  readonly itemsPerPage = input<number>(10);
  readonly currentPage = input<number>(1);
  readonly lastPage = input<number | undefined>(undefined);
  readonly maxDisplayedPages = input<number>(3);
  readonly paginatedCollection = model<any[]>([]);
  readonly pageChange = output<{ page: number; firstItemIndex: number }>();

  pages: Page[] = [];
  disableNextBtns: boolean = false;
  disablePrevBtns: boolean = true;

  private currentPageNumber = 1;
  private hasSelectedCurrentPageByAuthor = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes["items"] && changes["items"].currentValue) {
      this.generatePaginatedCollection(this.currentPageNumber);
      this.updatePageCount(this.lastPage());

      if (this.currentPage() && !this.hasSelectedCurrentPageByAuthor) {
        this.selectCurrentPageProgramatically();
      }

      this.toggleControlEnabling();
    }

    if (
      changes["itemsPerPage"] &&
      changes["itemsPerPage"].currentValue &&
      changes["itemsPerPage"].currentValue > 0
    ) {
      this.updatePageCount(this.lastPage());
    }

    if (
      changes["currentPage"] &&
      changes["currentPage"].currentValue &&
      changes["currentPage"].currentValue > 0
    ) {
      this.hasSelectedCurrentPageByAuthor = false;
      this.selectCurrentPageProgramatically();
    }

    if (
      changes["lastPage"] &&
      changes["lastPage"].currentValue &&
      changes["lastPage"].currentValue > 0
    ) {
      this.updatePageCount(changes["lastPage"].currentValue);
    }

    if (
      changes["maxDisplayedPages"] &&
      changes["maxDisplayedPages"].currentValue &&
      changes["maxDisplayedPages"].currentValue > 0
    ) {
      this.updatePageCount(this.lastPage());
    }
  }

  onPageClick(page: Page) {
    this.selectPage(page);
    this.pageChange.emit({
      page: page.number,
      firstItemIndex: this.items().indexOf(this.paginatedCollection()[0]),
    });
  }

  navigateToPage(newPageDifference: number) {
    const selectedItemIndex = this.pages.findIndex((pageItem) => {
      return pageItem.isSelected === true;
    });

    const newPageItem = this.pages[selectedItemIndex + newPageDifference];
    this.onPageClick(newPageItem);
  }

  private get effectiveItemsPerPage(): number {
    return this.itemsPerPage() || 10;
  }

  private get effectiveMaxDisplayedPages(): number {
    return this.maxDisplayedPages() || 3;
  }

  private updatePageCount(lastPage?: number) {
    const items = this.items();
    const pageCount = lastPage || Math.ceil(items.length / this.effectiveItemsPerPage);
    this.pages = [];

    if (!pageCount || items.length === 0) {
      return;
    }

    if (pageCount === 1) {
      this.pages.push({
        number: 1,
        isSelected: false,
        isHidden: false,
      });
    } else {
      for (let i = 1; i <= pageCount; i++) {
        this.pages.push({
          number: i,
          isSelected: false,
          isHidden: true,
        });
      }
    }

    const selectedItem = this.pages.find((pageItem) => {
      return pageItem.number === this.currentPageNumber;
    });

    if (selectedItem) {
      selectedItem.isSelected = true;
    }

    this.hidePages();
  }

  private selectPage(page: Page) {
    const previousPage = this.pages.find((pageItem) => {
      return pageItem.isSelected === true;
    });

    if (previousPage) {
      previousPage.isSelected = false;
    }
    page.isSelected = true;

    this.toggleControlEnabling(page);
    this.generatePaginatedCollection(page.number);
  }

  private generatePaginatedCollection(newPage: number) {
    const items = this.items();
    let newUpperLimit = this.effectiveItemsPerPage * newPage;
    let lowerLimit = newUpperLimit - this.effectiveItemsPerPage;

    if (!items[lowerLimit]) {
      newUpperLimit = items.length - 1;
      lowerLimit = newUpperLimit - this.effectiveItemsPerPage;
    }

    const paginatedCollection = items.slice(lowerLimit, newUpperLimit);
    this.currentPageNumber = newPage;

    setTimeout(() => {
      this.paginatedCollection.set(paginatedCollection);
    }, 100);
  }

  private toggleControlEnabling(page?: Page) {
    if (!page) {
      page = this.pages.find((pageItem) => {
        return pageItem.number === this.currentPageNumber;
      });
    }

    if (!page) {
      return;
    }

    this.disablePrevBtns = this.pages.indexOf(page) === 0;
    this.disableNextBtns = this.pages.indexOf(page) === this.pages.length - 1;
  }

  private hidePages() {
    const selectedItemIndex = this.pages.findIndex((pageItem) => {
      return pageItem.isSelected === true;
    });

    const lastVisiblePagesFromBeginning =
      selectedItemIndex + this.effectiveMaxDisplayedPages - 1;
    const lastVisiblePagesFromEnd =
      this.pages.length - 1 - this.effectiveMaxDisplayedPages;

    this.pages.forEach((pageItem, index) => {
      if (
        (index >= selectedItemIndex &&
          index <= lastVisiblePagesFromBeginning) ||
        index === 0 ||
        index > lastVisiblePagesFromEnd
      ) {
        pageItem.isHidden = false;
      }
    });
  }

  private selectCurrentPageProgramatically() {
    const pageToSelect = this.pages.find((page: Page) => {
      return page.number === this.currentPage();
    });

    if (pageToSelect) {
      this.selectPage(pageToSelect);
      this.hidePages();
      this.hasSelectedCurrentPageByAuthor = true;
    }
  }
}
