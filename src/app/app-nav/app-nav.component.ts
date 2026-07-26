import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { OutsideClickListenerDirective } from "@sq-ui/ng-sq-common";
import { NavItem } from "../shared";

@Component({
  selector: "sq-app-nav",
  templateUrl: "./app-nav.component.html",
  styleUrls: ["./app-nav.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, RouterLinkActive, OutsideClickListenerDirective],
})
export class AppNavComponent {
  private readonly router = inject(Router);

  readonly navItems = input<NavItem[]>([]);

  readonly isNavOpen = signal(false);
  readonly listenForOutsideClick = signal(false);

  showNav(): void {
    this.isNavOpen.set(true);

    setTimeout(() => {
      this.listenForOutsideClick.set(true);
    }, 300);
  }

  onClickOutsideComponent(): void {
    this.isNavOpen.set(false);

    setTimeout(() => {
      this.listenForOutsideClick.set(false);
    }, 300);
  }

  navigateTo(event: Event, routeLink: string): void {
    event.preventDefault();

    if (this.isNavOpen()) {
      this.onClickOutsideComponent();
    }

    this.router.navigateByUrl("/" + routeLink);
  }
}
