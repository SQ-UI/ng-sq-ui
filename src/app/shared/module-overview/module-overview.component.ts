import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { NavItem } from "../nav-item";

@Component({
  selector: "sq-module-overview",
  templateUrl: "./module-overview.component.html",
  styleUrls: ["./module-overview.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink],
})
export class ModuleOverviewComponent {
  readonly npmPackageName = input<string>("");
  readonly moduleName = input<string>("");
  readonly internallyDeclared = input<NavItem[]>([]);
  readonly dependsOn = input<NavItem[]>([]);
  readonly exports = input<NavItem[]>([]);
  readonly docs = input<NavItem[]>([]);
  readonly liveExamples = input<NavItem[]>([]);

  scrollTo(fragment: string): void {
    document.getElementById(fragment)?.scrollIntoView();
  }
}
