import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from "@angular/core";

@Component({
  selector: "sq-collapse-content",
  templateUrl: "./collapse-content.component.html",
  styleUrls: ["./collapse-content.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CollapseContentComponent {
  readonly title = input<string>("");
  readonly isSecondary = input(false);

  readonly isCollapsed = signal(true);

  toggleCollapse(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }
}
