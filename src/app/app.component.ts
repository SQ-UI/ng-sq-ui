import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  navItems = [
    {
      name: 'SQ-UI',
      routeLink: '/sq-ui-module'
    },
    {
      name: 'Common',
      routeLink: '/sq-common-module'
    },
    {
      name: 'Datetime Picker',
      routeLink: '/datetime-picker-module'
    },
    {
      name: 'Datatable',
      routeLink: '/datatable-module'
    },
    {
      name: 'Modal',
      routeLink: '/modal-module'
    }
  ];

  constructor() {

  }

  ngOnInit() { }
}
