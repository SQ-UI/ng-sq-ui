# Datetime Picker

Standalone components **`sq-datetime-picker`** and **`sq-time-picker`** from `@sq-ui/ng-datetime-picker` (also re-exported by `@sq-ui/ng-sq-ui`).

Both implement `FormValueControl` and bind with **`[formField]`**. Dates and times use the **Temporal** API — there is **no moment.js**.

Install the polyfill where Temporal is not native (e.g. Safari):

```bash
npm i @js-temporal/polyfill --save
```

[sq-datetime-picker-example](https://stackblitz.com/edit/ng-sq-ui-datetime-picker?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

!> Package: [`@sq-ui/ng-datetime-picker`](https://www.npmjs.com/package/@sq-ui/ng-datetime-picker)

## sq-datetime-picker

Canonical `value`: `Temporal.PlainDate` (single), `Temporal.PlainDate[]` (multi-select), or `null`.

```html
<sq-datetime-picker
  [formField]="f.date"
  [maxDate]="maxDate"
  [minDate]="minDate"
  [isMultipleSelect]="false">
</sq-datetime-picker>
```

```typescript
import { Temporal } from '@js-temporal/polyfill';

minDate = new Temporal.PlainDate(2024, 1, 1);
maxDate = new Temporal.PlainDate(2025, 12, 31);
```

- **`locale`**: `string` — BCP 47 locale for labels (`Intl`). Defaults to `'en'`.
- **`minDate` / `maxDate`**: `Temporal.PlainDate | Date | string | null` — bounds (normalized internally).
- **`isMultipleSelect`**: `boolean` — when `true`, value is `Temporal.PlainDate[]`. Defaults to `false`.
- **`dateSelectionChange`**: output of the current value
- **`value`**: model `Temporal.PlainDate | Temporal.PlainDate[] | null`

Also inherits shared `SqInputCore` inputs (`name`, `controlId`, `controlLabel`, …).

## sq-time-picker

Canonical `value`: `Temporal.PlainTime | null`.

```html
<sq-time-picker
  [formField]="f.time"
  [hourStep]="1"
  [minuteStep]="5"
  [isMeridiem]="false"
  [isEditable]="true"
  (hoursChange)="onHours($event)"
  (minutesChange)="onMinutes($event)">
</sq-time-picker>
```

- **`hourStep` / `minuteStep`**: spinner increments. Defaults `1`.
- **`isMeridiem`**: `boolean` — 12-hour vs 24-hour display. Defaults `false`.
- **`isEditable`**: `boolean` — allow typing hours/minutes. Defaults `true`.
- **`hours` / `minutes`**: optional initial display hints (`number | null`)
- **`hoursChange` / `minutesChange`**: outputs `number`
- **`value`**: model `Temporal.PlainTime | null`
