import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorComponent } from './paginator.component';
import { Page } from '../../interfaces/page';

interface DummyRecord {
  id: number;
  additionalField: string;
}

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  function generateDummyCollection(numberOfRecords: number, startFrom: number = 1): DummyRecord[] {
    const collection: DummyRecord[] = [];
    let i = startFrom;
    while (i <= numberOfRecords) {
      collection.push({
        id: i,
        additionalField: 'somestring' + i
      });

      i++;
    }

    return collection;
  }

  function setPagination(items: unknown[], itemsPerPage: number, extra: {
    currentPage?: number;
    lastPage?: number;
    maxDisplayedPages?: number;
  } = {}) {
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('itemsPerPage', itemsPerPage);

    if (extra.currentPage !== undefined) {
      fixture.componentRef.setInput('currentPage', extra.currentPage);
    }
    if (extra.lastPage !== undefined) {
      fixture.componentRef.setInput('lastPage', extra.lastPage);
    }
    if (extra.maxDisplayedPages !== undefined) {
      fixture.componentRef.setInput('maxDisplayedPages', extra.maxDisplayedPages);
    }

    fixture.detectChanges();
  }

  function queryPaginator(selector: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector(selector);
  }

  function queryAllPaginator(selector: string): NodeListOf<HTMLElement> {
    return (fixture.nativeElement as HTMLElement).querySelectorAll(selector);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split a finite collection of items into a correct number of pages', () => {
    const recordCount = 238;
    const recordPerPage = 5;

    setPagination(generateDummyCollection(recordCount), recordPerPage);

    expect(component.pages()[component.pages().length - 1].number)
      .toEqual(Math.ceil(recordCount / recordPerPage));
    expect(component._paginatedCollection().length).toEqual(recordPerPage);
  });

  it('should keep every item when the collection does not fill the last page', () => {
    const items = generateDummyCollection(12);

    setPagination(items, 5);

    component.onPageClick(component.pages()[component.pages().length - 1]);
    fixture.detectChanges();

    expect(component._paginatedCollection().length).toEqual(2);
    expect(component._paginatedCollection()).toEqual(items.slice(10));
  });

  it('should emit the paginated collection synchronously when the page changes', () => {
    const items = generateDummyCollection(20);
    const emitted: unknown[][] = [];
    const subscription = component.paginatedCollection.subscribe(collection => emitted.push(collection));

    setPagination(items, 5);
    component.onPageClick(component.pages()[1]);
    fixture.detectChanges();

    expect(emitted.length).toBeGreaterThan(0);
    expect(emitted[emitted.length - 1]).toEqual(items.slice(5, 10));

    subscription.unsubscribe();
  });

  it('should fall back to the default page size when [itemsPerPage] is bound to undefined', () => {
    const items = generateDummyCollection(25);

    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('itemsPerPage', undefined);
    fixture.detectChanges();

    expect(component.pages().length).toEqual(3);
    expect(component._paginatedCollection().length).toEqual(10);
  });

  it('should recalculate its pages correctly when the collection grows', () => {
    const recordCount = 20;
    const recordPerPage = 5;

    setPagination(generateDummyCollection(recordCount), recordPerPage);

    expect(component.pages()[component.pages().length - 1].number).toEqual(4);

    const newItems = (component.items() ?? []).concat(generateDummyCollection(recordCount * 2, 21));
    fixture.componentRef.setInput('items', newItems);
    fixture.detectChanges();

    expect(component.items().length).toEqual(recordCount * 2);
    expect(component.pages()[component.pages().length - 1].number)
      .toEqual(Math.ceil(recordCount / recordPerPage) * 2);
  });

  it('should not emit when navigating past the last page', () => {
    const emitted: { page: number, firstItemIndex: number }[] = [];
    const subscription = component.pageChange.subscribe(pageInfo => emitted.push(pageInfo));

    setPagination(generateDummyCollection(20), 5);
    component.navigateToPage(1);      // moves to page 2
    component.navigateToPage(100);    // out of range → ignored
    fixture.detectChanges();

    expect(emitted.length).toEqual(1);
    expect(emitted[0].page).toEqual(2);

    subscription.unsubscribe();
  });

  it('should disable ("jump to") first and previous buttons and enable next and last buttons on initial render', () => {
    setPagination(generateDummyCollection(100), 5);

    expect((queryPaginator('[data-btn-type="prev"]') as HTMLButtonElement).disabled).toBe(true);
    expect((queryPaginator('[data-btn-type="first"]') as HTMLButtonElement).disabled).toBe(true);
    expect((queryPaginator('[data-btn-type="next"]') as HTMLButtonElement).disabled).toBe(false);
    expect((queryPaginator('[data-btn-type="last"]') as HTMLButtonElement).disabled).toBe(false);
  });

  it('should enable ("jump to") first and previous buttons when a page other than the first is clicked', () => {
    setPagination(generateDummyCollection(100), 5);

    (queryPaginator('.current + li button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect((queryPaginator('[data-btn-type="prev"]') as HTMLButtonElement).disabled).toBe(false);
    expect((queryPaginator('[data-btn-type="first"]') as HTMLButtonElement).disabled).toBe(false);
  });

  it('should disable ("jump to") last and next buttons when the user clicks on the last page', () => {
    setPagination(generateDummyCollection(100), 5);

    const allVisiblePages = queryAllPaginator('[data-btn-type="page-num"]:not(.truncated) button');
    (allVisiblePages[allVisiblePages.length - 1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect((queryPaginator('[data-btn-type="next"]') as HTMLButtonElement).disabled).toBe(true);
    expect((queryPaginator('[data-btn-type="last"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it('should change the paginated collection correctly when the user clicks another page', () => {
    const recordPerPage = 5;
    setPagination(generateDummyCollection(100), recordPerPage);

    const items = component.items();
    expect(component._paginatedCollection()).toEqual(items.slice(0, recordPerPage));

    (queryPaginator('.current + li button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component._paginatedCollection()).toEqual(items.slice(recordPerPage, recordPerPage * 2));
  });

  it('should automatically select the [currentPage] number when it exists', () => {
    const currentPageNumber = 10;

    setPagination(generateDummyCollection(400), 10, { currentPage: currentPageNumber });

    const currentPageEl = queryPaginator('.current button') as HTMLButtonElement | null;
    expect(currentPageEl).toBeTruthy();
    expect(parseInt(currentPageEl?.textContent ?? '', 10)).toEqual(currentPageNumber);
  });

  it('should show a maximum of [lastPage] pages when [lastPage] exists', () => {
    const lastPage = 4;

    setPagination(generateDummyCollection(50), 3, { lastPage });

    const allVisiblePages = queryAllPaginator('[data-btn-type="page-num"]:not(.truncated) button');
    const lastVisiblePage = allVisiblePages[allVisiblePages.length - 1] as HTMLButtonElement;

    expect(parseInt(lastVisiblePage.textContent ?? '', 10)).toEqual(lastPage);
  });

  it('should show a maximum of [maxDisplayedPages] if it exists', () => {
    const maxDisplayedPages = 5;

    setPagination(generateDummyCollection(300), 10, { maxDisplayedPages });

    const allVisiblePages = queryAllPaginator('[data-btn-type="page-num"]:not(.truncated)');
    const allPages = queryAllPaginator('[data-btn-type="page-num"]');

    expect(allVisiblePages.length).toEqual(maxDisplayedPages * 2);
    expect(allPages[maxDisplayedPages + 1].classList.contains('truncated')).toBe(true);
  });

  it('should expose the selected page with the Page shape', () => {
    setPagination(generateDummyCollection(30), 10);

    const page: Page = component.pages()[0];
    expect(page.number).toEqual(1);
    expect(typeof page.isSelected).toEqual('boolean');
    expect(typeof page.isHidden).toEqual('boolean');
  });
});

