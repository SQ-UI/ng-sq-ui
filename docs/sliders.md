# Sliders

> Applies to **3.x** (Angular 22). Exported by `@sq-ui/ng-sq-common` and `@sq-ui/ng-sq-ui`.

Use `sq-slider` for a single numeric value and `sq-range-slider` for a lower/upper pair.
Both are standalone, horizontal controls with native keyboard support, pointer/touch dragging,
three sizes, tick marks, formatted values and Angular Signal Forms support.

[Open all interactive examples](https://sq-ui.dev/#/embed/sliders)

<div class="docs-preview" data-demo-preview="sliders">
  <div class="docs-preview-toolbar"><span>Live preview</span><a href="https://sq-ui.dev/#/embed/sliders" target="_blank" rel="noopener">Open examples ↗</a></div>
  <iframe src="https://sq-ui.dev/#/embed/sliders" title="Interactive slider examples" loading="lazy" height="1000"></iframe>
</div>

## Single value: volume

```typescript
import { Component, signal } from '@angular/core';
import { SliderComponent } from '@sq-ui/ng-sq-common';

@Component({
  imports: [SliderComponent],
  template: `
    <sq-slider controlLabel="Volume" [(value)]="volume" [formatValue]="percent" />
    <p>Current volume: {{volume()}}%</p>
  `,
})
export class VolumeExample {
  readonly volume = signal(65);
  readonly percent = (value: number) => `${value}%`;
}
```

## Range: budget filter

The separate range component keeps two-way bindings typed as a tuple. Moving either handle never
crosses the other. Clicking the track moves the nearest handle; dragging it updates the pair.

```typescript
import { Component, computed, signal } from '@angular/core';
import { RangeSliderComponent, type SliderRange } from '@sq-ui/ng-sq-common';

@Component({
  imports: [RangeSliderComponent],
  template: `
    <sq-range-slider controlLabel="Nightly budget"
      [minValue]="0" [maxValue]="500" [step]="10" [(value)]="budget" [formatValue]="currency" />
    @for (price of matchingPrices(); track price) { <p>€{{price}}</p> }
  `,
})
export class BudgetExample {
  readonly budget = signal<SliderRange>([100, 350]);
  readonly currency = (value: number) => `€${value}`;
  readonly prices = [80, 150, 300, 450];
  readonly matchingPrices = computed(() => this.prices.filter(price =>
    price >= this.budget()[0] && price <= this.budget()[1]));
}
```

## Discrete choices and decimal steps

```html
<!-- Rating: five reachable values, with a tick for each one. -->
<sq-slider controlLabel="Rating" [minValue]="1" [maxValue]="5" [step]="1"
  [showTicks]="true" [(value)]="rating" />

<!-- Opacity: a decimal model between zero and one. -->
<sq-slider controlLabel="Opacity" [minValue]="0" [maxValue]="1" [step]="0.05"
  [(value)]="opacity" />
<div [style.opacity]="opacity()">Preview</div>

<!-- Sizes use the same values as the other common components. -->
<sq-slider size="small" controlLabel="Compact" [value]="25" />
<sq-slider size="medium" controlLabel="Default" [value]="50" />
<sq-slider size="large" controlLabel="Comfortable" [value]="75" />
```

Declare `rating = signal(4)` and `opacity = signal(0.75)` and import `SliderComponent`.
Ticks are hidden when a scale would need more than 101 marks.

## Commit expensive work on release

`value` / `valueChange` updates during interaction. `valueCommitted` fires when the user releases
a pointer or commits a native keyboard change, so callers can defer a seek or a request:

```html
<sq-slider controlLabel="Playback" [(value)]="position"
  (valueCommitted)="seekTo($event)" />
```

The range output carries a `SliderRange`; the single output carries a `number`. Programmatic model
changes do not emit `valueCommitted`. Cancelled pointer gestures do not commit; values already
previewed remain in the model.

## Angular Signal Forms

```typescript
import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { SliderComponent, RangeSliderComponent, type SliderRange } from '@sq-ui/ng-sq-common';

@Component({
  imports: [FormField, SliderComponent, RangeSliderComponent],
  template: `
    <sq-slider controlLabel="Brightness" [formField]="settingsForm.brightness" />
    <sq-range-slider controlLabel="Budget" [formField]="settingsForm.budget" />
  `,
})
export class SettingsExample {
  readonly settings = signal<{ brightness: number; budget: SliderRange }>({
    brightness: 70, budget: [20, 80],
  });
  readonly settingsForm = form(this.settings);
}
```

Both controls implement `SqFormFieldSignals` and `SqFormValueControl<T>`. They receive disabled state
from Signal Forms and emit `touch` when focus leaves the control. Moving focus between range
handles does not mark the field touched.

## Shared API

| Input | Default | Purpose |
| --- | --- | --- |
| `minValue` / `maxValue` | `0` / `100` | Inclusive numeric bounds |
| `step` | `1` | Positive increment, anchored to `minValue` |
| `size` | `'medium'` | `'small'`, `'medium'`, `'large'` |
| `controlLabel` | `''` | Visible, associated label |
| `ariaLabel` | `'Slider'` | Accessible name when the visible label is omitted |
| `lowerLabel` / `upperLabel` | `'Minimum'` / `'Maximum'` | Range handle names, appended to the control label |
| `disabled` | `false` | Disables pointer and keyboard interaction |
| `showValue` / `showBounds` | `true` / `true` | Show selected value(s) and scale endpoints |
| `showTicks` | `false` | Marks each reachable step on reasonably sized scales |
| `formatValue` | `String` | `(value: number) => string`, used for visible and accessible values |
| `helpText` / `errorText` | `''` / `''` | Description; errors take precedence and set `aria-invalid` |
| `controlId` / `name` | Generated unique IDs | Base IDs and native input names; range handles get `-0` / `-1` suffixes |

`sq-slider` exposes `value = model<number>(0)`; `sq-range-slider` exposes
`value = model<SliderRange>([0, 100])`, where `SliderRange = readonly [number, number]`.
Both expose `valueCommitted` and `touch`. Shared form-contract inputs are also available;
`required` supplies the accessible state and label marker. Schema validation belongs to the caller.

External values are displayed clamped and snapped to the scale. Reversed external ranges are
displayed in ascending order. Rendering leaves the supplied model untouched; user interaction
writes normalized values. If `maxValue` is not on a step, the last reachable step is below it.
Nonfinite bounds use safe defaults, nonpositive/nonfinite steps use `1`, and `maxValue <= minValue`
produces a disabled fixed-value control.

## Keyboard and theming

Tab focuses each native handle in order. Arrow keys move one step; Home and End select the
reachable limits. Range handles stop at their neighbour. Focus is visible around the active thumb.
Value text, handle names, dynamic range limits and error/helper descriptions are exposed to
assistive technology. Sliders currently use a horizontal, left-to-right scale.

The controls inherit SQ-UI theme tokens without requiring a `.sq` ancestor. Override the accent
or track locally:

```css
.violet-slider {
  --sq-slider-color: #7956c8;
  --sq-slider-track-color: #ece7f5;
}
```

```html
<sq-slider class="violet-slider" controlLabel="Opacity" [value]="50" />
<sq-slider controlLabel="Unavailable" [value]="40" [disabled]="true" />
<sq-slider controlLabel="Storage" [value]="90" errorText="Your plan supports up to 80 GB." />
```
