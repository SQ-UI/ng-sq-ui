/**
 * Option/selection pair used by the dropdown-like controls (`sq-dropdown`, `sq-typeahead`).
 *
 * `TValue` defaults to `unknown` so a control can carry any payload without escaping the type
 * system. Parameterise it (`LabelValuePair<Country>`) to keep the payload typed:
 *
 * ```ts
 * selectedCountry = signal<LabelValuePair<Country> | null>(null);
 * ```
 */
export interface LabelValuePair<TValue = unknown> {
  label: string;
  value: TValue;
}
