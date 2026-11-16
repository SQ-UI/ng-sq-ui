import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent, type NavbarItem } from './navbar.component';

@Component({
  standalone: true,
  imports: [NavbarComponent],
  template: `<form (submit)="submitted = true; $event.preventDefault()">
    <sq-navbar [items]="items()" [(expanded)]="expanded" (itemSelected)="selected = $event">
      <a sq-navbar-brand href="#brand">My workspace</a>
      <button sq-navbar-actions type="button">Sign in</button>
      <input sq-navbar-actions aria-label="Nested control" (keydown.escape)="handleEscape($event)">
    </sq-navbar>
  </form><button id="outside" type="button">Outside</button>`,
})
class NavbarHost {
  items = signal<NavbarItem[]>([
    { id: 'home', label: 'Home', href: '#home', active: true },
    { id: 'action', label: 'Settings' },
    { id: 'external', label: 'Help', href: 'https://example.com', target: '_blank' },
    { id: 'disabled', label: 'Unavailable', href: '#unavailable', disabled: true },
  ]);
  expanded = signal(false);
  selected?: NavbarItem;
  submitted = false;
  private consumeEscape = true;

  handleEscape(event: Event): void {
    if (this.consumeEscape) {
      event.preventDefault();
      this.consumeEscape = false;
    }
  }
}

@Component({ template: '<p>Route content</p>' })
class RoutePage {}

@Component({
  imports: [NavbarComponent, RouterOutlet],
  template: `<sq-navbar [items]="items" (itemSelected)="selected = $event"></sq-navbar><router-outlet></router-outlet>`,
})
class RoutedNavbarHost {
  selected?: NavbarItem;
  items: NavbarItem[] = [
    { id: 'workspace', label: 'Workspace', routerLink: '/workspace', exact: false },
    { id: 'settings', label: 'Settings', routerLink: ['/workspace', 'settings'] },
    { id: 'tab', label: 'Components', routerLink: '/workspace', queryParams: { view: 'components' } },
    { id: 'disabled', label: 'Unavailable', routerLink: '/unavailable', disabled: true },
    { id: 'new-tab', label: 'Settings in a new tab', routerLink: '/workspace/settings', target: '_blank' },
  ];
}

describe('NavbarComponent', () => {
  let viewport: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    viewport = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', vi.fn(() => viewport));
  });

  afterEach(() => vi.unstubAllGlobals());

  async function createHost() {
    const fixture = TestBed.createComponent(NavbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renders projected branding/actions and native links, with active and disabled semantics', async () => {
    const fixture = await createHost();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.navbar-brand')?.textContent).toContain('My workspace');
    expect(root.querySelector('.navbar-actions')?.textContent).toContain('Sign in');
    expect(root.querySelector('[href="#home"]')?.getAttribute('aria-current')).toBe('page');
    expect(root.querySelector('[target="_blank"]')?.getAttribute('rel')).toContain('noopener');
    expect(root.querySelector('[href="#unavailable"]')).toBeNull();
    expect(root.querySelector('[aria-disabled="true"]')?.textContent).toContain('Unavailable');
  });

  it('updates the menu when the consumer replaces the item array', async () => {
    const fixture = await createHost();
    fixture.componentInstance.items.set([{ id: 'new', label: 'New item' }]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.navbar-item').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.navbar-item').textContent).toContain('New item');
  });

  it('supports two-way expansion and closes on selection without submitting a form', async () => {
    const fixture = await createHost();
    const root: HTMLElement = fixture.nativeElement;
    const toggle = root.querySelector<HTMLButtonElement>('.navbar-toggle')!;
    const panel = root.querySelector<HTMLElement>('.navbar-panel')!;
    expect(panel.hasAttribute('inert')).toBe(true);
    toggle.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.expanded()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(false);
    root.querySelector<HTMLButtonElement>('button.navbar-item')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.selected?.id).toBe('action');
    expect(fixture.componentInstance.submitted).toBe(false);
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(toggle);
  });

  it('closes on Escape and returns keyboard focus to the toggle', async () => {
    const fixture = await createHost();
    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('button.navbar-item').focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.expanded()).toBe(false);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.navbar-toggle'));
  });

  it('closes when clicking outside without moving focus from the outside control', async () => {
    const fixture = await createHost();
    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();
    const outside: HTMLButtonElement = fixture.nativeElement.querySelector('#outside');
    outside.focus();
    outside.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.expanded()).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it('lets a nested control consume Escape before closing the navigation', async () => {
    const fixture = await createHost();
    fixture.componentInstance.expanded.set(true);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.expanded()).toBe(true);
    expect(document.activeElement).toBe(input);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.expanded()).toBe(false);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.navbar-toggle'));
  });

  it('keeps desktop items accessible after a viewport change and removes the listener on destroy', async () => {
    const fixture = await createHost();
    const syncViewport = viewport.addEventListener.mock.calls[0][1];
    viewport.matches = false;
    syncViewport();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.navbar-panel').hasAttribute('inert')).toBe(false);
    fixture.destroy();
    expect(viewport.removeEventListener).toHaveBeenCalledWith('change', syncViewport);
  });

  it('gives separate instances distinct menu IDs', () => {
    const first = TestBed.createComponent(NavbarComponent);
    const second = TestBed.createComponent(NavbarComponent);
    expect(first.componentInstance.menuId).not.toBe(second.componentInstance.menuId);
  });

  async function createRoutedHost(url: string) {
    TestBed.configureTestingModule({
      providers: [provideRouter([
        { path: 'workspace/settings', component: RoutePage },
        { path: 'workspace', component: RoutePage },
      ])],
    });
    const fixture = TestBed.createComponent(RoutedNavbarHost);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture;
  }

  it('navigates without a reload, closes mobile navigation and marks the matching route active', async () => {
    const fixture = await createRoutedHost('/workspace');
    const root: HTMLElement = fixture.nativeElement;
    const links = root.querySelectorAll<HTMLAnchorElement>('a.navbar-item');
    root.querySelector<HTMLButtonElement>('.navbar-toggle')!.click();
    await fixture.whenStable();
    links[1].click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/workspace/settings');
    expect(links[1].classList.contains('is-active')).toBe(true);
    expect(links[1].getAttribute('aria-current')).toBe('page');
    expect(links[0].classList.contains('is-active')).toBe(true); // Parent route uses subset matching.
    expect(root.querySelector('.navbar-toggle')?.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.selected?.id).toBe('settings');
    expect(root.querySelector('[href="/unavailable"]')).toBeNull();
    expect(root.querySelector('router-outlet + *')?.textContent).toContain('Route content');

    await TestBed.inject(Router).navigateByUrl('/workspace');
    await fixture.whenStable();
    expect(links[1].classList.contains('is-active')).toBe(false);
    expect(links[1].hasAttribute('aria-current')).toBe(false);
  });

  it('matches query parameters when selecting route-based tabs', async () => {
    const fixture = await createRoutedHost('/workspace');
    const tab: HTMLAnchorElement = fixture.nativeElement.querySelectorAll('a.navbar-item')[2];
    expect(tab.classList.contains('is-active')).toBe(false);
    tab.click();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/workspace?view=components');
    expect(tab.getAttribute('aria-current')).toBe('page');
  });

  it('preserves native new-tab navigation for a router link', async () => {
    const fixture = await createRoutedHost('/workspace');
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl');
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.navbar-item[target="_blank"]');
    expect(link).not.toBeNull();
    expect(link.getAttribute('rel')).toContain('noopener');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    expect(link.dispatchEvent(click)).toBe(true);
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(router.url).toBe('/workspace');
  });
});
