import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
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
  @Input() internallyDeclared: NavItem[];
  @Input() dependsOn: NavItem[];
  @Input() exports: NavItem[];
  @Input() docs: NavItem;
  @Input() liveExample: NavItem;

  constructor() { }

  ngOnInit() {
  }

  scrollTo(fragment: string) {
    document.getElementById(fragment).scrollIntoView();
  }

}
