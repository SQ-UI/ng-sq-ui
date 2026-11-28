import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './theme.service';
import { uiConfig, labels } from './ui-config';

@Component({
  selector: 'app-root', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './app.component.html',
  host: { '(document:keydown.escape)': 'closeMenu()' }
})
export class AppComponent {
  readonly config = uiConfig;
  readonly text = labels;
  readonly theme = inject(ThemeService);
  readonly expanded = signal(false);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  closeMenu(): void { if (this.expanded()) { this.expanded.set(false); this.menuButton()?.nativeElement.focus(); } }
}
