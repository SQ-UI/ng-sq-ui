# Phase 3: buttons and form controls

Implemented on 2026-11-03. **Partially complete:** the verified M buttons and small-field foundation are implemented and tested. Figma still returns the Starter-plan MCP quota error. Remaining sizes, secondary/status appearances, complete checkbox/radio styling, and exact dropdown/chip/loading designs must be read before completing the phase. Figma was not edited.

## Implemented reference styles

| Component | Source | Result |
| --- | --- | --- |
| Primary M button | Detailed context `31:44` from the initial inspection | 32px height, 14px/24px medium text, 4px/16px padding, 4px corners, brand background and white text |
| Neutral M button | [Tech M context](references/button-detail.txt), node `31:33` | Same typography/geometry with `#FAFAFA` background and `#202020` text. This is the verified Tech neutral style, not a claim about the unread secondary variant. |
| Small text field | [Tech field/title/error context](references/field-detail.txt), node `69:850` | 12px/20px text, complete neutral outline, 4px corners, 4px/8px padding, label above the field, 10px/16px error text |
| Textarea | Shared-field adaptation | Same frame and label/message styles around the existing multiline contenteditable; minHeight and line-break handling retained |
| Dropdown, tags, typeahead | Shared-field adaptation | Same small-field frame and labels, optional help/error text, responsive input widths; existing menus/chips/loading appearance retained pending their dedicated references |
| Form group | Shared-label adaptation | Plain labelled container around projected controls rather than styling the whole group as a text input |

The field uses an inset 1px stroke instead of a layout-consuming CSS border. This matches Figma's inside stroke: 20px text + 8px vertical padding = a 28px control. A 20px label plus the field and a 16px message produces the verified 64px example. The stroke's runtime override is `--sq-color-border`; `borderLeftColor` is no longer a useful measure of this visual outline.

The library still inherits the consumer font. The demo loads IBM Plex Sans. Sample text width can vary slightly with font versions; no fixed button width is imposed on arbitrary projected content.

## New optional inputs

```html
<!-- Default appearance is primary; the existing type remains the native button type. -->
<sq-button type="submit">Save</sq-button>
<sq-button appearance="neutral">Cancel</sq-button>

<sq-input controlLabel="Name"
          helpText="Use your full name"
          [errorText]="nameError()"
          [formField]="profileForm.name"></sq-input>
```

- `ButtonAppearance` is exported from the form package and umbrella package as `'primary' | 'neutral'`. `appearance` defaults to `'primary'`. Current geometry is M; there is no unsupported size or status API.
- `helpText` and `errorText` are optional strings, defaulting to `''`, on input, textarea, dropdown, tags input, and typeahead. They are presentation inputs, not additions to the nine-control shared Signal Forms contract.
- Nonempty `errorText` takes precedence over `helpText`, renders a message with `role="alert"`, and sets `aria-invalid="true"` on the control. `aria-describedby` points to the rendered message. Clearing the error restores the helper; clearing both removes the message and description link.
- Validation presentation is caller-controlled. The controls do not guess a success state or automatically translate Signal Forms/native validation errors into a message.

Labels retain their native `for`/id or ARIA relationship after moving above the frame. Dropdown label clicks still focus/open the trigger and are ignored when disabled. Dropdown keyboard navigation, outside closing, typeahead debouncing, tag separators/removal, model writes, touch, and all projected-template contexts are retained. Native button submission, disabled behavior, and unknown-type fallback are covered by tests.

## Examples and compatibility

The original M-button/small-field examples have been expanded into a shared gallery at `/#/preview`, also embedded at the end of `/#/sq-ui`. It includes button S/M/L/XL heights and field S/M/L heights alongside the Phase 4 components. These additional sizes use the verified base typography with metadata-derived geometry; they do not establish the unread Figma variants. See the [expanded preview report](phase-4-components.md). Existing custom dropdown, tags, typeahead, checkbox and radio examples remain in their original sections.

The default button now uses the primary M appearance. Existing buttons become shorter and stop uppercasing projected text. The `.inner` projection wrapper remains, but no longer owns padding or a separate hover-fill area. Hover/disabled state-specific Figma variants remain unverified; disabled controls retain the transitional palette and keyboard focus retains the Phase 2 accessibility outline.

Field labels now sit outside `.input-field`, under `.sq-form-field`. Consumer CSS that selects `.input-field .label` should target `.sq-form-field > .sq-field-label` instead. Existing custom projected templates and their context objects are unchanged. The old large mobile label offsets were removed in favor of the shared compact field, with wrapping and flexible input widths. Existing chip/menu styles and scroll limits are preserved.

## Verification

- All seven library builds passed in dependency order. The initial form-only build found that `dist/ng-sq-common` was absent; rebuilding the dependencies resolved it without changing compiler configuration.
- Production application build passed.
- 37 Vitest files / 187 tests passed with two workers in approximately 49 seconds. This includes Signal Forms integration, five accessible-message recovery scenarios, button submission/disabled behavior, and dropdown label-click behavior.
- ESLint over `src` and all libraries, TypeScript no-emit, package exports, and eight isolated-consumer Sass imports passed.
- Browser assertions passed at 1440x1000 and 390x1000: reference dimensions/type/colors/radii, disabled input, linked error, inherited CSS overrides, scoped styles, and focus-visible.
- Real browser interactions passed for dropdown arrow/Enter selection, custom dropdown option/selected templates, a custom tag's remove callback, and typeahead search/select/remove through custom templates.
- [38 screenshots](phase-3/screenshots/README.md) and [measured styles/assertions](phase-3/screenshots/manifest.json) are separate from Phases 1 and 2. Representative desktop/mobile reference, dropdown, typeahead, and focus images were inspected. No uncaught runtime exceptions were recorded. Phase 4 routes are excluded from this capture.

The capture resets the page between viewport runs so selected values do not carry into the second run. It waits for Angular to render after events and selects custom options through their option roles rather than assuming default template classes.

To reproduce, run the demo on port 4201, then run `node scripts/capture-style-baseline.mjs` with `STYLE_BASELINE_URL=http://127.0.0.1:4201`, `STYLE_BASELINE_OUTPUT=docs/style-migration/phase-3/screenshots`, `STYLE_VERIFY_FOUNDATIONS=1`, and `STYLE_PHASE3=1`.

## Work still pending

- Read and implement S/L/XL button specifications and actual secondary, status, hover, and disabled variants.
- Read final Input sizes and active/text/error/success variants. The verified Tech field does not establish every final Input state.
- Read checkbox/radio sizes, selected/disabled states and assets. Their existing geometry and native hit targets remain; no new check/radio icon was invented.
- Read complete Dropdown, Tags and Chips specs. Current menus, option highlights, scrollbar limits, chip appearance, and loading styles retain their earlier values while using the adapted field shell.
- Compare all remaining states with their detailed Figma references, and extend examples/visual checks. The missing quota-dependent work prevents claiming full Phase 3 or full Figma fidelity.
