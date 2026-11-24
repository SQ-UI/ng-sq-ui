import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { RangeSliderComponent, SliderComponent, type Size, type SliderRange } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-slider-preview',
  imports: [SliderComponent, RangeSliderComponent, FormField],
  templateUrl: './slider-preview.component.html',
  styleUrls: ['./slider-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPreviewComponent {
  readonly volume = signal(65);
  readonly budget = signal<SliderRange>([100, 350]);
  readonly rating = signal(4);
  readonly opacity = signal(0.75);
  readonly progress = signal(35);
  readonly committedProgress = signal(35);
  readonly settings = signal({ brightness: 70 });
  readonly settingsForm = form(this.settings);
  readonly sizes: Size[] = ['small', 'medium', 'large'];
  readonly percent = (value: number) => `${value}%`;
  readonly currency = (value: number) => `€${value}`;
  readonly decimalPercent = (value: number) => `${Math.round(value * 100)}%`;
  readonly storageFormat = (value: number) => `${value} GB`;
  readonly stars = [1, 2, 3, 4, 5];
  readonly stays = [
    { name: 'City studio', price: 80 }, { name: 'Garden apartment', price: 150 },
    { name: 'Seaside suite', price: 300 }, { name: 'Mountain chalet', price: 450 },
  ];
  readonly matchingStays = computed(() => this.stays.filter(stay => stay.price >= this.budget()[0] && stay.price <= this.budget()[1]));
  readonly examples = {
    volume: `import { SliderComponent } from '@sq-ui/ng-sq-common';

readonly volume = signal(65);
readonly percent = (value: number) => \`\${value}%\`;

<sq-slider controlLabel="Volume" [(value)]="volume"
  [formatValue]="percent" />`,
    budget: `import { RangeSliderComponent, type SliderRange } from '@sq-ui/ng-sq-common';

readonly budget = signal<SliderRange>([100, 350]);

<sq-range-slider controlLabel="Nightly budget"
  [minValue]="0" [maxValue]="500" [step]="10"
  [(value)]="budget" />`,
    rating: `readonly rating = signal(4);

<sq-slider controlLabel="Rating" [minValue]="1" [maxValue]="5"
  [step]="1" [showTicks]="true" [(value)]="rating" />`,
    opacity: `readonly opacity = signal(0.75);

<sq-slider controlLabel="Opacity" [minValue]="0" [maxValue]="1"
  [step]="0.05" [(value)]="opacity" />
<div [style.opacity]="opacity()">Preview</div>`,
    forms: `import { FormField, form } from '@angular/forms/signals';

readonly settings = signal({ brightness: 70 });
readonly settingsForm = form(this.settings);

<sq-slider controlLabel="Brightness"
  [formField]="settingsForm.brightness" />`,
    commit: `<sq-slider controlLabel="Playback" [(value)]="progress"
  (valueCommitted)="seekTo($event)" />

<!-- value updates while dragging; valueCommitted fires on release. -->`,
  };
}
