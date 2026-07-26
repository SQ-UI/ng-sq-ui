import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { DatatableComponent } from './datatable.component';
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component';
import { DatatableRowComponent } from '../datatable-row/datatable-row.component';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { PaginatorComponent } from '../../../../ng-sq-common/src/lib/components/paginator/paginator.component';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        DatatableComponent,
        DatatableColumnComponent,
        DatatableRowComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    datatableComponent = hostFixture.debugElement.children[0].componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(datatableComponent).toBeDefined();
  });

  it('should display items as table rows', (done: DoneFn) => {
    const itemsCount = 30;

    hostComponent.items.set(generateDummyCollection(itemsCount));
    hostComponent.paginatorConfig.set({
      itemsPerPage: 5
    });

    hostFixture.detectChanges();

    hostFixture.whenStable().then(() => {
      hostFixture.detectChanges();

      expect(datatableComponent.items().length === itemsCount)
        .toBe(true);

      done();
    });
  });

  it('should get the props of the first object and render them as columns', () => {
    const itemsCount = 50;
    hostComponent.items.set(generateDummyCollection(itemsCount));

    hostFixture.detectChanges();

    expect(Object.keys(datatableComponent.items()[0]).length === datatableComponent.columnNames().length)
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
});
