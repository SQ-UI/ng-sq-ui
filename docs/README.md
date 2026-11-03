# Introduction

## Another UI-kit? How is it different?

You've guessed right, folks - ng-sq-ui IS yet another UI-kit.
The intention behind it is to help Angular developers with their day-to-day work
by trying to offer a solution to the most widespread use-cases they have to handle.

Without being too opinionated on looks and without containing dozen of just "fancy" features. This,
with almost no additional dependencies. How cool is that?

Even better! We support **custom templates** for form controls. This is an essential feature for all modern UI components.

## 3.x in one minute

- **Standalone only.** There are no NgModules to import; every component goes straight into the
  `imports` array of your own standalone component.
- **Signals everywhere.** Inputs are `input()`, outputs are `output()`, and the value of a form control
  is a `model()`, so `[(value)]` binds to a signal.
- **Signal Forms ready.** The same controls bind with `[formField]` from `@angular/forms/signals` — no
  adapter, no `ControlValueAccessor`.
- **Typed.** `sq-datatable`, `sq-paginator` and `sq-radiobutton` are generic over their item/value type,
  `LabelValuePair<T>` and `CustomEventDetails<T>` are generic over their payload, and the shared form
  field contract is enforced by an interface.
- **Angular 22, zoneless, Vitest 4.**

```typescript
import { Component, signal } from '@angular/core';
import { InputComponent, CheckboxComponent } from '@sq-ui/ng-sq-ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [InputComponent, CheckboxComponent],
  template: `
    <sq-input controlLabel="Name" [(value)]="name"></sq-input>
    <sq-checkbox controlLabel="Subscribe" [(value)]="subscribed"></sq-checkbox>
  `,
})
export class ExampleComponent {
  readonly name = signal('');
  readonly subscribed = signal(false);
}
```

## How do you determine the "most widespread" cases?

When we thought about what an initial version of the UI-kit should have,
we decided to simply ask other developers. We handed out a Google form
to different groups (Facebook groups and colleagues, included) and asked them what they mostly look for
when dealing with UI development. The most voted answer was "form elements",
and right after that - "modal dialogs". And these two types of components
are included in our first version of the kit.

We intend to keep the original idea of the UI-kit. We would like to ask the developers
what they need most for our next release!

> 2021: Custom templates for form controls! You are now free to design and structure the layout for them to fit your case!

> 2026: 3.x — standalone components, signal inputs/outputs, Angular Signal Forms support and a
> `Temporal`-based datetime picker.

## NEW! Bounty program

Don't hesitate to create a [feature request!](https://github.com/SQ-UI/ng-sq-ui/issues) or submit an MR request and earn [DEV tokens](https://devprotocol.xyz/)! You can check our [Bounty program](bounty-program.md) page for more information.

## Overview

You will find a description of the public API for each component. The components are grouped by packages.
Any properties you can see through code inspection that are left out from this documentation are for internal use and you should not rely on them.

Any types of public interfaces and services are also included here.

| Package | Page |
|---|---|
| `@sq-ui/ng-form-elements` | [FormElementsModule](form-elements-module.md) |
| `@sq-ui/ng-modal` | [ModalModule](modal-module.md) |
| `@sq-ui/ng-progress-bar` | [ProgressBarModule](progressbar-module.md) |
| `@sq-ui/ng-datetime-picker` | [DatetimePickerModule](datetime-picker-module.md) |
| `@sq-ui/ng-datatable` | [DatatableModule](datatable-module.md) |
| `@sq-ui/ng-sq-common` | [CommonModule](common-module.md) |
