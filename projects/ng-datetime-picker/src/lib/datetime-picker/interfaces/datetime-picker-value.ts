import type { Temporal } from '@sq-ui/ng-datetime-picker/temporal';

/**
 * A single date value produced (and accepted) by `sq-datetime-picker`.
 *
 * Which member is used follows the inputs:
 * - `[dateObjectType]="'plaindate'"` (default) → `Temporal.PlainDate` / `Temporal.PlainDateTime`
 * - `[dateObjectType]="'date'"` → `Date`
 * - `[dateObjectType]="'unix'"` → `number` (epoch milliseconds)
 * - `[format]` set → `string`
 *
 * `Temporal.PlainDateTime` appears when `[isTimepickerEnabled]="true"` adds a time to the selection.
 */
export type DatetimePickerDate = Temporal.PlainDate | Temporal.PlainDateTime | Date | number | string;

/**
 * Model type of `sq-datetime-picker`: a single date, or an array of dates when
 * `[isMultipleSelect]="true"`.
 */
export type DatetimePickerValue = DatetimePickerDate | DatetimePickerDate[] | null;

/**
 * A single time value produced (and accepted) by `sq-time-picker`: a formatted string
 * (`HH:mm` / `hh:mm AM`), a `Temporal.PlainTime` when `[timeObjectType]` asks for it, or nothing.
 */
export type TimePickerValue = string | Temporal.PlainTime | null;
