# ProgressBarModule

> Applies to **3.x** (Angular 22).

## sq-progress-bar

[sq-progress-bar-example](https://stackblitz.com/edit/ng-sq-ui-progress-bar?ctl=1&embed=1&view=preview ':include :type=iframe')

`sq-progress-bar` is a small, styleable loader.

!> Available in [@sq-ui/ng-sq-ui](https://www.npmjs.com/package/@sq-ui/ng-sq-ui) and [@sq-ui/ng-progress-bar](https://www.npmjs.com/package/@sq-ui/ng-progress-bar)

```html
<sq-progress-bar size="small" [loaded]="progressBarLoaded()"></sq-progress-bar>
<sq-progress-bar size="large" [infinite]="true"></sq-progress-bar>
<sq-progress-bar size="small" variant="segmented" [segments]="4" [loaded]="25"></sq-progress-bar>
<sq-progress-bar size="small" variant="steps" [steps]="['Done', 'Current', 'Next', 'Next', 'Next']"
                 [currentStep]="1" label="Setup progress"></sq-progress-bar>
```

```typescript
export class ExampleComponent {
  readonly progressBarLoaded = signal(20);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.progressBarLoaded.update(v => (v + 20 > 100 ? 0 : v + 20)));
  }
}
```

### Component properties

- **`size`** (`input<Size>`): `'small' | 'medium' | 'large'`. Defaults to `'medium'`; heights are 4px, 8px and 12px.
- **`label`** (`input<string>`): accessible name for the progressbar, default `'Progress'`. Use a task-specific label such as `label="Uploading documents"`. Determinate bars expose `loaded` as `aria-valuenow`; infinite bars omit that value.
- **`loaded`** (`input<number>`): percent filled for linear/segmented variants, clamped to 0–100.
  Missing/nonfinite values render as zero.
- **`variant`** (`input<ProgressVariant>`): `'linear'` (default), `'segmented'` or `'steps'`.
  `ProgressVariant` is exported from the progress package and umbrella package.
- **`segments`** (`input<number>`): number of equal segments, default 4; normalized to a positive
  integer. Each segment fills according to `loaded`, including a partially filled segment.
- **`steps`** (`input<readonly string[]>`): labels for the step variant; defaults to an empty list.
- **`currentStep`** (`input<number>`): zero-based current step, default 0. `-1` means not started;
  `steps.length` means complete. Out-of-range values are clamped; nonfinite values use zero.
- **`infinite`** (`input<boolean>`): switches to the existing cyclic linear animation regardless of
  `variant`, ignoring `loaded`. Defaults to `false`. Reduced-motion preferences disable its motion.
- **`backgroundColor`** (`input<string>`): any CSS color for the track. Defaults to the theme color.
- **`fillColor`** (`input<string>`): any CSS color for the filled line. Defaults to the theme color.

```html
<sq-progress-bar
  size="medium"
  [loaded]="75"
  backgroundColor="#f2f2f2"
  fillColor="#4f6d8c">
</sq-progress-bar>
```

Both colors are applied as inline styles, so they override the theme without touching the stylesheet.

The default track is Gray 3 (`#DCDCDC`) and the fill is Brand (`#00C474`). Override inherited
`--sq-color-progress-track` / `--sq-color-brand`, or use the existing color inputs across all variants.
The progress track no longer follows `color-secondary`; the legacy progress-background aliases now
use the dedicated progress-track default too.
The small reference uses 4px tracks, 4px segment gaps, 20px step markers and 14/24 labels. Completed
and current markers are green; only the current label is green. Other labels are disabled gray.
Medium/large retain 8/12px track thickness; step markers and labels keep the small reference sizes.

Steps use a named group containing an ordered list. Each item announces its label and
completed/current/upcoming status, and the current item has `aria-current="step"`. The step variant
is a status display; it does not introduce navigation buttons or keyboard targets. Empty lists render
no markers, and a single step has no connector. Labels wrap when space is limited.

### Verification

Seven progress tests cover clamped percentages, partial segments, current/completed/not-started
states, empty/single-step lists and indeterminate compatibility. Common/progress production builds,
the demo build, lint, TypeScript and isolated Sass checks pass.

Chrome checks at 1440/390/320px verify default colors, 4/8/12px bars, segment gaps/fills, 20px markers,
current-label color and connector alignment, accessible states, short-label wrapping, inherited/inline
color overrides, reduced motion and no page overflow. Captures: [desktop](progress/screenshots/progress-1440.png),
[mobile](progress/screenshots/progress-390.png), [small mobile](progress/screenshots/progress-320.png).
The [browser manifest](progress/screenshots/manifest.json) records the measured values.
