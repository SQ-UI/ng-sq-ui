import { TestBed } from '@angular/core/testing';

import { DatatableRowComponent } from './datatable-row.component';

describe('DatatableRowComponent', () => {
  let component: DatatableRowComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new DatatableRowComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive its columns from the row item keys when no width is set', () => {
    const rowItem = { id: 1, name: 'foo' };
    Object.defineProperty(component, 'rowItem', { value: () => rowItem, configurable: true });

    expect(component.columns()).toEqual(['id', 'name']);
  });

  it('should not derive columns when a width is provided', () => {
    const rowItem = { id: 1, name: 'foo' };
    Object.defineProperty(component, 'rowItem', { value: () => rowItem, configurable: true });
    Object.defineProperty(component, 'width', { value: () => '100px', configurable: true });

    expect(component.columns()).toEqual([]);
  });
});
