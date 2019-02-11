import { Component, OnInit } from '@angular/core';
import { PaginatorConfig } from '@sq-ui/ng-sq-common';
import { SortItem, DatatableColumn } from '@sq-ui/ng-datatable';
import { NavItem } from '../../shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'sq-datatable-docs',
  templateUrl: './datatable-docs.component.html',
  styleUrls: ['./datatable-docs.component.scss']
})
export class DatatableDocsComponent implements OnInit {
  npmPackageName: string = '@sq-ui/ng-datatable';
  moduleName: string = 'NgDatatableModule';

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

  keys = [];
  datatableItems = [];
  userItems = [];
  userItemColumns = [];
  resourceItems = [];
  resourceItemColumns: DatatableColumn[] = [];

  paginatorConfig: PaginatorConfig = {
    itemsPerPage: 5,
    currentPage: 1,
    maxDisplayedPages: 2,
    lastPage: 8
  };

  sortByColumns = ['id', 'title'];

  constructor() { }

  ngOnInit() {
    this.fetchToDoItems();
    this.fetchUserItems();
    this.fetchResourcesItems();
  }

  fetchToDoItems() {
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(response => response.json())
      .then(json => {
        const next = json.slice(0, 20);
        this.datatableItems = [...this.datatableItems, ...next];
      });
  }

  fetchUserItems() {
    fetch('https://reqres.in/api/users')
      .then(response => response.json())
      .then(json => {
        const users = json.data.slice(0, 20);
        this.userItemColumns = Object.keys(users[0]);
        this.userItems = users;
      });
  }

  fetchResourcesItems() {
    fetch('https://reqres.in/api/unknown')
      .then(response => response.json())
      .then(json => {
        const resources = json.data.slice(0, 20);
        this.resourceItemColumns = Object.keys(resources[0])
          .map((columnName) => {
            return {
              name: columnName,
              canBeSortedAgainst: columnName === 'id'
            };
          });

        this.resourceItems = resources;
      });
  }

  sortResourceItemsByColumn($event: SortItem) {
    const columnName = $event.name;
    const ascending = $event.isSortedByAscending;

    this.resourceItems.sort((rowItem1, rowItem2) => {
      if (rowItem1[columnName] > rowItem2[columnName]) {
        return ascending ? 1 : -1;
      }

      if (rowItem1[columnName] < rowItem2[columnName]) {
        return ascending ? -1 : 1;
      }

      // names must be equal
      return 0;
    });
  }

}
