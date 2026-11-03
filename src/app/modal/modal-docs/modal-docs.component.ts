import { Component, ViewEncapsulation, ChangeDetectionStrategy, signal } from '@angular/core';
import { NavItem } from '../../shared/nav-item';
import { ModalComponent } from '@sq-ui/ng-modal';
import { ButtonComponent } from '@sq-ui/ng-form-elements';
import { ModuleOverviewComponent } from '../../shared/module-overview/module-overview.component';
import { CollapseContentComponent } from '../../shared/collapse-content/collapse-content.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sq-modal-docs',
  standalone: true,
  imports: [
    ModalComponent,
    ButtonComponent,
    ModuleOverviewComponent,
    CollapseContentComponent,
  ],
  templateUrl: './modal-docs.component.html',
  styleUrls: ['./modal-docs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalDocsComponent {
  npmPackageName: string = '@sq-ui/ng-modal';
  moduleName: string = 'ng-modal';
  dependsOn: NavItem[] = [
    {
      name: 'ng-sq-common',
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
      name: 'ng-modal',
      routeLink: `${environment.docs}/modal-module`
    }
  ];

  liveExamples: NavItem[] = [
    {
      name: 'ng-sq-ui-modal',
      routeLink: `https://ng-sq-ui-modal.${environment.livePreview}`
    }
  ];

  showModal = signal(false);

  confirmationBtnHandler() {
    console.log('Confirmation clicked');
  }

  rejectionBtnHandler() {
    console.log('Rejection clicked');
  }
}
