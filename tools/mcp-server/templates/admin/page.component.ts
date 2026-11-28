import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardComponent, ButtonComponent, InputComponent, CheckboxComponent, ProgressBarComponent } from '@sq-ui/ng-sq-ui';
import { WorkspaceStore } from './store';
import { UsersComponent } from './users.component';
import { labels, uiConfig } from './ui-config';

@Component({ selector: 'app-page', standalone: true, imports: [CardComponent, ButtonComponent, InputComponent, CheckboxComponent, ProgressBarComponent, UsersComponent, RouterLink, DatePipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './page.component.html' })
export class PageComponent {
  readonly route = inject(ActivatedRoute);
  readonly store = inject(WorkspaceStore);
  readonly text = labels;
  readonly config = uiConfig;
  readonly activeUsers = computed(() => this.store.users().filter(user => user.active).length);
  readonly date = new Date('2026-11-24T12:00:00Z');
  readonly name = signal(this.store.preferences().name);
  readonly email = signal(this.store.preferences().email);
  readonly notifications = signal(this.store.preferences().notifications);
  readonly submitted = signal(false);
  readonly saved = signal(false);
  readonly valid = computed(() => !!this.name().trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));
  save(event: Event): void {
    event.preventDefault(); this.submitted.set(true); this.saved.set(false);
    if (!this.valid()) return;
    this.store.preferences.set({ name: this.name().trim(), email: this.email().trim(), notifications: this.notifications() }); this.saved.set(true);
  }
}
