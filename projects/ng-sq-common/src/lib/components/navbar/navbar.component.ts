import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavbarItem {
  /** Stable, unique key for this menu item. */
  id: string;
  label: string;
  /** Native link. Omit both link properties for an action handled through `itemSelected`. */
  href?: string;
  /** Angular Router navigation. Takes precedence over href when provided. */
  routerLink?: string | readonly unknown[];
  queryParams?: Record<string, unknown>;
  fragment?: string;
  /** Match child routes too when false. Defaults to true. */
  exact?: boolean;
  target?: '_self' | '_blank';
  /** Optional icon classes supplied by the consumer's icon library. */
  icon?: string;
  active?: boolean;
  disabled?: boolean;
}

let nextNavbarId = 0;

@Component({
  selector: 'sq-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class NavbarComponent {
  readonly items = input<readonly NavbarItem[]>([]);
  readonly brand = input('SQ UI');
  readonly brandHref = input('/');
  readonly ariaLabel = input('Main navigation');
  readonly expanded = model(false);
  readonly itemSelected = output<NavbarItem>();
  readonly mobile = signal(false);
  readonly menuId = `sq-navbar-menu-${nextNavbarId++}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('toggleButton');

  constructor() {
    afterNextRender(() => {
      const viewport = this.document.defaultView?.matchMedia('(max-width: 768px)');
      if (!viewport) return;
      const syncViewport = () => {
        this.mobile.set(viewport.matches);
        // Returning from desktop starts with a collapsed mobile menu.
        this.expanded.set(false);
      };
      this.mobile.set(viewport.matches);
      viewport.addEventListener('change', syncViewport);
      this.destroyRef.onDestroy(() => viewport.removeEventListener('change', syncViewport));
    });
  }

  select(item: NavbarItem): void {
    if (item.disabled) return;
    this.itemSelected.emit(item);
    this.closeMenu();
  }

  closeMenu(): void {
    const restoreFocus = this.mobile() && this.expanded();
    this.expanded.set(false);
    if (restoreFocus) this.toggleButton()?.nativeElement.focus();
  }

  closeFromKeyboard(event?: Event): void {
    if (!event?.defaultPrevented && this.mobile() && this.expanded()) this.closeMenu();
  }

  onDocumentClick(event: Event): void {
    if (this.mobile() && this.expanded() && !event.composedPath().includes(this.host.nativeElement)) {
      // Preserve focus on the outside control the user just clicked.
      this.expanded.set(false);
    }
  }
}
