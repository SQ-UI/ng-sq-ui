# DatetimePickerModule

> Applies to **3.x** (Angular 22).

This package contains two standalone components: **sq-datetime-picker** and **sq-time-picker**. The
datetime picker can embed the time picker (`[isTimepickerEnabled]="true"`), which promotes the emitted
value from `Temporal.PlainDate` to `Temporal.PlainDateTime`.

Both components use [`Temporal`](https://tc39.es/proposal-temporal/) instead of moment.js. The polyfill
ships as a dependency, and everything goes through the secondary entry point
`@sq-ui/ng-datetime-picker/temporal` — see *Temporal & the polyfill* in the README for removing it from
your bundle when the platform provides `Temporal` natively.

[sq-datetime-picker-example](https://stackblitz.com/edit/ng-sq-ui-datetime-picker?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

!> Available also as stand alone package [`@sq-ui/ng-datetime-picker`](https://www.npmjs.com/package/@sq-ui/ng-datetime-picker)

## sq-datetime-picker

```html
<sq-datetime-picker
  controlLabel="Pick a date"
  [minDate]="minDate"
  [maxDate]="maxDate"
  [isMultipleSelect]="true"
  [(value)]="dates">
</sq-datetime-picker>
```

```typescript
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';
import type { DatetimePickerValue } from '@sq-ui/ng-datetime-picker';

readonly minDate = Temporal.Now.plainDateISO();
readonly maxDate = Temporal.Now.plainDateISO().add({ years: 5 });
readonly dates = signal<DatetimePickerValue>([]);
```

### Component properties

- **`name`** (`input<string>`): name of the control. Generated (`sq-form-control-<n>`) when omitted.
- **`controlId`** (`input<string>`): id of the control. Generated when omitted.
- **`controlLabel`** (`input<string>`): label. Defaults to `''`.
- **`controlPlaceholder`** (`input<string>`): placeholder. Defaults to `''`.
- **`required`** (`input<boolean>`): marks the control as required. Defaults to `false`.
- **`pattern`** (`input<readonly RegExp[]>`): validation patterns. Defaults to `[]`.
- **`disabled`** (`input<boolean>`): enables/disables the control. Defaults to `false`.
- **`locale`** (`input<string>`): any BCP-47 locale understood by `Intl`. Defaults to `'en'`.
- **`minDate`** / **`maxDate`** (`input<Temporal.PlainDate | Date | undefined>`): the selectable range.
  Dates (and months/years) outside it are disabled.
- **`isMultipleSelect`** (`input<boolean>`): when `true` the model holds an **array** of dates instead
  of a single value. Defaults to `false`.
- **`dateObjectType`** (`input<string>`): one of `DateObjectType.PlainDate` (`'plaindate'`, default),
  `DateObjectType.Date` (`'date'`) or `DateObjectType.Unix` (`'unix'`, epoch milliseconds).
- **`format`** (`input<string | undefined>`): output format built from `YYYY`, `MM`, `DD` and, when a
  time is selected, `hh`, `mm`, `ss`. When set, `dateObjectType` is ignored and the model holds strings.
- **`isTimepickerEnabled`** (`input<boolean>`): shows the embedded time picker and emits
  `Temporal.PlainDateTime` values. Defaults to `false`.
- **`timepickerConfig`** (`input<TimepickerConfig | undefined>`): configuration forwarded to the
  embedded time picker.
- **`value`** (`model<DatetimePickerValue>`): two-way binding for the selection.
- **`touch`** (`output<void>`): fires when the user leaves the control, so `[formField]` can mark the
  field as touched.
- **`dateSelectionChange`** (`output<DatetimePickerValue>`): fires on every selection change.

### Model type

```typescript
type DatetimePickerDate = Temporal.PlainDate | Temporal.PlainDateTime | Date | number | string;

/** An array when `[isMultipleSelect]="true"`, otherwise a single date. */
type DatetimePickerValue = DatetimePickerDate | DatetimePickerDate[] | null;
```

## sq-time-picker

```html
<sq-time-picker
  controlLabel="Pick a time"
  [(value)]="time"
  (hoursChange)="hoursChange($event)"
  (minutesChange)="minutesChange($event)"
  timeObjectType="string"
  [hours]="13"
  [minutes]="20"
  [hourStep]="1"
  [minuteStep]="5"
  [isEditable]="true"
  [isMeridiem]="false">
</sq-time-picker>
```

```typescript
import type { TimePickerValue } from '@sq-ui/ng-datetime-picker';

readonly time = signal<TimePickerValue>(null);
```

### Component properties

- **`name`**, **`controlId`**, **`controlLabel`**, **`controlPlaceholder`**, **`required`**,
  **`pattern`**, **`disabled`**: the shared form field contract (see CommonModule).
- **`hourStep`** (`input<number>`): increment/decrement step for the hours spinner. Defaults to `1`.
- **`minuteStep`** (`input<number>`): increment/decrement step for the minutes spinner. Defaults to `1`.
- **`isMeridiem`** (`input<boolean>`): displays 12-hour time with an AM/PM toggle. Defaults to `false`
  (24-hour).
- **`isEditable`** (`input<boolean>`): allows typing the hours/minutes. Defaults to `true`.
- **`hours`** / **`minutes`** (`input<number | undefined>`, aliases of `inputHours`/`inputMinutes`):
  initial values. Default to `undefined`, which starts from the current time.
- **`timeObjectType`** (`input<string>`): `TimeObject.String` (`'string'`, default),
  `TimeObject.PlainTime` (`'plaintime'`), or the deprecated `TimeObject.Moment`.
- **`value`** (`model<TimePickerValue>`): two-way binding; a formatted string or a
  `Temporal.PlainTime`, depending on `timeObjectType`.
- **`hoursChange`** / **`minutesChange`** (`output<number>`, aliases of `inputHoursChange` /
  `inputMinutesChange`): fire when the spinners change the hours/minutes.
- **`touch`** (`output<void>`): fires when the user leaves the control.

```typescript
/** A formatted string, a `Temporal.PlainTime`, or nothing. */
type TimePickerValue = string | Temporal.PlainTime | null;
```

## Interfaces

### TimepickerConfig

```typescript
interface TimepickerConfig {
  hourStep?: number;
  minuteStep?: number;
  hours?: number;
  minutes?: number;
  isMeridiem?: boolean;
  isEditable?: boolean;
}
```

## Enums

| Enum | Members |
|---|---|
| `DateObjectType` | `PlainDate = 'plaindate'`, `Date = 'date'`, `Unix = 'unix'` |
| `TimeObject` | `String = 'string'`, `PlainTime = 'plaintime'`, `Moment = 'moment'` (deprecated) |
| `TimeUnit` | `Hours`, `Minutes` |
| `CalendarPeriodTypeEnum` | `Month`, `Year` |
| `CalendarPeriodRelativityEnum` | `Before`, `Current`, `After` |
