import { Component, ViewEncapsulation, ElementRef, Renderer2, ChangeDetectionStrategy, input, viewChild, signal } from '@angular/core';
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
  readonly navItems = input<NavItem[]>([]);
  readonly nav = viewChild<ElementRef>('nav');

  isNavOpen = signal(false);
  listenForOutsideClick = signal(false);

  constructor(private renderer: Renderer2, private router: Router) { }

  showNav() {
    this.isNavOpen.set(true);
    const navEl = this.nav();
    if (navEl) {
      this.renderer.addClass(navEl.nativeElement, 'show');
    }
    setTimeout(() => {
      this.listenForOutsideClick.set(true);
    }, 300);
  }

  onClickOutsideComponent() {
    this.isNavOpen.set(false);
    const navEl = this.nav();
    if (navEl) {
      this.renderer.removeClass(navEl.nativeElement, 'show');
    }
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
