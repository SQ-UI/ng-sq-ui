import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DatatableColumnComponent } from './datatable-column.component';

describe('DatatableColumnComponent', () => {
  let component: DatatableColumnComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new DatatableColumnComponent());
    Object.defineProperty(component, 'name', { value: () => 'columnName', configurable: true });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit information that the parent should sort by column name', () => {
    const spy = vi.fn();
    component.onSortClicked.subscribe(spy);

    component.sort();

    expect(component.isSortedByAscending).toBe(true);
    expect(spy).toHaveBeenCalledWith({ name: 'columnName', isSortedByAscending: true });

    component.sort();

    expect(component.isSortedByAscending).toBe(false);
    expect(spy).toHaveBeenCalledWith({ name: 'columnName', isSortedByAscending: false });

    component.sort();

    expect(component.isSortedByAscending).toBeUndefined();
    expect(spy).toHaveBeenCalledWith({ name: 'columnName', isSortedByAscending: undefined });
  });
});
