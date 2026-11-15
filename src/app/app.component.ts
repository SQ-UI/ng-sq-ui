import { Component, ViewEncapsulation, ChangeDetectionStrategy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { NavItem } from './shared/nav-item';
import { AppNavComponent } from './app-nav/app-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppNavComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly router = inject(Router);
  readonly embedded = toSignal(this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => event.urlAfterRedirects.startsWith('/embed/')),
  ), { initialValue: this.router.url.startsWith('/embed/') });

  navItems: NavItem[] = [
    { name: 'Overview', routeLink: 'about', icon: 'fa-house' },
    { name: 'All components', routeLink: 'preview', icon: 'fa-grip' },
    {
      name: 'Form controls',
      routeLink: 'sq-ui',
      icon: 'fa-sliders'
    },
    {
      name: 'Utilities',
      routeLink: 'sq-common',
      icon: 'fa-layer-group'
    },
    {
      name: 'Date & time',
      routeLink: 'datetime-picker',
      icon: 'fa-calendar-days'
    },
    {
      name: 'Data tables',
      routeLink: 'datatable',
      icon: 'fa-table'
    },
    {
      name: 'Dialogs',
      routeLink: 'modal',
      icon: 'fa-window-maximize'
    }
  ];
}
