import { Component, ViewEncapsulation, ChangeDetectionStrategy, input, signal, inject, viewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';
import { NavItem } from '../shared/nav-item';

@Component({
  selector: 'sq-app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, OutsideClickListenerDirective],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeFromKeyboard()' },
})
export class AppNavComponent {
  private readonly document = inject(DOCUMENT);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  readonly navItems = input<NavItem[]>([]);
  readonly isNavOpen = signal(false);
  readonly listenForOutsideClick = signal(false);

  showNav(event: Event) {
    event.stopPropagation();
    this.isNavOpen.set(true);
    this.listenForOutsideClick.set(true);
  }

  onClickOutsideComponent() {
    this.isNavOpen.set(false);
    this.listenForOutsideClick.set(false);
  }

  closeFromKeyboard() {
    if (this.isNavOpen()) {
      this.onClickOutsideComponent();
      this.menuButton()?.nativeElement.focus();
    }
  }

  focusMain() {
    this.onClickOutsideComponent();
    this.document.getElementById('demo-main')?.focus();
  }
}
