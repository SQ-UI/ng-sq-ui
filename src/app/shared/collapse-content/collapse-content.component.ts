import { Component, ChangeDetectionStrategy, input } from '@angular/core';
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

  isCollapsed = true;

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
