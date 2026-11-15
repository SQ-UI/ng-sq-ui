import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NavbarComponent, type NavbarItem } from '@sq-ui/ng-sq-common';
import { ButtonComponent } from '@sq-ui/ng-form-elements';

@Component({
  selector: 'sq-navbar-preview',
  standalone: true,
  imports: [NavbarComponent, ButtonComponent],
  template: `
    <p>Choose a menu item, or change the menu from the controls below. On a narrow screen, open the animated mobile menu.</p>
    <sq-navbar [items]="items()" (itemSelected)="select($event)">
      <a sq-navbar-brand class="example-brand" href="https://sq-ui.dev" target="_blank" rel="noopener">
        <img src="assets/logo.svg" width="42" height="27" alt=""> <span>SQ UI</span>
      </a>
      <span sq-navbar-actions><sq-button size="s" (click)="status.set('Sign in selected')">Sign in</sq-button></span>
    </sq-navbar>
    <div class="example-controls">
      <sq-button size="s" appearance="secondary" (click)="switchMenu()">Change menu items</sq-button>
      <p role="status">{{status()}}</p>
    </div>
    <h3>Angular Router: automatic active links</h3>
    <p>These links change the URL and the content below. Use your browser's Back and Forward buttons to see the active item stay in sync.</p>
    <sq-navbar brand="Router demo" brandHref="#/preview" ariaLabel="Router example" [items]="routedItems"></sq-navbar>
    <section class="route-content" aria-live="polite" aria-label="Routed example content">
      @switch (view()) {
        @case ('components') { <h4>Components</h4><p>Explore the reusable Angular components.</p> }
        @case ('settings') { <h4>Settings</h4><p>Manage your workspace preferences.</p> }
        @default { <h4>Overview</h4><p>Welcome to the workspace overview.</p> }
      }
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    p { font-size: 14px; line-height: 1.7; margin: 0 0 20px; }
    .example-brand { display: inline-flex; align-items: center; gap: 8px; color: inherit; text-decoration: none; font-size: 20px; font-weight: 700; }
    .example-brand img { display: block; }
    .example-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 24px; }
    .example-controls p { margin: 0; }
    h3 { margin: 40px 0 12px; font-size: 18px; }
    .route-content { margin-top: 16px; padding: 20px; border: 1px solid var(--sq-color-border, #dcdcdc); border-radius: 8px; background: var(--sq-color-surface-subtle, #fafafa); }
    .route-content h4 { margin: 0 0 8px; }
    .route-content p { margin: 0; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarPreviewComponent {
  readonly view = toSignal(inject(ActivatedRoute).queryParamMap.pipe(
    map(params => params.get('view') || 'overview'),
  ));
  readonly routedItems: NavbarItem[] = [
    { id: 'overview', label: 'Overview', routerLink: ['./'] },
    { id: 'components', label: 'Components', routerLink: ['./'], queryParams: { view: 'components' } },
    { id: 'settings', label: 'Settings', routerLink: ['./'], queryParams: { view: 'settings' } },
  ];
  private alternate = false;
  readonly status = signal('Overview selected');
  readonly items = signal<NavbarItem[]>(this.defaultItems());

  select(item: NavbarItem): void {
    if (item.href) return;
    this.items.update(items => items.map(entry => ({ ...entry, active: entry.id === item.id })));
    this.status.set(`${item.label} selected`);
  }

  switchMenu(): void {
    this.alternate = !this.alternate;
    this.items.set(this.alternate ? [
      { id: 'dashboard', label: 'Dashboard', active: true },
      { id: 'settings', label: 'Settings' },
    ] : this.defaultItems());
    this.status.set('Menu items updated');
  }

  private defaultItems(): NavbarItem[] {
    return [
      { id: 'overview', label: 'Overview', active: true },
      { id: 'components', label: 'Components' },
      { id: 'github', label: 'GitHub', href: 'https://github.com/SQ-UI/ng-sq-ui', target: '_blank' },
      { id: 'disabled', label: 'Coming soon', disabled: true },
    ];
  }
}
