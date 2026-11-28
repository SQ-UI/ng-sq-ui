// Paths checked against the official Angular llms.txt indexes on 2026-11-28.
// These are conceptual equivalents, not compatible APIs or package dependencies.
const coreui: Record<string, string> = {
  button: 'components/button', input: 'forms/form-control', textarea: 'forms/form-control', dropdown: 'forms/select',
  typeahead: 'forms/autocomplete', 'tags-input': 'forms/chip-input', chip: 'components/chip', checkbox: 'forms/checks-radios',
  radiobutton: 'forms/checks-radios', 'form-group': 'forms/layout', slider: 'forms/range', 'range-slider': 'forms/range-slider',
  card: 'components/card', navbar: 'components/navbar', datatable: 'components/table', paginator: 'components/pagination',
  'datetime-picker': 'forms/date-picker', 'time-picker': 'forms/time-picker', 'progress-bar': 'components/progress', modal: 'components/modal', tooltip: 'components/tooltip'
};
const taiga: Record<string, string> = {
  button: 'button', input: 'input', textarea: 'textarea', dropdown: 'select', typeahead: 'combo-box', 'tags-input': 'input-chip',
  chip: 'chip', checkbox: 'checkbox', radiobutton: 'radio', 'form-group': 'group', slider: 'slider', 'range-slider': 'range',
  card: 'surface', navbar: 'navigation', datatable: 'table', paginator: 'table-pagination', 'datetime-picker': 'input-date',
  'time-picker': 'input-time', 'progress-bar': 'progress-bar', modal: 'dialog', tooltip: 'tooltip'
};
export function referenceLinks(id: string) {
  return [
    ...(coreui[id] ? [{ provider: 'CoreUI', framework: 'angular', kind: 'conceptual-equivalent', url: `https://coreui.io/angular/docs/${coreui[id]}.md` }] : []),
    ...(taiga[id] ? [{ provider: 'Taiga UI', framework: 'angular', kind: 'conceptual-equivalent', url: `https://taiga-ui.dev/components/${taiga[id]}.md` }] : [])
  ];
}
