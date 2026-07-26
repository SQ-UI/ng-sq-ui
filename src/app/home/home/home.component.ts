import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "sq-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class HomeComponent {}
