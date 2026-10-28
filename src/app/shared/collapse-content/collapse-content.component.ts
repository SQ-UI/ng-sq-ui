import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'sq-collapse-content',
  standalone: true,
  imports: [NgClass],
  templateUrl: './collapse-content.component.html',
  styleUrls: ['./collapse-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapseContentComponent {
  readonly title = input<string>('');
  readonly isSecondary = input(false);

  // The content starts expanded (matching the previous rendering) and collapses on demand.
  isCollapsed = signal(false);

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }
}
