import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  navItems: NavItem[] = [
    {
      name: 'SQ-UI',
      routeLink: 'sq-ui'
    },
    {
      name: 'Common',
      routeLink: 'sq-common'
    },
    {
      name: 'Datetime Picker',
      routeLink: 'datetime-picker'
    },
    {
      name: 'Datatable',
      routeLink: 'datatable'
    },
    {
      name: 'Modal',
      routeLink: 'modal'
    }
  ];
}
