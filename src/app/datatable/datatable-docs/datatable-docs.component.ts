import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { PaginatorConfig } from '@sq-ui/ng-sq-common';
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
  moduleName: string = 'NgDatatable';

  dependsOn: NavItem[] = [
    {
      name: 'NgSqCommonModule',
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
      name: 'DatatableModule',
      routeLink: `${environment.docs}/datatable-module`
    }
  ];

  liveExamples: NavItem[] = [
    {
      name: 'ng-sq-datatable',
      routeLink: `https://ng-sq-datatable.${environment.livePreview}`
    }
  ];

  keys: string[] = [];
  datatableItems = signal<ToDoItem[]>([]);
  userItems = signal<ReqResUser[]>([]);
  userItemColumns = signal<string[]>([]);
  resourceItems = signal<ReqResResource[]>([]);
  resourceItemColumns = signal<DatatableColumn[]>([]);

  paginatorConfig: PaginatorConfig = {
    itemsPerPage: 5,
    currentPage: 1,
    maxDisplayedPages: 2,
    lastPage: 8
  };

  sortByColumns = ['id', 'title'];

  constructor() {
    this.fetchToDoItems();
    this.fetchUserItems();
    this.fetchResourcesItems();
  }

  fetchToDoItems() {
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(response => response.json())
      .then(json => {
        const next = json.slice(0, 20);
        this.datatableItems.update(items => [...items, ...next]);
      });
  }

  fetchUserItems() {
    fetch('https://reqres.in/api/users')
      .then(response => response.json())
      .then(json => {
        const users = json.data.slice(0, 20);
        this.userItemColumns.set(Object.keys(users[0]));
        this.userItems.set(users);
      });
  }

  fetchResourcesItems() {
    fetch('https://reqres.in/api/unknown')
      .then(response => response.json())
      .then(json => {
        const resources = json.data.slice(0, 20);
        this.resourceItemColumns.set(
          Object.keys(resources[0]).map((columnName) => ({
            name: columnName,
            canBeSortedAgainst: columnName === 'id'
          }))
        );

        this.resourceItems.set(resources);
      });
  }

  sortResourceItemsByColumn($event: SortItem) {
    const columnName = $event.name;
    const direction = $event.isSortedByAscending === false ? -1 : 1;

    this.resourceItems.update(items =>
      [...items].sort((rowItem1, rowItem2) =>
        direction * compareValues(readColumn(rowItem1, columnName), readColumn(rowItem2, columnName))
      )
    );
  }
}
