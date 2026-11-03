import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavItem } from '../../shared/nav-item';
import { ModuleOverviewComponent } from '../../shared/module-overview/module-overview.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sq-common',
  standalone: true,
  imports: [RouterLink, ModuleOverviewComponent],
  templateUrl: './sq-common.component.html',
  styleUrls: ['./sq-common.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SqCommonComponent {
  npmPackageName: string = '@sq-ui/ng-sq-common';
  moduleName: string = 'ng-sq-common';

  exports: NavItem[] = [
    {
      name: 'sqOutsideClickListener',
      routeLink: '/modal'
    },
    {
      name: 'sq-paginator',
      routeLink: '/datatable'
    },
    { name: 'sqScrolledToBottomListener' },
    { name: 'FormFieldConfig (interface)' },
    { name: 'SqFormFieldSignals (interface)' },
    { name: 'FORM_FIELD_DEFAULTS (constant)' },
    { name: 'generateFormFieldId (function)' },
    { name: 'toPatternAttribute (function)' },
    { name: 'SqFormValueControl / SqFormCheckboxControl / SqFormUiControl (types)' },
    { name: 'DeviceOS (enum)' },
    { name: 'Size (type)' },
    { name: 'ProgressBarSize (interface)' },
    { name: 'CustomEventDetails (interface)' },
    { name: 'LabelValuePair (interface)' },
    { name: 'CustomEventBroadcasterService' },
    { name: 'OSDetectorService' },
    { name: 'PaginatorConfig (interface)' },
    { name: 'PageChangeEvent (interface)' },
    { name: 'InputCoreComponent (deprecated class)' },
    { name: 'ControlValueAccessorEnabler (deprecated class)' }
  ];

  docs: NavItem[] = [
    {
      name: 'ng-sq-common',
      routeLink: `${environment.docs}/common-module`
    }
  ];

  liveExamples: NavItem[] = [
    {
      name: 'ng-sq-ui-common',
      routeLink: `https://ng-sq-ui-common.${environment.livePreview}`
    }
  ];
}
