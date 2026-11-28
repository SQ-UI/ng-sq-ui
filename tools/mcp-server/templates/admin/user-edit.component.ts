import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, required, email } from '@angular/forms/signals';
import { CardComponent, ButtonComponent, InputComponent, CheckboxComponent } from '@sq-ui/ng-sq-ui';
import { WorkspaceStore } from './store';
import { labels, uiConfig } from './ui-config';

@Component({ selector: 'app-user-edit', standalone: true, imports: [FormField, RouterLink, CardComponent, ButtonComponent, InputComponent, CheckboxComponent], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './user-edit.component.html' })
export class UserEditComponent {
  readonly store = inject(WorkspaceStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly text = labels;
  readonly usersPath = uiConfig.basePath + '/' + (uiConfig.pages.find(page => page.recipe === 'crud-list')?.id ?? 'users');
  private readonly id = this.route.snapshot.paramMap.get('id');
  private readonly existing = this.store.users().find(user => user.id === Number(this.id));
  readonly found = this.id === 'new' || !!this.existing;
  readonly model = signal(this.existing ? { ...this.existing } : { id: 0, name: '', email: '', role: 'Member', active: true });
  readonly fields = form(this.model, path => { required(path.name); required(path.email); email(path.email); });
  readonly submitted = signal(false);
  readonly valid = computed(() => !this.fields.name().invalid() && !this.fields.email().invalid() && !!this.model().name.trim());
  save(event: Event): void {
    event.preventDefault(); this.submitted.set(true);
    if (!this.valid()) return;
    this.store.save({ ...this.model(), name: this.model().name.trim(), email: this.model().email.trim() });
    this.store.notice.set(this.text.saved); void this.router.navigateByUrl(this.usersPath);
  }
}
