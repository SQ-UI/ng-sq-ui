# Form Elements

Standalone form controls from `@sq-ui/ng-form-elements` (also re-exported by `@sq-ui/ng-sq-ui`).

Controls that hold a value implement Angular Signal Forms contracts and bind with **`[formField]`**:

- Most controls: `FormValueControl` (`value` model)
- `sq-checkbox`: `FormCheckboxControl` (`checked` model — **not** `value`)

```typescript
import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import {
  InputComponent,
  CheckboxComponent,
  DropdownComponent,
} from '@sq-ui/ng-form-elements';

@Component({
  imports: [FormField, InputComponent, CheckboxComponent, DropdownComponent],
  template: `
    <sq-input [formField]="f.name" controlLabel="Name" />
    <sq-checkbox [formField]="f.accept" controlLabel="Accept" />
    <sq-dropdown [formField]="f.option" [options]="options" controlLabel="Option" />
  `,
})
export class Example {
  options = [
    { label: 'One', value: 1 },
    { label: 'Two', value: 2 },
  ];
  model = signal({ name: '', accept: false, option: null });
  f = form(this.model);
}
```

[sq-form-components-example](https://stackblitz.com/edit/ng-sq-ui-form-elements?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

!> Available via [@sq-ui/ng-sq-ui](https://www.npmjs.com/package/@sq-ui/ng-sq-ui) and [@sq-ui/ng-form-elements](https://www.npmjs.com/package/@sq-ui/ng-form-elements)

## Shared control inputs (`SqInputCore`)

Form-value controls extend `SqInputCore` from `@sq-ui/ng-sq-common`:

- **`name`**, **`controlId`**, **`controlLabel`**, **`controlPlaceholder`**
- **`required`**, **`pattern`** (`readonly RegExp[]`), **`disabled`**, **`readonly`**, **`hidden`**, **`invalid`**
- **`errors`**, **`disabledReasons`** (Signal Forms field state)
- **`touch`** output

Defaults for `name` / `controlId` are generated when omitted.

## sq-input

Thin wrapper over native `input`. `FormValueControl<string>`.

```html
<sq-input
  [formField]="f.name"
  controlLabel="Test Label*"
  controlPlaceholder="Test placeholder"
  type="text">
</sq-input>
```

- **`type`**: `string` — native input type. Defaults to `'text'`.
- **`value`**: model `string`

## sq-textarea

Auto-expandable textarea. `FormValueControl<string>`.

```html
<sq-textarea
  [formField]="f.notes"
  controlLabel="Notes"
  controlPlaceholder="Type something in...">
</sq-textarea>
```

- **`minHeight`**: `number` — default height when empty. Defaults to `100`.
- **`value`**: model `string`

## sq-button

Presentational button wrapper (not a form-value control).

```html
<sq-button [disabled]="false" type="submit">Submit</sq-button>
```

- **`type`**: `'button' | 'submit' | 'reset'`
- **`disabled`**: `boolean`

## sq-checkbox

`FormCheckboxControl` — use **`checked`**, not `value`.

```html
<sq-checkbox [formField]="f.accept" controlLabel="Test checkbox"></sq-checkbox>
```

Custom label template (`isSelected` mirrors `checked`):

```html
<sq-checkbox [formField]="f.accept">
  <ng-template sq-checkbox-label let-isSelected="isSelected">
    @if (!isSelected) { <svg>…</svg> } @else { <svg>…</svg> }
    <span>Custom Checkbox Label</span>
  </ng-template>
</sq-checkbox>
```

- **`checked`**: model `boolean`

## sq-dropdown

Custom select-like control. Model is a **copy** of the selected `LabelValuePair`. `FormValueControl<LabelValuePair | null>`.

```html
<sq-dropdown
  [formField]="f.dropdown"
  [options]="dropdownOptions"
  controlLabel="Dropdown*"
  controlPlaceholder="Select an option">
</sq-dropdown>
```

```typescript
import { LabelValuePair } from '@sq-ui/ng-sq-common';

dropdownOptions: LabelValuePair[] = [
  { label: 'option1', value: 'someVal1' },
  { label: 'option2', value: 'someVal2' },
];
```

- **`options`**: `LabelValuePair[]`
- **`onSelectItem`**: output `LabelValuePair`
- **`value`**: model `LabelValuePair | null`
- Methods: `toggleOptionsDropdown()`, `selectOption(option)`

Custom templates: `sq-dropdown-selected-option` (`value`), `sq-dropdown-option` (`option`), `sq-dropdown-chevron` (`isDropdownOpen`).

## sq-form-group

Visual group via content projection.

```html
<sq-form-group groupLabel="Radiobuttons">
  …
</sq-form-group>
```

- **`groupLabel`**: `string`

## sq-radiobutton

`FormValueControl`. Radios that share the same **`name`** sync via `RadioGroupRegistry`.

```html
<sq-radiobutton
  name="group1"
  radioValue="value1"
  [formField]="f.radioValue"
  controlLabel="Option 1">
</sq-radiobutton>
```

- **`radioValue`**: value this radio represents
- **`value`**: model for the group selection
- **`isSelected`**: computed — whether this radio matches the group value

Custom template: `sq-radio-label` (`isSelected`, `value`).

## sq-tags-input

User-entered string tags. Model is a **copy** of `string[]`. `FormValueControl<string[]>`.

```html
<sq-tags-input
  [formField]="f.tags"
  controlLabel="Tags*"
  controlPlaceholder="Type something and press Space">
</sq-tags-input>
```

Custom template: `sq-tag` (`tag`, `remove`).

- **`value`**: model `string[]`
- Method: `removeTag(tagIndex)`

## sq-typeahead

Search-driven selection list. Model is `any[]` of **copies** of chosen items. `FormValueControl<any[]>`.

```html
<sq-typeahead
  displayProp="displayName"
  [formField]="f.typeahead"
  [searchResults]="searchResults"
  (onUserInputEnd)="searchMethod($event)"
  controlLabel="Typeahead*"
  controlPlaceholder="Type something in">
</sq-typeahead>
```

Omit `displayProp` when `searchResults` is `string[]`.

- **`searchResults`**, **`multiple`**, **`delay`** (ms), **`displayProp`**, **`hideSearchIcon`**
- **`onUserInputEnd`**: output `string`
- **`value`**: model `any[]`

Custom templates: `sq-typeahead-option` (`option`), `sq-typeahead-selected-option` (`item`, `remove`).
