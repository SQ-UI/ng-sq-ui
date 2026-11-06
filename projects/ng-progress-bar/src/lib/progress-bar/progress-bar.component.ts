import { Component, ViewEncapsulation, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import type { Size } from '@sq-ui/ng-sq-common';

export type ProgressVariant = 'linear' | 'segmented' | 'steps';

@Component({
  selector: 'sq-progress-bar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  size = input<Size>('medium');
  label = input<string>('Progress');
  loaded = input<number>();
  infinite = input<boolean>(false);
  backgroundColor = input<string>('');
  fillColor = input<string>('');
  variant = input<ProgressVariant>('linear');
  segments = input<number>(4);
  steps = input<readonly string[]>([]);
  /** Zero-based active step; -1 means not started, steps.length means complete. */
  currentStep = input<number>(0);

  readonly percentage = computed(() => {
    const loaded = this.loaded();
    return typeof loaded === 'number' && Number.isFinite(loaded) ? Math.min(100, Math.max(0, loaded)) : 0;
  });
  readonly segmentFills = computed(() => {
    const count = Math.max(1, Math.trunc(Number.isFinite(this.segments()) ? this.segments() : 4));
    const progress = this.percentage() / 100 * count;
    return Array.from({ length: count }, (_, index) => Math.min(1, Math.max(0, progress - index)) * 100);
  });
  readonly activeStep = computed(() => Math.max(-1, Math.min(this.steps().length,
    Number.isFinite(this.currentStep()) ? Math.trunc(this.currentStep()) : 0)));
  readonly stepPercentage = computed(() => this.steps().length > 1
    ? Math.min(100, Math.max(0, this.activeStep() / (this.steps().length - 1) * 100)) : 0);
}
