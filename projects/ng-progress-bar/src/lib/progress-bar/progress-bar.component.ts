import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
} from "@angular/core";
import { Size } from "@sq-ui/ng-sq-common";

@Component({
  selector: "sq-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class ProgressBarComponent {
  readonly size = input<Size>("medium");
  readonly loaded = input<number>(0);
  readonly infinite = input<boolean>(false);
  readonly backgroundColor = input<string>("");
  readonly fillColor = input<string>("");
}
