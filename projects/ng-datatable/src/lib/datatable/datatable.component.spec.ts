import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DatatableComponent } from './datatable.component';

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

type StubbableInput = 'items' | 'sortByAllColumns' | 'sortByColumns' | 'useCustomSort';

function stubInput<T>(component: DatatableComponent, name: StubbableInput, value: T): void {
  Object.defineProperty(component, name, { value: () => value, configurable: true });
}

describe('DatatableComponent', () => {
  let component: DatatableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new DatatableComponent());
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should get the props of the first object and derive them as columns', () => {
    const itemsCount = 50;
    const items = generateDummyCollection(itemsCount);
    stubInput(component, 'items', items);

    expect(component.columnNames().length).toEqual(Object.keys(items[0]).length);
  });

  it('should return no columns when there are no items', () => {
    stubInput(component, 'items', []);

    expect(component.columnNames()).toEqual([]);
  });

  it('should enable sorting only for the specified column names', () => {
    const itemsCount = 50;
    const sortableColumnName = 'id';
    const items = generateDummyCollection(itemsCount);
    stubInput(component, 'items', items);
    stubInput(component, 'sortByColumns', [sortableColumnName]);

    const sortableColumn = component.columnNames().find((column) => column.name === sortableColumnName);
    const areAllOtherColumnsUnsortable = component
      .columnNames()
      .filter((column) => column.name !== sortableColumnName)
      .every((column) => !column.canBeSortedAgainst);

    expect(sortableColumn?.canBeSortedAgainst).toBe(true);
    expect(areAllOtherColumnsUnsortable).toBe(true);
  });

  it('should enable sorting for all columns when sortByAllColumns is true', () => {
    const items = generateDummyCollection(10);
    stubInput(component, 'items', items);
    stubInput(component, 'sortByAllColumns', true);

    expect(component.columnNames().every((column) => column.canBeSortedAgainst)).toBe(true);
  });

  it('should always emit onSortClicked and run the default sort unless useCustomSort is set', () => {
    component.paginatedCollection = [{ id: 3 }, { id: 1 }, { id: 2 }];
    const spy = vi.fn();
    component.onSortClicked.subscribe(spy);

    component.sortByField({ name: 'id', isSortedByAscending: true });

    expect(spy).toHaveBeenCalledWith({ name: 'id', isSortedByAscending: true });
    expect(component.paginatedCollection).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it('should only emit onSortClicked and skip the default sort when useCustomSort is true', () => {
    stubInput(component, 'useCustomSort', true);
    component.paginatedCollection = [{ id: 3 }, { id: 1 }, { id: 2 }];
    const spy = vi.fn();
    component.onSortClicked.subscribe(spy);

    component.sortByField({ name: 'id', isSortedByAscending: true });

    expect(spy).toHaveBeenCalledWith({ name: 'id', isSortedByAscending: true });
    expect(component.paginatedCollection).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
  });

  it('should emit pageChange when the paginator page changes', () => {
    const spy = vi.fn();
    component.pageChange.subscribe(spy);

    component.onPageChange({ page: 2, firstItemIndex: 10 });

    expect(spy).toHaveBeenCalledWith({ page: 2, firstItemIndex: 10 });
  });
});
