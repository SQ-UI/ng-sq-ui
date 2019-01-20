import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NavItem } from '../nav-item';

@Component({
  selector: 'sq-module-overview',
  templateUrl: './module-overview.component.html',
  styleUrls: ['./module-overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModuleOverviewComponent implements OnInit {
  @Input() npmPackageName: string;
  @Input() moduleName: string;
  @Input() exportedModules: NavItem[];
  @Input() dependsOn: NavItem[];

  constructor() { }

  ngOnInit() {
  }

}
