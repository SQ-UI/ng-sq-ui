import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AppNavComponent } from "./app-nav/app-nav.component";
import { NavItem } from "./shared";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, AppNavComponent],
})
export class AppComponent {
  readonly navItems: NavItem[] = [
    {
      name: "SQ-UI",
      routeLink: "sq-ui",
    },
    {
      name: "Common",
      routeLink: "sq-common",
    },
    {
      name: "Datetime Picker",
      routeLink: "datetime-picker",
    },
    {
      name: "Datatable",
      routeLink: "datatable",
    },
    {
      name: "Modal",
      routeLink: "modal",
    },
  ];
}
