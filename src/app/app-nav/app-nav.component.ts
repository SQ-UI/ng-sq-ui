import { Component, ViewEncapsulation, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';
import { NavItem } from '../shared/nav-item';

@Component({
  selector: 'sq-app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, OutsideClickListenerDirective],
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNavComponent {
  private readonly router = inject(Router);

  readonly navItems = input<NavItem[]>([]);

  isNavOpen = signal(false);
  listenForOutsideClick = signal(false);

  showNav() {
    this.isNavOpen.set(true);
    setTimeout(() => {
      this.listenForOutsideClick.set(true);
    }, 300);
  }

  onClickOutsideComponent() {
    this.isNavOpen.set(false);
    setTimeout(() => {
      this.listenForOutsideClick.set(false);
    }, 300);
  }

  navigateTo($event: Event, routeLink: string) {
    $event.preventDefault();
    if (this.isNavOpen()) {
      this.onClickOutsideComponent();
    }
    this.router.navigateByUrl('/' + routeLink);
  }
}
