import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

import { ButtonComponent } from "@sq-ui/ng-form-elements";
import { ModalComponent } from "@sq-ui/ng-modal";

import { CollapseContentComponent, ModuleOverviewComponent, NavItem } from "../../shared";
import { environment } from "../../../environments/environment";

@Component({
  selector: "sq-modal-docs",
  templateUrl: "./modal-docs.component.html",
  styleUrls: ["./modal-docs.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ModuleOverviewComponent, CollapseContentComponent, ModalComponent, ButtonComponent],
})
export class ModalDocsComponent {
  readonly npmPackageName = "@sq-ui/ng-modal";
  readonly moduleName = "ng-modal (standalone)";
  readonly dependsOn: NavItem[] = [
    {
      name: "ng-sq-common",
      routeLink: "/sq-common",
    },
  ];

  readonly exports: NavItem[] = [
    {
      name: "sq-modal",
      fragment: "modal",
    },
  ];

  readonly docs: NavItem[] = [
    {
      name: "ng-modal",
      routeLink: `${environment.docs}/modal-module`,
    },
  ];

  readonly liveExamples: NavItem[] = [
    {
      name: "ng-sq-ui-modal",
      routeLink: `https://ng-sq-ui-modal.${environment.livePreview}`,
    },
  ];

  readonly showModal = signal(false);

  confirmationBtnHandler(): void {
    console.log("Confirmation clicked");
  }

  rejectionBtnHandler(): void {
    console.log("Rejection clicked");
  }
}
