import {Component, OnInit, Input, ViewEncapsulation, ViewChild, ElementRef, Renderer2} from '@angular/core';
import { NavItem } from '../shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'sq-app-nav',
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppNavComponent implements OnInit {
  @Input() navItems: NavItem[] = [];
  @ViewChild('nav') nav: ElementRef;

  isNavOpen = false;
  listenForOutsideClick = false;

  constructor(private renderer: Renderer2, private router: Router) { }

  ngOnInit() {
  }

  showNav() {
    this.isNavOpen = true;
    this.renderer.addClass(this.nav.nativeElement, 'show');
    setTimeout(() => {
      this.listenForOutsideClick = true;
    }, 300);
  }

  onClickOutsideComponent() {
    this.isNavOpen = false;
    this.renderer.removeClass(this.nav.nativeElement, 'show');
    setTimeout(() => {
      this.listenForOutsideClick = false;
    }, 300);
  }

  navigateTo($event, routeLink) {
    $event.preventDefault();
    this.onClickOutsideComponent();
    this.router.navigateByUrl(routeLink);
  }

}
