import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  navItems = [
    {
      name: 'SQ-UI',
      routeLink: '/sq-ui'
    },
    {
      name: 'Common',
      routeLink: '/sq-common'
    },
    {
      name: 'Datetime Picker',
      routeLink: '/datetime-picker'
    },
    {
      name: 'Datatable',
      routeLink: '/datatable'
    },
    {
      name: 'Modal',
      routeLink: '/modal'
    }
  ];

  constructor() {

  }

  ngOnInit() { }
}
