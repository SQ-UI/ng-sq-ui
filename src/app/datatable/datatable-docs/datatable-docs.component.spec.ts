import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DatatableDocsComponent } from './datatable-docs.component';
import { SortItem } from '@sq-ui/ng-datatable';

describe('DatatableDocsComponent', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        const body = url.includes('todos')
          ? []
          : { data: [{ id: 1, name: 'placeholder' }] };

        return Promise.resolve({ json: () => Promise.resolve(body) } as Response);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new DatatableDocsComponent());

    expect(component).toBeTruthy();
  });

  it('should sort the resource items by the given column', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new DatatableDocsComponent());

    component['resourceItems'].set([{ id: 2 }, { id: 1 }, { id: 3 }]);

    const sortItem: SortItem = { name: 'id', isSortedByAscending: true };
    component.sortResourceItemsByColumn(sortItem);

    expect(component['resourceItems']()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });
});
