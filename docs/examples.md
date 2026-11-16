# Examples

These examples target **3.x / Angular 22**, using standalone components and signal models.
Apply the [global styles and `.sq` wrapper](installation.md#add-styles-to-angularjson)
before using them. New repository APIs may require a package release before they are
available on npm; check your installed version.

The demo's new home is [sq-ui.dev](https://sq-ui.dev/). The
[component playground](https://sq-ui.dev/#/preview) contains real components for sizes,
disabled states, custom templates, helper/error messages and local theme overrides.
Until deployment is configured, [run the same demo locally](installation.md#running-this-repository).

## Live previews in the documentation

The form, common, table, date/time, modal, progress and [navbar](navbar.md) API pages contain embedded
Angular examples. You can edit fields, change pages, sort rows, open dialogs and
update progress without leaving the documentation. **Open example** opens the
same preview in a separate tab. Code remains available in this documentation and
the source repository; the preview is a running app rather than an in-browser editor.

The previews use the demo's `/#/embed/:example` routes, without its navigation shell.
Deploy the updated demo before publishing docs that use these routes.

To test both sites locally, serve Docsify on port 3000 and run `npm start` for the
demo on port 4200. Open
`http://localhost:3000/?demo=http://localhost:4200#/form-elements-module`.
The `demo` override is accepted only when both the docs and demo hosts are loopback
addresses. Published docs always use `https://sq-ui.dev`.

| Example family | Demo | Source |
|---|---|---|
| Inputs, buttons, dropdowns, tags and selection | [Form elements](https://sq-ui.dev/#/sq-ui) | [Form examples](https://github.com/SQ-UI/ng-sq-ui/tree/master/src/app/sq-ui/sq-ui) |
| Typography, colors, sizes and states | [Playground](https://sq-ui.dev/#/preview) | [Playground source](https://github.com/SQ-UI/ng-sq-ui/tree/master/src/app/shared/component-preview) |
| Pagination and shared components | [Common](https://sq-ui.dev/#/sq-common) | [Common examples](https://github.com/SQ-UI/ng-sq-ui/tree/master/src/app/sq-common/common) |
| Sorting, pagination and custom table rows | [Datatable](https://sq-ui.dev/#/datatable) | [Table examples](https://github.com/SQ-UI/ng-sq-ui/tree/master/src/app/datatable/datatable-docs) |
| Date, range and time selection | [Date and time](https://sq-ui.dev/#/datetime-picker) | [Date examples](https://github.com/SQ-UI/ng-sq-ui/tree/master/src/app/datetime-picker/datatime-picker-docs) |
| Dialogs | [Modal](https://sq-ui.dev/#/modal) | [Modal examples](https://github.com/SQ-UI/ng-sq-ui/tree/master/src/app/modal/modal-docs) |
| Linear, segmented and step progress | [Playground: Progress](https://sq-ui.dev/#/preview) | [Progress API](progressbar-module.md) |

## Profile form with signals

Paste this component into an Angular 22 application after installing the packages
and adding the global styles. It needs no `FormsModule`. Saving takes a snapshot;
resetting restores the initial values.

```typescript
import { Component, signal } from '@angular/core';
import { InputComponent, DropdownComponent, TagsInputComponent,
  CheckboxComponent, ButtonComponent } from '@sq-ui/ng-form-elements';
import type { LabelValuePair } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'app-profile-example',
  standalone: true,
  imports: [InputComponent, DropdownComponent, TagsInputComponent,
    CheckboxComponent, ButtonComponent],
  template: `
    <section class="sq">
      <sq-input controlLabel="Name" [(value)]="name"
                helpText="Enter the name shown on your profile."></sq-input>
      <sq-dropdown controlLabel="Country" [options]="countries"
                   [(value)]="country"></sq-dropdown>
      <sq-tags-input controlLabel="Topics" controlPlaceholder="Add a topic"
                     [(value)]="topics"></sq-tags-input>
      <sq-checkbox controlLabel="Send product updates" [(value)]="updates"></sq-checkbox>
      <sq-button [disabled]="!name().trim()" (click)="save()">Save</sq-button>
      <sq-button appearance="secondary" (click)="reset()">Reset</sq-button>
      <p role="status">{{ saved() }}</p>
    </section>
  `,
})
export class ProfileExampleComponent {
  readonly name = signal('');
  readonly country = signal<LabelValuePair<string> | null>(null);
  readonly topics = signal<string[]>(['Angular']);
  readonly updates = signal(false);
  readonly saved = signal('');
  readonly countries: LabelValuePair<string>[] = [
    { label: 'Bulgaria', value: 'bg' },
    { label: 'Germany', value: 'de' },
  ];

  save(): void {
    this.saved.set(JSON.stringify({
      name: this.name().trim(), country: this.country()?.value ?? null,
      topics: this.topics(), updates: this.updates(),
    }));
  }

  reset(): void {
    this.name.set('');
    this.country.set(null);
    this.topics.set(['Angular']);
    this.updates.set(false);
    this.saved.set('');
  }
}
```

## Local autocomplete with multiple selections

The typeahead emits a debounced query; the caller supplies the results. This example
filters a local collection. Replace `search()` with your data service when needed.

```typescript
import { Component, signal } from '@angular/core';
import { TypeaheadComponent } from '@sq-ui/ng-form-elements';
import type { LabelValuePair } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'app-assignee-example',
  standalone: true,
  imports: [TypeaheadComponent],
  template: `
    <section class="sq">
      <sq-typeahead controlLabel="Assignees" controlPlaceholder="Search people"
                    [multiple]="true" [delay]="200" [searchResults]="results()"
                    [(value)]="selected" (onUserInputEnd)="search($event)">
      </sq-typeahead>
      <p role="status">{{ selected().length }} selected</p>
    </section>
  `,
})
export class AssigneeExampleComponent {
  private readonly people: LabelValuePair<string>[] = [
    { label: 'Anna', value: 'anna' },
    { label: 'Boris', value: 'boris' },
    { label: 'Maria', value: 'maria' },
  ];
  readonly results = signal<LabelValuePair<string>[]>([...this.people]);
  readonly selected = signal<LabelValuePair[]>([]);

  search(query: string): void {
    const text = query.trim().toLowerCase();
    this.results.set(this.people.filter(person => person.label.toLowerCase().includes(text)));
  }
}
```

For `[formField]` integration, see [Signal Forms](form-elements-module.md#reactive-and-signal-forms).
Use that binding instead of a second `[(value)]` binding on the same control.
