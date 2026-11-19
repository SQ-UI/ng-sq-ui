# Tabs

> Applies to **3.x** (Angular 22). Available from `@sq-ui/ng-sq-common` and `@sq-ui/ng-sq-ui`.

Switch between related content panels with an accessible, standalone tab group.
[Open the interactive example](https://sq-ui.dev/#/embed/tabs), or find **Tabs** in the
[component playground](https://sq-ui.dev/#/preview).

<div class="docs-preview" data-demo-preview="tabs">
  <div class="docs-preview-toolbar"><span>Live preview</span><a href="https://sq-ui.dev/#/embed/tabs" target="_blank" rel="noopener">Open example ↗</a></div>
  <iframe src="https://sq-ui.dev/#/embed/tabs" title="Tabs interactive preview" loading="lazy" height="1000"></iframe>
</div>

## Basic usage

```typescript
import { Component, signal } from '@angular/core';
import { TabsComponent, TabComponent } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'app-workspace',
  imports: [TabsComponent, TabComponent],
  template: `
    <sq-tabs ariaLabel="Workspace" [(activeTab)]="active">
      <sq-tab id="overview" label="Overview">Your project overview.</sq-tab>
      <sq-tab id="activity" label="Activity" [badge]="8">Recent activity.</sq-tab>
      <sq-tab id="settings" label="Settings" disabled>Coming soon.</sq-tab>
    </sq-tabs>
  `,
})
export class WorkspaceComponent {
  readonly active = signal<string | null>('overview');
}
```

IDs must be unique within each group. Explicit stable IDs are recommended for
two-way binding and dynamic lists. Generated IDs are provided for simple static
groups. DOM IDs are prefixed with a group ID, so separate and nested groups can
reuse logical IDs. Use the existing [navbar](navbar.md) for route navigation.

## TabsComponent inputs and outputs

| Property | Type | Default | Behavior |
| --- | --- | --- | --- |
| `activeTab` | `model<string \| null>` | `null` | Selected logical ID; supports `[(activeTab)]` and `activeTabChange`. |
| `ariaLabel` | `string` | `'Tabs'` | Accessible name for the tab list. Give each group a descriptive name. |
| `ariaLabelledby` | `string \| null` | `null` | ID of a visible heading; takes precedence over `ariaLabel`. |
| `appearance` | `TabsAppearance` | `'underline'` | `'underline'`, `'pills'`, or `'enclosed'`. |
| `size` | `TabsSize` | `'m'` | `'s'`, `'m'`, or `'l'`; minimum header heights 32/40/48px. |
| `orientation` | `TabsOrientation` | `'horizontal'` | `'horizontal'` or `'vertical'`; changes layout and arrow keys. |
| `activation` | `TabsActivation` | `'automatic'` | `'automatic'` selects on header focus; `'manual'` waits for activation. |
| `direction` | `'ltr' \| 'rtl' \| null` | `null` | Explicit layout direction, or inherit from an ancestor. |
| `disabled` | `boolean` | `false` | Disables header interactions and close requests; keeps the current panel visible. |
| `stretch` | `boolean` | `false` | Headers share available space. Long lists still scroll. |
| `preserveContent` | `boolean` | `false` | Retains visited panel views while inactive. |
| `selectionChange` | `output<TabChangeEvent>` | — | Resolved selection changes, including initial selection and fallbacks. |
| `tabClose` | `output<TabCloseEvent>` | — | Requests closure. The consumer decides whether to remove the definition. |

`null`, unknown, disabled and hidden selections resolve to an enabled visible tab.
Initially this is the first enabled tab. When the selected tab is removed, hidden,
or disabled, the next surviving enabled neighbor in the previous order is selected,
falling back to a previous neighbor. Stable IDs preserve this behavior when several
tabs disappear or the remaining tabs are reordered in one update. Empty and
all-disabled groups resolve to `null`. Insertion and reordering preserve selection
by ID. Re-selecting the current tab emits no change.

```typescript
interface TabChangeEvent {
  tabId: string | null;
  previousTabId: string | null;
  index: number; // Index among visible definitions, including disabled tabs; -1 if none.
}

interface TabCloseEvent {
  tabId: string;
  index: number; // Same visible-definition indexing.
}
```

## TabComponent inputs

| Property | Type | Default | Behavior |
| --- | --- | --- | --- |
| `id` | `string` | Generated | Stable logical identifier, unique within the group. |
| `label` | `string` | `''` | Default header text. |
| `ariaLabel` | `string \| null` | `null` | Optional accessible name, useful for icon-only custom headers. |
| `icon` | `string` | `''` | Consumer-supplied icon classes; no icon font is loaded by the component. |
| `badge` | `string \| number \| null` | `null` | Optional badge; zero is displayed. |
| `disabled` | `boolean` | `false` | Excluded from selection and keyboard navigation. |
| `hidden` | `boolean` | `false` | Removes the header and panel from the visible group. |
| `closable` | `boolean` | `false` | Shows a close button and enables Delete. |
| `closeLabel` | `string \| null` | `null` | Accessible close-button name; defaults to `Close {ariaLabel or label}`. |

Boolean inputs accept both attribute syntax (`disabled`, `closable`) and property
bindings (`[disabled]="isDisabled()"`).

## Custom headers and lazy panels

Import `TabLabelDirective` for `ng-template[sq-tab-label]` and
`TabContentDirective` for `ng-template[sq-tab-content]`:

```html
<sq-tabs ariaLabel="Project" [preserveContent]="true">
  <sq-tab id="team" label="Team">
    <ng-template sq-tab-label>
      <span class="team-dot" aria-hidden="true"></span> Team <strong>Pro</strong>
    </ng-template>
    <ng-template sq-tab-content>
      <app-team-editor />
    </ng-template>
  </sq-tab>
  <sq-tab id="history" label="History">
    <ng-template sq-tab-content><app-history /></ng-template>
  </sq-tab>
</sq-tabs>
```

A custom header replaces the default text, icon and badge. Keep header templates
non-interactive because they render inside a native tab button. Supply `ariaLabel`
for icon-only content and a meaningful `label` or `closeLabel` for closable tabs.

The lazy-content template is instantiated on first selection. By default its view
is destroyed on deselection and recreated on return. `preserveContent` retains
visited views, including form values and child component state, inside hidden panels.
Inactive retained panels stay out of keyboard navigation and the accessibility tree.
Removing or hiding a tab destroys its panel view. Switching preservation off destroys
retained inactive views. Never-visited lazy panels are never instantiated.

Ordinary projected content also works. Angular constructs projected child components
eagerly; use `sq-tab-content` when initialization and destruction must follow tab
activation. If both ordinary content and a lazy template are supplied, the lazy
template is used as the panel body. Nested `sq-tabs` groups manage their own definitions,
selection and keyboard events independently.

## Dynamic and closable tabs

```typescript
import { signal } from '@angular/core';
import { type TabCloseEvent } from '@sq-ui/ng-sq-common';

readonly documents = signal([
  { id: 'draft', title: 'Draft' },
  { id: 'notes', title: 'Notes' },
]);
readonly active = signal<string | null>('draft');

closeDocument(event: TabCloseEvent): void {
  // Perform any application-specific unsaved-work check before removing the tab.
  this.documents.update(items => items.filter(item => item.id !== event.tabId));
}
```

```html
<sq-tabs ariaLabel="Documents" [(activeTab)]="active" (tabClose)="closeDocument($event)">
  @for (document of documents(); track document.id) {
    <sq-tab [id]="document.id" [label]="document.title" closable>
      <ng-template sq-tab-content><app-editor [documentId]="document.id" /></ng-template>
    </sq-tab>
  }
</sq-tabs>
```

Ignoring a close request leaves the tab open and keeps selection unchanged. Closing
a focused tab returns focus to its enabled neighbor and keeps that header visible,
including in manual activation mode. Disabling an unselected focused header also
recovers focus without changing selection in manual mode. External model changes do not
move focus away from other controls. When no enabled headers remain after removing
a focused header, focus falls back to the group container; applications may move it
to an Add tab control or another suitable destination.

## Keyboard and accessibility

The component follows the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
Each header has `role="tab"`, `aria-selected`, and `aria-controls`; panels have
`role="tabpanel"` and `aria-labelledby`. Inactive panels are hidden. One enabled
header participates in the page's Tab sequence. While focus is inside the list,
that tab stop follows the focused header independently of selection. Leaving the
list restores the selected header as the entry point, so Tab and Shift+Tab exit
without an extra header stop. Disabled groups have no header tab stops. The active
panel is focusable so textual content can be reached with the keyboard.

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Enter through the selected header, or continue through the page. |
| Left / Right | Previous/next enabled horizontal header, with wrapping; reversed in RTL. |
| Up / Down | Previous/next enabled vertical header, with wrapping. |
| Home / End | First/last enabled visible header. |
| Enter / Space | Select the focused header, including manual activation mode. |
| Delete | Request closure of a closable focused tab. |

Horizontal groups leave Up/Down available for page scrolling; vertical groups leave
Left/Right untouched. Modified shortcuts and already-consumed key events are left
alone. Close buttons are separate from tab buttons and are outside the Tab sequence;
keyboard users close a focused tab with Delete. Disabled headers and hidden tabs are
skipped. Use manual activation for expensive or asynchronously loaded panels.

## Styling and overflow

Colors, typography and focus outlines inherit the shared `--sq-color-*` and
`--sq-font-family-sans` tokens. Underline, pill and enclosed appearances work in
both orientations. Logical borders and spacing follow RTL direction. The header
list scrolls when constrained, with native touch and scrollbar support; keyboard
navigation reveals the focused header without scrolling surrounding content.

Vertical lists have a default maximum height of 360px, configurable using
`--sq-tabs-list-max-height`. The component introduces no motion and provides
selected/disabled cues in forced-colors mode. Content height follows the active
panel; arbitrary consumer content should use responsive sizing.

For browser regression checks, build the app, serve it with
`node scripts/serve-built-preview.mjs`, then run:

```sh
STYLE_BASELINE_BROWSER=/path/to/chrome node scripts/check-tabs-preview.mjs
```

`STYLE_BASELINE_URL` overrides the default `http://127.0.0.1:4201`.
