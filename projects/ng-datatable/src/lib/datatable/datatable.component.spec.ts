import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { DatatableComponent } from './datatable.component';
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component';
import { DatatableRowComponent } from '../datatable-row/datatable-row.component';

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
      additionalField: 'somestring' + i
    });

    i++;
  }

  return collection;
}

@Component({
  standalone: true,
  imports: [DatatableComponent],
  template: `
    <sq-datatable
      [items]="items()"
      [paginatorConfig]="paginatorConfig()"
      [sortByColumns]="sortByColumns()"
      [sortByAllColumns]="sortByAllColumns()">
    </sq-datatable>
  `
})
class TestHostComponent {
  items = signal<any[]>([]);
  paginatorConfig = signal<any>({});
  sortByColumns = signal<string[]>([]);
  sortByAllColumns = signal<boolean>(false);
}

describe('DatatableComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let datatableComponent: DatatableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        DatatableComponent,
        DatatableColumnComponent,
        DatatableRowComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    datatableComponent = hostFixture.debugElement.children[0].componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(datatableComponent).toBeDefined();
  });

  it('should display items as table rows', async () => {
    const itemsCount = 30;

    hostComponent.items.set(generateDummyCollection(itemsCount));
    hostComponent.paginatorConfig.set({
      itemsPerPage: 5
    });

    hostFixture.detectChanges();

    await hostFixture.whenStable();
    hostFixture.detectChanges();

    expect(datatableComponent.items().length === itemsCount)
      .toBe(true);
  });

  it('should get the props of the first object and render them as columns', () => {
    const itemsCount = 50;
    hostComponent.items.set(generateDummyCollection(itemsCount));

    hostFixture.detectChanges();

    expect(Object.keys(datatableComponent.items()[0] as object).length === datatableComponent.columnNames().length)
      .toBe(true);
  });

  it('should enable sorting for specified column name', () => {
    const itemsCount = 50;
    const sortableColumnName = 'id';
    hostComponent.items.set(generateDummyCollection(itemsCount));
    hostComponent.sortByColumns.set([sortableColumnName]);

    hostFixture.detectChanges();

    const sortableColumn = datatableComponent.columnNames().find((column) => {
      return column.name === sortableColumnName;
    });

    const areAllOtherColumnsUnsortable = datatableComponent.columnNames().filter((column) => {
      return column.name !== sortableColumnName;
    })
      .every((column) => {
        return !column.canBeSortedAgainst;
      });

    expect(sortableColumn).toBeDefined();
    expect(sortableColumn!.canBeSortedAgainst)
      .toBe(true);
    expect(areAllOtherColumnsUnsortable)
      .toBe(true);
  });

  describe('sorting', () => {
    const renderedIds = (): number[] =>
      datatableComponent.paginatedCollection().map(item => (item as DummyRecord).id);

    beforeEach(async () => {
      hostComponent.items.set(generateDummyCollection(10));
      hostComponent.paginatorConfig.set({ itemsPerPage: 5 });
      hostComponent.sortByColumns.set(['id']);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
    });

    it('should sort the whole collection, not only the visible page', async () => {
      datatableComponent.sortByField({ name: 'id', isSortedByAscending: false });
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(renderedIds()).toEqual([10, 9, 8, 7, 6]);
    });

    it('should keep the sort when the page changes', async () => {
      datatableComponent.sortByField({ name: 'id', isSortedByAscending: false });
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const pageButtons: HTMLButtonElement[] = Array.from(
        hostFixture.nativeElement.querySelectorAll('[data-btn-type="page-num"] button')
      );
      pageButtons[1].click();
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(renderedIds()).toEqual([5, 4, 3, 2, 1]);
    });

    it('should restore the original order when the sort direction is cleared', async () => {
      datatableComponent.sortByField({ name: 'id', isSortedByAscending: false });
      hostFixture.detectChanges();
      datatableComponent.sortByField({ name: 'id', isSortedByAscending: undefined });
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(renderedIds()).toEqual([1, 2, 3, 4, 5]);
      expect(datatableComponent.activeSortColumn()).toBeNull();
    });
  });
});
