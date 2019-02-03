import { Component, OnInit } from '@angular/core';
import {NavItem} from '../../shared/shared.module';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sq-common',
  templateUrl: './sq-common.component.html',
  styleUrls: ['./sq-common.component.scss']
})
export class SqCommonComponent implements OnInit {
  npmPackageName: string = '@sq-ui/ng-sq-common';
  moduleName: string = 'NgSqCommonModule';

  exports: NavItem[] = [
    {
      name: 'sqOutsideClickListener',
      routeLink: '/modal'
    },
    {
      name: 'sq-paginator',
      fragment: '/datatable'
    },
    { name: 'DeviceOS (enum)' },
    { name: 'InputCoreComponent (class)' },
    { name: 'Size (interface)' },
    { name: 'ProgressBarSize (interface)' },
    { name: 'CustomEventDetails (interface)' },
    { name: 'LabelValuePair (interface)' },
    { name: 'CustomEventBroadcasterService' },
    { name: 'OSDetectorService' },
    { name: 'PaginatorConfig (interface)' }
  ];

  docs: NavItem[] = [];

  constructor() { }

  ngOnInit() {

  }

}
