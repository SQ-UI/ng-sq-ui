import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

import { PaginatorConfig } from "@sq-ui/ng-sq-common";
import {
  DatatableColumn,
  DatatableBodyDirective,
  DatatableColumnComponent,
  DatatableComponent,
  DatatableHeaderDirective,
  DatatableRowComponent,
  SortItem,
} from "@sq-ui/ng-datatable";

import { ModuleOverviewComponent, CollapseContentComponent, NavItem } from "../../shared";
import { environment } from "../../../environments/environment";

@Component({
  selector: "sq-datatable-docs",
  templateUrl: "./datatable-docs.component.html",
  styleUrls: ["./datatable-docs.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ModuleOverviewComponent,
    CollapseContentComponent,
    DatatableComponent,
    DatatableColumnComponent,
    DatatableRowComponent,
    DatatableHeaderDirective,
    DatatableBodyDirective,
  ],
})
export class DatatableDocsComponent {
  readonly npmPackageName = "@sq-ui/ng-datatable";
  readonly moduleName = "ng-datatable (standalone)";

  readonly dependsOn: NavItem[] = [
    {
      name: "ng-sq-common",
      routeLink: "/sq-common",
    },
  ];

  readonly exports: NavItem[] = [
    {
      name: "sq-datatable",
      fragment: "datatable",
    },
    {
      name: "sq-datatable-header",
      fragment: "customDatatable",
    },
    {
      name: "sq-datatable-body",
      fragment: "customDatatable",
    },
    {
      name: "sq-datatable-column",
      fragment: "customDatatable2",
    },
    {
      name: "sq-datatable-row",
      fragment: "customDatatable2",
    },
    { name: "DatatableColumn (interface)" },
    { name: "SortItem (interface)" },
  ];

  readonly docs: NavItem[] = [
    {
      name: "ng-datatable",
      routeLink: `${environment.docs}/datatable-module`,
    },
  ];

  readonly liveExamples: NavItem[] = [
    {
      name: "ng-sq-datatable",
      routeLink: `https://ng-sq-datatable.${environment.livePreview}`,
    },
  ];

  protected readonly datatableItems = signal<any[]>([]);
  protected readonly userItems = signal<any[]>([]);
  protected readonly userItemColumns = signal<string[]>([]);
  protected readonly resourceItems = signal<any[]>([]);
  protected readonly resourceItemColumns = signal<DatatableColumn[]>([]);

  readonly paginatorConfig: PaginatorConfig = {
    itemsPerPage: 5,
    currentPage: 1,
    maxDisplayedPages: 2,
    lastPage: 8,
  };

  readonly sortByColumns = ["id", "title"];

  constructor() {
    this.fetchToDoItems();
    this.fetchUserItems();
    this.fetchResourcesItems();
  }

  fetchToDoItems(): void {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((response) => response.json())
      .then((json: any[]) => {
        const next = json.slice(0, 20);
        this.datatableItems.update((items) => [...items, ...next]);
      });
  }

  fetchUserItems(): void {
    fetch("https://reqres.in/api/users")
      .then((response) => response.json())
      .then((json) => {
        const users = json.data.slice(0, 20);
        this.userItemColumns.set(Object.keys(users[0]));
        this.userItems.set(users);
      });
  }

  fetchResourcesItems(): void {
    fetch("https://reqres.in/api/unknown")
      .then((response) => response.json())
      .then((json) => {
        const resources = json.data.slice(0, 20);
        this.resourceItemColumns.set(
          Object.keys(resources[0]).map((columnName) => ({
            name: columnName,
            canBeSortedAgainst: columnName === "id",
          })),
        );

        this.resourceItems.set(resources);
      });
  }

  sortResourceItemsByColumn($event: SortItem): void {
    const columnName = $event.name;
    const ascending = $event.isSortedByAscending;

    this.resourceItems.update((items) =>
      [...items].sort((rowItem1, rowItem2) => {
        if (rowItem1[columnName] > rowItem2[columnName]) {
          return ascending ? 1 : -1;
        }

        if (rowItem1[columnName] < rowItem2[columnName]) {
          return ascending ? -1 : 1;
        }

        return 0;
      }),
    );
  }
}
