# Chips

`sq-chip` is a standalone pill with projected content. Import `ChipComponent` from
`@sq-ui/ng-form-elements` or `@sq-ui/ng-sq-ui` and add it to your component's `imports`.
It works outside a form and does not require a `.sq` wrapper or an icon font.

```html
<sq-chip size="s">Design</sq-chip>
<sq-chip size="m" [removable]="true" removeLabel="Remove Angular"
         (removed)="removeTopic('Angular')">Angular</sq-chip>
<sq-chip size="l" [removable]="true" [disabled]="true">Locked</sq-chip>
```

| Input | Type | Default | Purpose |
|---|---|---|---|
| `size` | `ChipSize` (`'s' \| 'm' \| 'l'`) | `'m'` | 20, 24 or 32px height; 12, 14 or 20px text |
| `removable` | `boolean` | `false` | Shows the X button |
| `disabled` | `boolean` | `false` | Gray appearance and inactive removal button |
| `removeLabel` | `string` | `'Remove chip'` | Accessible button label; include the chip name when possible |

The `removed` output emits `void` when the X is activated with a pointer or keyboard.
The parent updates its list or visibility in response; the chip does not remove itself.
The button uses `type="button"`, so removing a chip does not submit its containing form.
When disabled, the X remains visible but cannot be activated or focused.

Chips use the shared brand, black, white, disabled and font tokens, with a black
hover/focus appearance and a visible keyboard focus outline. `--sq-chip-background`
overrides the default background. Long labels truncate within the available width.

See `/#/preview`, under Chips, for all sizes and states, examples without an X, and
a working removal example. This component is separate from `sq-tags-input` and `sq-typeahead`.
