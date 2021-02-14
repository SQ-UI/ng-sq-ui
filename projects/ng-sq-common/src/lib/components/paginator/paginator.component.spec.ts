import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

import { PaginatorComponent } from './paginator.component';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PaginatorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should split a finite collection of items into a correct number of pages',
    () => {
      const recordCount = 238;
      const recordPerPage = 5;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true)
      });

      fixture.detectChanges();

      expect(component.pages[component.pages.length - 1].number)
        .toEqual(Math.ceil(recordCount / recordPerPage), 'the page number is calculated correctly');
      expect(component._paginatedCollection.length)
        .toEqual(recordPerPage, 'the number of paginated items is correct');
    });

  it('should recalculate its pages correctly when the collection is dynamic',
    (done: DoneFn) => {
      const recordCount = 20;
      const recordPerPage = 5;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true)
      });

      component.pageChange
        .subscribe((pageInfo: { page: number, firstItemIndex: number }) => {
          if (pageInfo.page % (Math.ceil(recordCount / recordPerPage)) === 0) {
            const newItems = generateDummyCollection(recordCount * 2, 21);
            component.items = component.items.concat(newItems);

            component.ngOnChanges({
              items: new SimpleChange(null, component.items, false)
            });

            fixture.detectChanges();

            expect(component.items.length)
              .toEqual(recordCount * 2, 'the items are changed successfully');
            expect(component.pages[component.pages.length - 1].number)
              .toEqual(Math.ceil(recordCount / recordPerPage) * 2, 'the number of pages has changed');

            done();
          }
        });

      fixture.detectChanges();
      component.onPageClick(component.pages[component.pages.length - 1]);
      fixture.detectChanges();
    });

  it('should disable ("jump to") first and previous buttons and enable ("jump to") next and last buttons on initial render',
    waitForAsync(() => {
      const recordCount = 100;
      const recordPerPage = 5;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true)
      });

      fixture.detectChanges();

      fixture.whenRenderingDone().then(() => {
        const paginatorEl = fixture.nativeElement.querySelector('.paginator');
        const prevBtn = paginatorEl.querySelector('[data-btn-type="prev"]');
        const firstBtn = paginatorEl.querySelector('[data-btn-type="first"]');
        const nextBtn = paginatorEl.querySelector('[data-btn-type="next"]');
        const lastBtn = paginatorEl.querySelector('[data-btn-type="last"]');

        expect(prevBtn.disabled).toBe(true, 'prev button is disabled');
        expect(firstBtn.disabled).toBe(true, 'first button is disabled');
        expect(nextBtn.disabled).toBe(false, 'next button is enabled');
        expect(lastBtn.disabled).toBe(false, 'last button is enabled');
      });
    }));

  it('should enable ("jump to") first and previous buttons when a page other than the first is clicked',
    waitForAsync(() => {
      const recordCount = 100;
      const recordPerPage = 5;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true)
      });

      fixture.detectChanges();

      fixture.whenRenderingDone().then(() => {
        const paginatorEl = fixture.nativeElement.querySelector('.paginator');
        const prevBtn = paginatorEl.querySelector('[data-btn-type="prev"]');
        const firstBtn = paginatorEl.querySelector('[data-btn-type="first"]');

        paginatorEl.querySelector('.current + li button').click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(prevBtn.disabled).toBe(false, 'prev button is enabled');
          expect(firstBtn.disabled).toBe(false, 'first button is enabled');
        });
      });
    }));

  it('should disable ("jump to") last and next buttons when the user clicks on the last page',
    (done: DoneFn) => {
      const recordCount = 100;
      const recordPerPage = 5;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true)
      });

      fixture.detectChanges();

      fixture.whenRenderingDone().then(() => {
        const paginatorEl = fixture.nativeElement.querySelector('.paginator');
        const nextBtn = paginatorEl.querySelector('[data-btn-type="next"]');
        const lastBtn = paginatorEl.querySelector('[data-btn-type="last"]');
        const allVisiblePages = paginatorEl.querySelectorAll('[data-btn-type="page-num"]:not(.truncated) button');

        allVisiblePages[allVisiblePages.length - 1].click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(nextBtn.disabled).toBe(true, 'next button is disabled');
          expect(lastBtn.disabled).toBe(true, 'last button is disabled');
          done();
        });
      });
    });

  it('should change the paginated collection correctly when the user clicks another page',
    waitForAsync(() => {
      const recordCount = 100;
      const recordPerPage = 5;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true)
      });

      fixture.detectChanges();

      const expectedPaginatedItemsForFirstPage = component.items.slice(0, recordPerPage);
      const firstPaginatedCollection = component._paginatedCollection.slice();

      fixture.whenRenderingDone().then(() => {
        const paginatorEl = fixture.nativeElement.querySelector('.paginator');
        paginatorEl.querySelector('.current + li button').click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(expectedPaginatedItemsForFirstPage)
            .toEqual(firstPaginatedCollection, 'first paginated collection is correct');
          expect(component.items.slice(recordPerPage, recordPerPage * 2))
            .toEqual(component._paginatedCollection, 'second paginated collection is correct');
        });
      });
    }));

  it('should automatically select the [currentPage] number when it exists',
    (done: DoneFn) => {
      const recordCount = 400;
      const recordPerPage = 10;
      const currentPageNumber = 10;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;
      component.currentPage = currentPageNumber;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true),
        currentPage: new SimpleChange(null, component.currentPage, true)
      });

      fixture.detectChanges();

      fixture.whenRenderingDone().then(() => {
        const paginatorEl = fixture.nativeElement.querySelector('.paginator');
        const currentPageEl = paginatorEl.querySelector('.current button');
        expect(parseInt(currentPageEl.textContent, 10) === currentPageNumber)
          .toBe(true, 'the current page passed by author is selected');
        done();
      });
    });

  it('should show a maximum of [lastPage] pages when [lastPage] exists',
    (done: DoneFn) => {
      const recordCount = 50;
      const recordPerPage = 3;
      const lastPage = 4;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;
      component.lastPage = lastPage;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true),
        lastPage: new SimpleChange(null, component.lastPage, true)
      });

      fixture.detectChanges();

      fixture.whenRenderingDone().then(() => {
        const paginatorEl = fixture.nativeElement.querySelector('.paginator');
        const allVisiblePages = paginatorEl.querySelectorAll('[data-btn-type="page-num"]:not(.truncated) button');
        const lastVisiblePage = allVisiblePages[allVisiblePages.length - 1];

        expect(parseInt(lastVisiblePage.textContent, 10) === lastPage)
          .toBe(true, 'the last page is set correctly');
        done();
      });
    });

  it('should show a maximum of [maxDisplayedPages] if it exists',
    (done: DoneFn) => {
      const recordCount = 300;
      const recordPerPage = 10;
      const maxDisplayedPages = 5;

      component.items = generateDummyCollection(recordCount);
      component.itemsPerPage = recordPerPage;
      component.maxDisplayedPages = maxDisplayedPages;

      component.ngOnChanges({
        items: new SimpleChange(null, component.items, true),
        itemsPerPage: new SimpleChange(null, component.itemsPerPage, true),
        maxDisplayedPages: new SimpleChange(null, component.maxDisplayedPages, true)
      });

      fixture.detectChanges();

      fixture.whenRenderingDone().then(() => {
        const paginatorEl = fixture.nativeElement.querySelector('.paginator');
        const allVisiblePages = paginatorEl.querySelectorAll('[data-btn-type="page-num"]:not(.truncated)');
        const allPages = paginatorEl.querySelectorAll('[data-btn-type="page-num"]');

        expect(allVisiblePages.length === maxDisplayedPages * 2)
          .toBe(true, 'the number of visible pages is correct');
        expect(allPages[maxDisplayedPages + 1].classList.contains('truncated'))
          .toBe(true, 'the correct element is hidden first');
        done();
      });
    });

});
