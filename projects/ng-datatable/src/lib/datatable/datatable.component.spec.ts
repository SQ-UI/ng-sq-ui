import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DatatableComponent } from './datatable.component';
import { NgSqCommonModule } from '../../../../ng-sq-common/src/lib/ng-sq-common.module';
import { SimpleChange } from '@angular/core';
import { DatatableColumnComponent } from '../datatable-column/datatable-column.component';
import { DatatableRowComponent } from '../datatable-row/datatable-row.component';
import { DatatableHeaderDirective } from '../directives/datatable-header.directive';
import { DatatableBodyDirective } from '../directives/datatable-body.directive';
import { PaginatorComponent } from '../../../../ng-sq-common/src/lib/components/paginator/paginator.component';

describe('DatatableComponent', () => {
  let datatableComponent: DatatableComponent;
  let datatableFixture: ComponentFixture<DatatableComponent>;
  let paginatorComponent: PaginatorComponent;

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DatatableHeaderDirective,
        DatatableBodyDirective,
        DatatableColumnComponent,
        DatatableRowComponent,
        DatatableComponent
      ],
      imports: [
        NgSqCommonModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    datatableFixture = TestBed.createComponent(DatatableComponent);
    datatableComponent = datatableFixture.componentInstance;
    paginatorComponent = datatableFixture.componentInstance.paginatorComponent;
    datatableFixture.detectChanges();
  });

  it('should create', () => {
    expect(datatableComponent).toBeDefined();
  });

  it('#should display items as table rows', (done: DoneFn) => {
    const itemsCount = 30;

    datatableComponent.items = generateDummyCollection(itemsCount);
    datatableComponent.paginatorConfig = {
      itemsPerPage: 5
    };

    datatableComponent.ngOnChanges({
      items: new SimpleChange(null, datatableComponent.items, true),
      paginatorConfig: new SimpleChange(null, datatableComponent.paginatorConfig, true)
    });

    datatableFixture.detectChanges();

    datatableFixture.whenStable().then(() => {
      const datatableRowEls = datatableFixture.nativeElement.querySelectorAll('.datatable tbody > tr');

      expect(datatableComponent.items.length === itemsCount)
        .toBe(true, 'paginator gets items from datatable');

      expect(paginatorComponent._paginatedCollection.length === datatableComponent.paginatorConfig.itemsPerPage)
        .toBe(true, 'paginator has correctly sliced items');

      expect(datatableRowEls.length === paginatorComponent.paginatedCollection.length)
        .toBe(true, 'datatable displays paginated collection');

      done();
    });
  });

  it('#should get the props of the first object and make render them as columns', () => {
    const itemsCount = 50;
    datatableComponent.items = generateDummyCollection(itemsCount);

    datatableComponent.ngOnChanges({
      items: new SimpleChange(null, datatableComponent.items, true)
    });

    datatableFixture.detectChanges();

    expect(Object.keys(datatableComponent.items[0]).length === datatableComponent.columnNames.length)
      .toBe(true, 'the props of the first object are assigned as columns');
  });

  it('#should enable sorting for specified column name', () => {
    const itemsCount = 50;
    const sortableColumnName = 'id';
    datatableComponent.items = generateDummyCollection(itemsCount);
    datatableComponent.sortByColumns = [sortableColumnName];

    datatableComponent.ngOnChanges({
      items: new SimpleChange(null, datatableComponent.items, true),
      sortByColumns: new SimpleChange(null, datatableComponent.sortByColumns, true)
    });

    datatableFixture.detectChanges();

    const sortableColumn = datatableComponent.columnNames.find((column) => {
      return column.name === sortableColumnName;
    });

    const areAllOtherColumnsUnsortable = datatableComponent.columnNames.filter((column) => {
      return column.name !== sortableColumnName;
    })
    .every((column) => {
      return !column.canBeSortedAgainst;
    });

    expect(sortableColumn).toBeDefined();
    expect(sortableColumn.canBeSortedAgainst)
      .toBe(true, 'the column is marked as sortable');
    expect(areAllOtherColumnsUnsortable)
      .toBe(true, 'all other columns are not sortable');
  });
});
