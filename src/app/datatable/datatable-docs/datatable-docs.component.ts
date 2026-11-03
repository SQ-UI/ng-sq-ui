import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { PaginatorConfig, PageChangeEvent } from '@sq-ui/ng-sq-common';
import {
  SortItem,
  DatatableColumn,
  DatatableComponent,
  DatatableRowComponent,
  DatatableColumnComponent,
  DatatableHeaderDirective,
  DatatableBodyDirective,
} from '@sq-ui/ng-datatable';
import { NavItem } from '../../shared/nav-item';
import { ModuleOverviewComponent } from '../../shared/module-overview/module-overview.component';
import { CollapseContentComponent } from '../../shared/collapse-content/collapse-content.component';
import { environment } from '../../../environments/environment';

/** Row shape returned by `https://jsonplaceholder.typicode.com/todos`. */
interface ToDoItem {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/** Row shape returned by `https://reqres.in/api/users`. */
interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

/** Row shape returned by `https://reqres.in/api/unknown`. */
interface ReqResResource {
  id: number;
  name: string;
  year: number;
  color: string;
  pantone_value: string;
}

/** Column names come from the data, so a row is read through a record view. */
function readColumn<TRow>(row: TRow, columnName: string): string | number {
  const value = (row as unknown as Record<string, unknown>)[columnName];

  if (typeof value === 'number') {
    return value;
  }

  return value === null || value === undefined ? '' : String(value);
}

/**
 * The demo APIs are public and can fail (reqres.in now asks for an API key): a failed request falls
 * back to `fallback` instead of an unhandled rejection.
 */
async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.warn(`Could not load ${url}; using the bundled sample data.`, error);
    return fallback;
  }
}

/** Shown when reqres.in is unavailable. */
const FALLBACK_USERS: ReqResUser[] = [
  { id: 1, email: 'george.bluth@example.com', first_name: 'George', last_name: 'Bluth', avatar: '' },
  { id: 2, email: 'janet.weaver@example.com', first_name: 'Janet', last_name: 'Weaver', avatar: '' },
  { id: 3, email: 'emma.wong@example.com', first_name: 'Emma', last_name: 'Wong', avatar: '' },
];

const FALLBACK_RESOURCES: ReqResResource[] = [
  { id: 1, name: 'cerulean', year: 2000, color: '#98B2D1', pantone_value: '15-4020' },
  { id: 2, name: 'fuchsia rose', year: 2001, color: '#C74375', pantone_value: '17-2031' },
  { id: 3, name: 'true red', year: 2002, color: '#BF1932', pantone_value: '19-1664' },
];

function compareValues(left: string | number, right: string | number): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right));
}

@Component({
  selector: 'sq-datatable-docs',
  standalone: true,
  imports: [
    DatatableComponent,
    DatatableRowComponent,
    DatatableColumnComponent,
    DatatableHeaderDirective,
    DatatableBodyDirective,
    ModuleOverviewComponent,
    CollapseContentComponent,
  ],
  templateUrl: './datatable-docs.component.html',
  styleUrls: ['./datatable-docs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableDocsComponent {
  npmPackageName: string = '@sq-ui/ng-datatable';
  moduleName: string = 'ng-datatable';

  dependsOn: NavItem[] = [
    {
      name: 'ng-sq-common',
      routeLink: '/sq-common'
    }
  ];

  exports: NavItem[] = [
    {
      name: 'sq-datatable',
      fragment: 'datatable'
    },
    {
      name: 'sq-datatable-header',
      fragment: 'customDatatable'
    },
    {
      name: 'sq-datatable-body',
      fragment: 'customDatatable'
    },
    {
      name: 'sq-datatable-column',
      fragment: 'customDatatable2'
    },
    {
      name: 'sq-datatable-row',
      fragment: 'customDatatable2'
    },
    { name: 'DatatableColumn (interface)' },
    { name: 'SortItem (interface)' }
  ];

  docs: NavItem[] = [
    {
      name: 'ng-datatable',
      routeLink: `${environment.docs}/datatable-module`
    }
  ];

  liveExamples: NavItem[] = [
    {
      name: 'ng-sq-datatable',
      routeLink: `https://ng-sq-datatable.${environment.livePreview}`
    }
  ];

  datatableItems = signal<ToDoItem[]>([]);
  userItems = signal<ReqResUser[]>([]);
  userItemColumns = signal<(keyof ReqResUser)[]>([]);
  resourceItems = signal<ReqResResource[]>([]);
  resourceItemColumns = signal<DatatableColumn[]>([]);

  /**
   * Simulates server-side paging: `lastPage` announces 8 pages (40 todos) while only the first
   * chunk is loaded; the next chunk is fetched when a page beyond the loaded items is requested.
   */
  paginatorConfig: PaginatorConfig = {
    itemsPerPage: 5,
    currentPage: 1,
    maxDisplayedPages: 2,
    lastPage: 8
  };

  sortByColumns = ['id', 'title'];

  /** The resources in the order they were loaded, restored when a sort is cleared. */
  private originalResourceItems: ReqResResource[] = [];
  private readonly toDoChunkSize = 20;
  private isLoadingToDoItems = false;

  constructor() {
    this.fetchToDoItems();
    this.fetchUserItems();
    this.fetchResourcesItems();
  }

  onToDoPageChange($event: PageChangeEvent) {
    const lastNeededIndex = $event.firstItemIndex + (this.paginatorConfig.itemsPerPage ?? 5);

    if (lastNeededIndex > this.datatableItems().length) {
      this.fetchToDoItems();
    }
  }

  fetchToDoItems() {
    if (this.isLoadingToDoItems) {
      return;
    }

    this.isLoadingToDoItems = true;
    const offset = this.datatableItems().length;

    fetchJson<ToDoItem[]>('https://jsonplaceholder.typicode.com/todos', [])
      .then(todos => {
        const next = todos.slice(offset, offset + this.toDoChunkSize);
        this.datatableItems.update(items => [...items, ...next]);
      })
      .finally(() => this.isLoadingToDoItems = false);
  }

  fetchUserItems() {
    fetchJson<{ data?: ReqResUser[] }>('https://reqres.in/api/users', {})
      .then(json => {
        const users = (json.data?.length ? json.data : FALLBACK_USERS).slice(0, 20);
        this.userItemColumns.set(Object.keys(users[0]) as (keyof ReqResUser)[]);
        this.userItems.set(users);
      });
  }

  fetchResourcesItems() {
    fetchJson<{ data?: ReqResResource[] }>('https://reqres.in/api/unknown', {})
      .then(json => {
        const resources = (json.data?.length ? json.data : FALLBACK_RESOURCES).slice(0, 20);
        this.resourceItemColumns.set(
          Object.keys(resources[0]).map((columnName) => ({
            name: columnName,
            canBeSortedAgainst: columnName === 'id'
          }))
        );

        this.originalResourceItems = resources;
        this.resourceItems.set(resources);
      });
  }

  /** `sq-datatable-column` cycles ascending -> descending -> `undefined` (original order). */
  sortResourceItemsByColumn($event: SortItem) {
    const columnName = $event.name;

    if ($event.isSortedByAscending === undefined) {
      this.resourceItems.set(this.originalResourceItems);
      return;
    }

    const direction = $event.isSortedByAscending ? 1 : -1;

    this.resourceItems.set(
      [...this.originalResourceItems].sort((rowItem1, rowItem2) =>
        direction * compareValues(readColumn(rowItem1, columnName), readColumn(rowItem2, columnName))
      )
    );
  }
}
