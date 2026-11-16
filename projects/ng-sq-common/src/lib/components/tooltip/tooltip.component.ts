import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Internal view owned by TooltipDirective. */
@Component({
  selector: 'sq-tooltip',
  standalone: true,
  template: '{{ text() }}',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'tooltip' },
})
export class TooltipComponent {
  readonly text = input('');
}
