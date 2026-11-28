import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, CardComponent, InputComponent, DatatableComponent, DatatableHeaderDirective, DatatableBodyDirective, ModalComponent, PaginatorComponent, ProgressBarComponent } from '@sq-ui/ng-sq-ui';
import { WorkspaceStore, type User } from './store';
import { labels, uiConfig } from './ui-config';

@Component({ selector: 'app-users', standalone: true, imports: [RouterLink, ButtonComponent, CardComponent, InputComponent, DatatableComponent, DatatableHeaderDirective, DatatableBodyDirective, ModalComponent, PaginatorComponent, ProgressBarComponent], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './users.component.html' })
export class UsersComponent {
  readonly store = inject(WorkspaceStore);
  readonly text = labels;
  readonly usersPath = uiConfig.basePath + '/' + (uiConfig.pages.find(page => page.recipe === 'crud-list')?.id ?? 'users');
  readonly features = input<readonly string[]>(['search', 'filter', 'sort', 'paginate', 'edit', 'delete']);
  readonly query = signal('');
  readonly filter = signal('all');
  readonly sort = signal('name-asc');
  readonly currentPage = signal(1);
  readonly dialog = signal(false);
  readonly target = signal<User | null>(null);
  readonly filtered = computed(() => {
    const query = this.query().toLocaleLowerCase(uiConfig.locale).trim();
    const users = this.store.users().filter(user => (!this.features().includes('search') || `${user.name} ${user.email}`.toLocaleLowerCase(uiConfig.locale).includes(query)) && (!this.features().includes('filter') || this.filter() === 'all' || user.active === (this.filter() === 'active')));
    return this.features().includes('sort') ? [...users].sort((left, right) => left.name.localeCompare(right.name, uiConfig.locale) * (this.sort() === 'name-desc' ? -1 : 1)) : users;
  });
  readonly pageSize = computed(() => this.features().includes('paginate') ? 5 : Math.max(1, this.filtered().length));
  readonly safePage = computed(() => Math.min(this.currentPage(), Math.max(1, Math.ceil(this.filtered().length / this.pageSize()))));
  readonly rows = computed(() => this.filtered().slice((this.safePage() - 1) * this.pageSize(), this.safePage() * this.pageSize()));
  resetPage(): void { this.currentPage.set(1); }
  requestDelete(user: User): void { this.target.set(user); this.dialog.set(true); }
  confirmDelete(): void { const user = this.target(); if (user) { this.store.remove(user.id); this.store.notice.set(this.text.deleted); } this.dialog.set(false); }
}
