import { Component, ViewEncapsulation, ChangeDetectionStrategy, input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { Size } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-progress-bar',
  standalone: true,
  imports: [NgClass, NgStyle],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  size = input<Size>('medium');
  loaded = input<number>();
  infinite = input<boolean>(false);
  backgroundColor = input<string>('');
  fillColor = input<string>('');
}
