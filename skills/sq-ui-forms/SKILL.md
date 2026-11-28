---
name: sq-ui-forms
description: Build typed ng-sq-ui forms with signal models, Signal Forms and validation feedback.
---

Read exact control APIs. Use `[(value)]` with writable signals, or `[formField]` from `@angular/forms/signals` for controls implementing the Signal Forms contract. Modern SQ controls do not provide the old formControlName/ngModel integration.

Define typed models, required/email/pattern rules and a submit flow. The pattern contract is `readonly RegExp[]`. Check whether a control models an option object, an array, a boolean or a date before binding it.

Associate labels and error text with the fields. Preserve values after an invalid submit, show success after a valid save and make cancellation leave data unchanged. Test model-to-view, view-to-model, touched, required, disabled and error recovery.
