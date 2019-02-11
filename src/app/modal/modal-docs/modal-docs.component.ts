import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavItem } from '../../shared/shared.module';
import { environment} from '../../../environments/environment';

@Component({
  selector: 'sq-modal-docs',
  templateUrl: './modal-docs.component.html',
  styleUrls: ['./modal-docs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalDocsComponent implements OnInit {
  npmPackageName: string = '@sq-ui/ng-modal';
  moduleName: string = 'NgModalModule';
  dependsOn: NavItem[] = [
    {
      name: 'NgSqCommonModule',
      routeLink: '/sq-common'
    }
  ];

  exports: NavItem[] = [
    {
      name: 'sq-modal',
      fragment: 'modal'
    }
  ];

  docs: NavItem[] = [
    {
      name: 'ModalModule',
      routeLink: `${environment.docs}/modal-module`
    }
  ];

  liveExamples: NavItem[] = [
    {
      name: 'ng-sq-ui-modal',
      routeLink: `https://ng-sq-ui-modal.${environment.livePreview}`
    }
  ];

  showModal = false;

  constructor() { }

  ngOnInit() {
  }

  confirmationBtnHandler() {
    console.log('Confirmation clicked');
  }

  rejectionBtnHandler() {
    console.log('Rejection clicked');
  }

}
