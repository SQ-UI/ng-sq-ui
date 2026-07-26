import { SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { PaginatorComponent } from './paginator.component';

interface DummyRecord {
  id: number;
  additionalField: string;
}

function generateDummyCollection(numberOfRecords: number, startFrom: number = 1): DummyRecord[] {
  const collection: DummyRecord[] = [];
  let i = startFrom;
  while (i <= numberOfRecords) {
    collection.push({
      id: i,
      additionalField: 'somestring' + i,
    });

    i++;
  }

  return collection;
}

type StubbableInput = 'items' | 'itemsPerPage' | 'currentPage' | 'lastPage' | 'maxDisplayedPages';

/**
 * Stubs a signal `input()` on the component instance with a plain getter.
 *
 * This workspace's plain Vitest setup doesn't run components through the Angular
 * compiler's AOT/JIT metadata transform (that's normally done by ng-packagr/the
 * Angular CLI builder), so neither template/style URL resolution nor
 * `fixture.componentRef.setInput()` are available here. These specs instead build
 * `PaginatorComponent` directly (still within a real Angular injection context) and
 * drive it the same way the framework does: stub the `input()` signals and invoke
 * `ngOnChanges()`/the click handlers directly.
 */
function stubInput<T>(component: PaginatorComponent, name: StubbableInput, value: T): void {
  Object.defineProperty(component, name, { value: () => value, configurable: true });
}

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new PaginatorComponent());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split a finite collection of items into a correct number of pages', () => {
    const recordCount = 238;
    const recordPerPage = 5;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
    });

    expect(component.pages[component.pages.length - 1].number)
      .toEqual(Math.ceil(recordCount / recordPerPage));

    vi.advanceTimersByTime(150);

    expect(component.paginatedCollection().length).toEqual(recordPerPage);
  });

  it('should recalculate its pages correctly when the collection is dynamic', () => {
    const recordCount = 20;
    const recordPerPage = 5;
    const items = generateDummyCollection(recordCount);
    const onPageChange = vi.fn();

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
    });

    component.pageChange.subscribe(onPageChange);
    component.onPageClick(component.pages[component.pages.length - 1]);

    expect(onPageChange).toHaveBeenCalledWith(expect.objectContaining({ page: 4 }));

    const newItems = items.concat(generateDummyCollection(recordCount * 2, 21));
    stubInput(component, 'items', newItems);
    component.ngOnChanges({
      items: new SimpleChange(items, newItems, false),
    });

    expect(component.items().length).toEqual(recordCount * 2);
    expect(component.pages[component.pages.length - 1].number)
      .toEqual(Math.ceil(recordCount / recordPerPage) * 2);
  });

  it('should disable ("jump to") first and previous buttons and enable ("jump to") next and last buttons on initial render', () => {
    const recordCount = 100;
    const recordPerPage = 5;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
    });

    expect(component.disablePrevBtns).toBe(true);
    expect(component.disableNextBtns).toBe(false);
  });

  it('should enable ("jump to") first and previous buttons when a page other than the first is clicked', () => {
    const recordCount = 100;
    const recordPerPage = 5;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
    });

    component.onPageClick(component.pages[1]);

    expect(component.disablePrevBtns).toBe(false);
    expect(component.disableNextBtns).toBe(false);
  });

  it('should disable ("jump to") last and next buttons when the user clicks on the last page', () => {
    const recordCount = 100;
    const recordPerPage = 5;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
    });

    component.onPageClick(component.pages[component.pages.length - 1]);

    expect(component.disablePrevBtns).toBe(false);
    expect(component.disableNextBtns).toBe(true);
  });

  it('should change the paginated collection correctly when the user clicks another page', () => {
    const recordCount = 100;
    const recordPerPage = 5;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
    });
    vi.advanceTimersByTime(150);

    const expectedPaginatedItemsForFirstPage = items.slice(0, recordPerPage);
    const firstPaginatedCollection = component.paginatedCollection().slice();

    component.onPageClick(component.pages[1]);
    vi.advanceTimersByTime(150);

    expect(expectedPaginatedItemsForFirstPage).toEqual(firstPaginatedCollection);
    expect(items.slice(recordPerPage, recordPerPage * 2)).toEqual(component.paginatedCollection());
  });

  it('should automatically select the [currentPage] number when it exists', () => {
    const recordCount = 400;
    const recordPerPage = 10;
    const currentPageNumber = 10;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    stubInput(component, 'currentPage', currentPageNumber);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
      currentPage: new SimpleChange(null, currentPageNumber, true),
    });

    const selectedPage = component.pages.find((page) => page.isSelected);
    expect(selectedPage?.number).toEqual(currentPageNumber);
  });

  it('should show a maximum of [lastPage] pages when [lastPage] exists', () => {
    const recordCount = 50;
    const recordPerPage = 3;
    const lastPage = 4;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    stubInput(component, 'lastPage', lastPage);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
      lastPage: new SimpleChange(null, lastPage, true),
    });

    expect(component.pages.length).toEqual(lastPage);
  });

  it('should show a maximum of [maxDisplayedPages] if it exists', () => {
    const recordCount = 300;
    const recordPerPage = 10;
    const maxDisplayedPages = 5;
    const items = generateDummyCollection(recordCount);

    stubInput(component, 'items', items);
    stubInput(component, 'itemsPerPage', recordPerPage);
    stubInput(component, 'maxDisplayedPages', maxDisplayedPages);
    component.ngOnChanges({
      items: new SimpleChange(null, items, true),
      itemsPerPage: new SimpleChange(null, recordPerPage, true),
      maxDisplayedPages: new SimpleChange(null, maxDisplayedPages, true),
    });

    const visiblePages = component.pages.filter((page) => !page.isHidden);
    const truncatedAfterMax = component.pages[maxDisplayedPages + 1];

    expect(visiblePages.length).toEqual(maxDisplayedPages * 2);
    expect(truncatedAfterMax.isHidden).toBe(true);
  });
});
