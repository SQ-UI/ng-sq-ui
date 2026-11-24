import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TooltipDirective, type TooltipPosition } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-tooltip-preview',
  standalone: true,
  imports: [TooltipDirective],
  templateUrl: './tooltip-preview.component.html',
  styleUrls: ['./tooltip-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPreviewComponent {
  readonly positions: TooltipPosition[] = ['top', 'bottom', 'left', 'right'];
  readonly longText = 'Tooltips wrap long descriptions and stay inside the visible window, even near its edges. ' +
    'They also follow their trigger when you scroll or resize the window.';
}
