# FormElementsModule

> Applies to **3.x** (Angular 22).

Every control in this page is standalone, has no `ControlValueAccessor`, and is bound with a two-way
`value` model:

```html
<sq-input controlLabel="Name" [(value)]="name"></sq-input>
```

or with Angular Signal Forms through the `[formField]` directive:

```html
<sq-input controlLabel="Name" [formField]="profileForm.name"></sq-input>
```

[sq-form-components-example](https://stackblitz.com/edit/ng-sq-ui-form-elements?ctl=1&embed=1&view=preview ':include :type=iframe height=500px width=100%')

!> Available in [@sq-ui/ng-sq-ui](https://www.npmjs.com/package/@sq-ui/ng-sq-ui) and [@sq-ui/ng-form-elements](https://www.npmjs.com/package/@sq-ui/ng-form-elements)

## The shared form field contract

All the controls below declare the same inputs (enforced by the `SqFormFieldSignals` interface, see
CommonModule) and additionally expose a `touch` output that `[formField]` uses to mark the field as
touched. Only the control-specific properties are repeated in each section.

| Input | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | generated | `sq-form-control-<n>`, unique per instance |
| `controlId` | `string` | generated | id of the native control; `<label for>` uses it |
| `controlLabel` | `string` | `''` | label text; hidden when empty |
| `controlPlaceholder` | `string` | `''` | placeholder of the native control |
| `required` | `boolean` | `false` | marks the native control as required |
| `pattern` | `readonly RegExp[]` | `[]` | serialised into the native `pattern` attribute |
| `disabled` | `boolean` | `false` | disables the native control |
| `touch` | `output<void>` | — | fires when the user leaves the control |

## sq-input

A thin wrapper over the native `input` element.

```html
<sq-input
  controlLabel="Test Label*"
  controlPlaceholder="Test placeholder"
  [pattern]="[/^\d+$/]"
  [(value)]="name">
</sq-input>
```

### Control-specific properties

- **`type`** (`input<string>`): the native input type (`text`, `email`, `password`, …). Defaults to
  `'text'`.
- **`value`** (`model<string>`): the two-way value. Defaults to `''`.

## sq-textarea

A content-editable wrapper that keeps its height, so it grows with the content instead of scrolling.

```html
<sq-textarea
  controlLabel="Notes"
  controlPlaceholder="Type something in..."
  [minHeight]="120"
  [(value)]="notes">
</sq-textarea>
```

### Control-specific properties

- **`minHeight`** (`input<number>`): minimum height in pixels. Defaults to `100`.
- **`value`** (`model<string>`): the two-way value. Defaults to `''`.

### Control-specific methods

- **`focusOnArea()`**: focuses the editable area.

## sq-button

A thin wrapper over the native `button` element.

```html
<sq-button type="submit" [disabled]="!profileForm().valid()">Submit</sq-button>
```

### Control-specific properties

- **`type`** (`input<ButtonTypes | string>`): `'button'` (default), `'submit'` or `'reset'`. Anything
  else falls back to `'button'`.
- **`disabled`** (`input<boolean>`): disables the button. Defaults to `false`.

`ButtonTypes` is exported for use in code:

```typescript
enum ButtonTypes {
  Button = 'button',
  Submit = 'submit',
  Reset = 'reset',
}
```

## sq-form-group

Draws a labelled border around a group of controls — handy for radio groups.

```html
<sq-form-group groupLabel="Shipping method">
  <sq-radiobutton name="group1" radioValue="standard" [(value)]="shipping"></sq-radiobutton>
  <sq-radiobutton name="group1" radioValue="express" [(value)]="shipping"></sq-radiobutton>
</sq-form-group>
```

### Control-specific properties

- **`groupLabel`** (`input<string>`): the label of the group. Defaults to `''`.

## sq-checkbox

A wrapper over the native `input[type="checkbox"]`.

```html
<sq-checkbox controlLabel="Accept the terms" [(value)]="accepted"></sq-checkbox>
```

With a custom label template:

```html
<sq-checkbox [(value)]="accepted">
  <ng-template sq-checkbox-label let-isSelected="isSelected">
    @if (!isSelected) {
      <span>Not selected</span>
    } @else {
      <span>Selected</span>
    }
  </ng-template>
</sq-checkbox>
```

### Control-specific properties

- **`value`** (`model<boolean>`): the two-way value. Defaults to `false`.
- **`isSelected`** (`boolean`, read-only): `!!value()`.

### Control-specific outputs

- **`isSelectedChange`** (`output<boolean>`): the new state after a toggle.

### Control-specific methods

- **`toggleCheckboxSelection()`**: flips `value` and emits `isSelectedChange`.

## sq-radiobutton

A radio button bound to a group through a shared `name`. Only one radio per group stays selected: the
component broadcasts a `sqRadio:selected` event and its siblings in the same group clear themselves.

```html
<sq-radiobutton name="group1" radioValue="value1" [(value)]="radioGroupValue"></sq-radiobutton>
<sq-radiobutton name="group1" radioValue="value2" [(value)]="radioGroupValue"></sq-radiobutton>
```

```typescript
readonly radioGroupValue = signal<string>('value1');   // RadiobuttonComponent<string>
```

With a custom label template:

```html
<sq-radiobutton name="group1" radioValue="value2" [(value)]="radioGroupValue">
  <ng-template sq-radio-label let-isSelected="isSelected">
    <span>Custom Radio Label</span>
  </ng-template>
</sq-radiobutton>
```

### Control-specific properties

- **`value`** (`model<TValue | null>`): the two-way value of the **group**; `TValue` is inferred from
  the binding. Defaults to `null`.
- **`radioValue`** (`input<unknown>`): the value this radio represents. Compared with the group value
  (`Object.is`) to decide the selected state.
- **`isSelected`** (`boolean`, read-only): `Object.is(value(), radioValue())`.

### Control-specific outputs

- **`isSelectedChange`** (`output<boolean>`): `true` when this radio got selected, `false` when a
  sibling took the selection.

### Control-specific methods

- **`selectRadio()`**: selects this radio (sets `value` to `radioValue` and emits the group event).

## sq-dropdown

An options list rendered in a popover, with three optional template slots.

```html
<sq-dropdown controlLabel="Country" [options]="countries" [(value)]="country"></sq-dropdown>
```

```typescript
readonly countries: LabelValuePair[] = [
  { label: 'Bulgaria', value: 'bg' },
  { label: 'Germany', value: 'de' },
];
readonly country = signal<LabelValuePair | null>(null);
```

With templates:

```html
<sq-dropdown [options]="countries" [(value)]="country">
  <ng-template sq-dropdown-selected-option let-option>{{ option?.label }}</ng-template>
  <ng-template sq-dropdown-option let-option>{{ option.label }}</ng-template>
  <ng-template sq-dropdown-chevron>
    <span class="caret">▾</span>
  </ng-template>
</sq-dropdown>
```

### Control-specific properties

- **`options`** (`input<LabelValuePair[]>`): the options. Defaults to `[]`.
- **`value`** (`model<LabelValuePair | null>`): the selected pair. Defaults to `null`.

### Control-specific outputs

- **`onSelectItem`** (`output<LabelValuePair>`): the newly selected pair.

### Control-specific methods

- **`selectOption(option)`**: selects the given option and closes the list.

## sq-tags-input

A chip input: the value **is** the array of tags. Space, <kbd>Enter</kbd> or <kbd>,</kbd> commit the
current text, <kbd>Backspace</kbd> on an empty field removes the last tag.

```html
<sq-tags-input
  controlLabel="Tags"
  controlPlaceholder="Type and press Enter"
  [(value)]="tags">
</sq-tags-input>
```

```typescript
readonly tags = signal<string[]>(['tag1']);
```

With a custom tag template:

```html
<sq-tags-input [(value)]="tags">
  <ng-template sq-tag let-tag>
    <strong>#{{ tag }}</strong>
  </ng-template>
</sq-tags-input>
```

### Control-specific properties

- **`value`** (`model<string[]>`): the tags. Defaults to `[]`.
- **`newTagName`** (`string`): the text of the tag being typed (plain property, bound with
  `[(ngModel)]` internally).

### Control-specific methods

- **`onUserInput($event)`**: keyboard handler that commits/removes tags.
- **`removeTag(tag)`**: removes a tag from the value.

## sq-typeahead

An autocomplete with debounced search, single or multi selection, and two template slots.

```html
<sq-typeahead
  controlLabel="Assignee"
  controlPlaceholder="Search people…"
  [searchResults]="results()"
  displayProp="name"
  [delay]="300"
  [multiple]="true"
  [(value)]="selected"
  (onUserInputEnd)="search($event)">
</sq-typeahead>
```

```typescript
readonly results = signal<{ name: string }[]>([]);
readonly selected = signal<LabelValuePair[]>([]);
```

The component does not fetch anything: it emits the debounced query through `onUserInputEnd` and
renders whatever you put in `[searchResults]`. Strings, numbers and objects are all accepted —
`displayProp` names the object key used as the label, and without it the objects are expected to
already look like `{ label, value }` pairs.

With templates:

```html
<sq-typeahead [searchResults]="results()" [(value)]="selected">
  <ng-template sq-typeahead-option let-option>{{ option.label }}</ng-template>
  <ng-template sq-typeahead-selected-option let-option>{{ option.label }}</ng-template>
</sq-typeahead>
```

### Control-specific properties

- **`searchResults`** (`input<readonly unknown[]>`): the raw results for the current query. Defaults to
  `[]`.
- **`multiple`** (`input<boolean>`): allows more than one selected item. Defaults to `false`.
- **`delay`** (`input<number>`): debounce in milliseconds before `onUserInputEnd` fires. Defaults to
  `500`.
- **`displayProp`** (`input<string>`): object key used as the label. Empty means "the objects are
  already pairs". Defaults to `''`.
- **`hideSearchIcon`** (`input<boolean>`): hides the magnifier icon. Defaults to `false`.
- **`value`** (`model<LabelValuePair[]>`): the selection. Defaults to `[]`.

### Control-specific outputs

- **`onUserInputEnd`** (`output<string>`): the debounced query.

### Control-specific methods

- **`selectSearchResult(result)`**: selects an option.
- **`removeSearchResult(choice)`**: removes a selected chip.
- **`onSearchInput($event)`**: input handler (updates the query signal and schedules the debounce).
- **`onClickOutsideComponent()`** / **`turnClickOutsideListenerOn()`**: close the popup / arm the
  outside-click listener.

## Template directives

| Directive | Selector | Context |
|---|---|---|
| `SqCheckboxLabelTemplateDirective` | `[sq-checkbox-label]` | `let-isSelected="isSelected"` |
| `SqRadiobuttonLabelTemplateDirective` | `[sq-radio-label]` | `let-isSelected="isSelected"` |
| `SqDropdownOptionTemplateDirective` | `[sq-dropdown-option]` | `let-option` |
| `SqDropdownSelectedOptionTemplateDirective` | `[sq-dropdown-selected-option]` | `let-option` |
| `SqDropdownChevronTemplateDirective` | `[sq-dropdown-chevron]` | — |
| `SqTagTemplateDirective` | `[sq-tag]` | `let-tag` |
| `SqTypeaheadOptionTemplateDirective` | `[sq-typeahead-option]` | `let-option` |
| `SqTypeaheadSelectedOptionTemplateDirective` | `[sq-typeahead-selected-option]` | `let-option` |

## Reactive and Signal Forms

- `[(value)]` on a signal (`signal<T>`) is the simplest two-way binding and needs no form module.
- `[formField]="myForm.field"` from `@angular/forms/signals` binds the same components; the shared
  contract (`value` model, `disabled`/`required`/`pattern`, `touch`) is what makes it work.
- `[(ngModel)]` and `formControlName` are **not** supported in 3.x — the controls no longer implement
  `ControlValueAccessor`. If you are migrating a template-driven or reactive form, see *Migrating
  2.x → 3.x* in the README.
