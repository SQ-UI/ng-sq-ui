import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ModuleOverviewComponent, NavItem } from "../../shared";
import { environment } from "../../../environments/environment";

@Component({
  selector: "sq-common",
  templateUrl: "./sq-common.component.html",
  styleUrls: ["./sq-common.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, ModuleOverviewComponent],
})
export class SqCommonComponent {
  readonly npmPackageName = "@sq-ui/ng-sq-common";
  readonly moduleName = "ng-sq-common (standalone)";

  readonly exports: NavItem[] = [
    {
      name: "sqOutsideClickListener",
      routeLink: "/modal",
    },
    {
      name: "sq-paginator",
      fragment: "/datatable",
    },
    { name: "DeviceOS (enum)" },
    { name: "SqInputCore (base class)" },
    { name: "Size (interface)" },
    { name: "ProgressBarSize (interface)" },
    { name: "CustomEventDetails (interface)" },
    { name: "LabelValuePair (interface)" },
    { name: "RadioGroupRegistry" },
    { name: "OSDetectorService" },
    { name: "PaginatorConfig (interface)" },
    { name: "ScrolledToBottomListenerDirective" },
  ];

  readonly docs: NavItem[] = [
    {
      name: "ng-sq-common",
      routeLink: `${environment.docs}/common-module`,
    },
  ];

  readonly liveExamples: NavItem[] = [
    {
      name: "ng-sq-ui-common",
      routeLink: `https://ng-sq-ui-common.${environment.livePreview}`,
    },
  ];
}
