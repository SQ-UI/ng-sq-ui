# DatetimePickerModule

This module consists of two standalone components: **sq-datetime-picker** and **sq-time-picker**. Sq-datetime-picker is a regular datepicker component which also has a built-in sq-time-picker. Both components rely on **moment.js** to work, although input/output values for the datepicker can be configured to work with the JavaScript Date object.

[sq-datetime-picker-example](https://stackblitz.com/edit/ng-sq-ui-standalone-calendar?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

!> Available also as stand alone package [`@sq-ui/ng-datetime-picker`](https://www.npmjs.com/package/@sq-ui/ng-datetime-picker)

## sq-datetime-picker

```html
<sq-datetime-picker
    [maxDate]="maxDate"
    [minDate]="minDate"
    format="MM/DD/YYYY"
    formControlName="standAloneDatepicker"
    [isMultipleSelect]="isDatepickerMultipleSelect">
</sq-datetime-picker>
```

- **`@Input()` name**: `string` - Name of the `'datetime-picker'`. If not provided, a generic name is generated, using the following pattern: `'sq-form-control'` + `new Date().getTime().toString()`.
- **`@Input()` controlId**: string - Id of the datetime-picker. If not provided, a generic name is generated, using the following pattern: `'sq-form-control'` + `new Date().getTime().toString()`.
- **`@Input()` locale**: `string` - Accepts any type of valid locale string, as documented in [moment.js](http://momentjs.com/docs/#/i18n/getting-locale/). Defaults to **'en'** locale.
- **`@Input()` maxDate**: `momentNs.Moment` | `Date` - The maximum date which can be selected. All dates beyond this date are disabled (this also includes months and years). **Defaults to `null`**.
- **`@Input()` minDate**: `momentNs.Moment` | `Date` - The minimum date which can be selected. All dates before this date are disabled (this also includes months and years). **Defaults to `null`**.
- **`@Input()` isMultipleSelect**: `boolean` - Determines if multiple dates to be chosen. In this mode, the **datetime-picker returns an `array`** of selected dates. **Defaults to `false`**.
  - When set to true, the datetime-picker returns an array of the selected dates in the format, specified by the dateObjectType prop or the format prop.
  - When set to false, the datetime-picker returns the selected date parsed in the format, specified by the dateObjectType prop or the format prop.
- **`@Input()` dateObjectType**: `string` - Can have one of the following values: `moment` | `date` | `unix`. This property determines the type of the selected dates. **Defaults to `moment`**.
  - When set to `moment`, the selected values are **returned as moment.js objects**;
  - When set to `date`, the selected values are **returned as regular JavaScript Date objects**;
  - When set to `unix`, the selected values are **returned as unix timestamps in milliseconds**.
- **`@Input()` format**: `string` - Any valid format string supported by [moment.js](http://momentjs.com/docs/#/displaying/format/). When a format string is set, the return type for dateObjectType is ignored and the datetime-picker will return the selected dates as strings. **Defaults to `null`**.
- **`@Input()` isTimepickerEnabled**: `boolean` - A flag which shows/hides the timepicker. **Defaults to false;**.
- **`@Input()` timepickerConfig**: `TimepickerConfig` - A configurational object for the built-in timepicker. See [TimepickerConfig interface](interfaces.md?id=timepickerconfig).
- **`@Output()` dateSelectionChange**: `EventEmitter<momentNs.Moment | Date>` - Event emitter triggered every time the user selects a date from the calendar.

## sq-time-picker

```html
<sq-time-picker formControlName="standAloneTimepicker"
    (hoursChange)="hoursChange($event)"
    (minutesChange)="minutesChange($event)"
    timeObjectType="string"
    [hours]="standAloneTimepicker.hours"
    [minutes]="standAloneTimepicker.minutes"
    [hourStep]="standAloneTimepicker.hourStep"
    [minuteStep]="standAloneTimepicker.minuteStep"
    [isEditable]="standAloneTimepicker.isEditable"
    [isMeridiem]="standAloneTimepicker.isMeridiem">
</sq-time-picker>
```

- **`@Input()` hourStep**: `number` - Determines the number with which the user can increment/decrement the hours using the spinners. **Defaults to 1**.
- **`@Input()` minuteStep**: `number` - Determines the number with which the user can increment/decrement the minutes using the spinners. **Defaults to 1**.
- **`@Input()` isMeridiem**: `boolean` - Determines whether to use the 12-hour or the 24-hour format to display the time. **Defaults to `false`**. - When set to `true`, the time is displayed in **12-hour format**. - When set to `false`, the time is displayed in **24-hour format**.
- **`@Input()` isEditable**: `boolean` - Determines whether the user can manually type in numbers for hours and minutes. **Defaults to `true`**. - When set to `true`, the user can manually input numbers for hours and minutes. - When set to `false`, the hours and minutes inputs are disabled.
- **`@Input()` hours**: `number` - Specific hours which the timepicker should display once initialized. **Defaults to `null`**.
- **`@Input()` minutes**: `number` - Specific minutes which the timepicker should display once initialized. **Defaults to `null`**.
- **`@Output()` hoursChange**: `EventEmitter<number>` - Event emitter, triggered on every change to the hours property.
- **`@Output()` minutesChange**: `new EventEmitter<number>()` - Event emitter, triggered on every change to the minutes property.
- **`@Input()` timeObjectType**: `string` - Can have one of the following values: `string` | `moment`. Determines how the time-picker should return the selected time. - When set to `string`, it converts the time into a `string`, respecting the isMeridiem property. - When set to `moment`, it converts the time into a `moment.js object`.

## Interfaces
### TimepickerConfig

?> Used for configuring the datetime component.

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
