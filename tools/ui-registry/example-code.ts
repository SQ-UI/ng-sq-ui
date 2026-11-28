import { ComponentDemo, DemoVariant } from './catalog';

/** Build code from the same inputs used by the live example. */
export function exampleCode(demo: ComponentDemo, config: DemoVariant): { setup: string; template: string } {
  const setup: string[] = [];
  const imports = [demo.exportName];
  const attributes = Object.entries(config.inputs).map(([name, value]) => {
    if (name === demo.model) return `[(${name})]="${name}"`;
    if (typeof value === 'string') return `${name}="${value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`;
    if (typeof value === 'boolean' || typeof value === 'number' || value === null) return `[${name}]="${value}"`;
    setup.push(`readonly ${name} = ${JSON.stringify(value, null, 2)};`);
    return `[${name}]="${name}"`;
  });
  if (demo.model) {
    const initial = config.inputs[demo.model] ?? (demo.model === 'show' ? false : demo.model === 'paginatedCollection' ? [] : null);
    setup.unshift(`readonly ${demo.model} = signal<${modelType(demo, initial)}>(${JSON.stringify(initial, null, 2)});`);
    if (!(demo.model in config.inputs)) attributes.push(`[(${demo.model})]="${demo.model}"`);
  }
  let template = `<${demo.selector}${attributes.length ? '\n  ' + attributes.join('\n  ') : ''}>${demo.content ?? ''}</${demo.selector}>`;

  if (demo.id === 'radiobutton' || (demo.id === 'form-group' && config.id === 'radios')) {
    if (demo.id === 'form-group') setup.push("readonly value = signal('standard');");
    const radios = ['standard', 'express'].map(option => `<sq-radiobutton name="delivery" radioValue="${option}"\n  controlLabel="${option === 'standard' ? 'Standard' : 'Express'}" [(value)]="value"${config.inputs['disabled'] ? ' [disabled]="true"' : ''}></sq-radiobutton>`).join('\n');
    template = demo.id === 'form-group' ? `<sq-form-group groupLabel="Delivery method">\n${radios}\n</sq-form-group>` : radios;
    if (demo.id === 'form-group') imports.push('RadiobuttonComponent');
  }
  if (demo.id === 'form-group' && config.id === 'checkboxes') {
    imports.push('CheckboxComponent');
    setup.push('readonly email = signal(true);', 'readonly sms = signal(false);');
    template = `<sq-form-group groupLabel="Notifications">\n  <sq-checkbox controlLabel="Email" [(value)]="email"></sq-checkbox>\n  <sq-checkbox controlLabel="SMS" [(value)]="sms"></sq-checkbox>\n</sq-form-group>`;
  }
  if (demo.id === 'typeahead') {
    imports.push('type LabelValuePair');
    setup.push('readonly searchResults = signal<LabelValuePair[]>([]);', `readonly options = ${JSON.stringify([{ label: 'Design', value: 'design' }, { label: 'Engineering', value: 'engineering' }, { label: 'Documentation', value: 'documentation' }], null, 2)};`,
      'search(query: string): void {\n  this.searchResults.set(this.options.filter(option =>\n    option.label.toLowerCase().includes(query.toLowerCase())\n  ));\n}');
    template = template.replace('></sq-typeahead>', '\n  [searchResults]="searchResults()"\n  (onUserInputEnd)="search($event)"></sq-typeahead>');
  }
  if (demo.id === 'modal') {
    template = `<button type="button" (click)="show.set(true)">Open dialog</button>\n<sq-modal size="${config.inputs['size']}" [(show)]="show">\n  <div sq-modal-title>Save your changes?</div>\n  <div sq-modal-body>Your project is ready for the next step.</div>\n  <div sq-modal-footer>\n    <button type="button" (click)="show.set(false)">Close</button>\n  </div>\n</sq-modal>`;
  }
  if (demo.id === 'chip' && config.inputs['removable']) {
    setup.push('readonly visible = signal(true);');
    template = `@if (visible()) {\n  ${template.replace('>Design', ' (removed)="visible.set(false)">Design')}\n}`;
  }
  if (demo.id === 'paginator') template += '\n<p>{{paginatedCollection().length}} visible rows</p>';
  if (demo.id === 'tooltip') template = `<button type="button" sqTooltip="${config.inputs['sqTooltip']}"\n  sqTooltipPosition="${config.inputs['sqTooltipPosition']}">Hover or focus me</button>`;

  const usesSignals = setup.some(line => line.includes('signal'));
  const extraTypes = demo.id === 'datetime-picker' ? 'DatetimePickerValue' : demo.id === 'time-picker' ? 'TimePickerValue' : null;
  if (extraTypes) imports.push(`type ${extraTypes}`);
  if (demo.id === 'dropdown') imports.push('type LabelValuePair');
  // Form controls use the shared LabelValuePair type from ng-sq-common.
  const formImports = imports.filter(name => !(demo.package === '@sq-ui/ng-form-elements' && name === 'type LabelValuePair'));
  const lines = [
    ...(usesSignals ? ["import { signal } from '@angular/core';"] : []),
    `import { ${formImports.join(', ')} } from '${demo.package}';`,
    ...(demo.package === '@sq-ui/ng-form-elements' && imports.includes('type LabelValuePair') ? ["import { type LabelValuePair } from '@sq-ui/ng-sq-common';"] : []),
    '', `// Add ${formImports.filter(name => !name.startsWith('type ')).join(', ')} to your component's imports.`,
    ...(setup.length ? ['', ...setup.map(line => line + '\n')] : []),
  ];
  return { setup: lines.join('\n').trim(), template };
}

function modelType(demo: ComponentDemo, initial: unknown): string {
  if (demo.id === 'datetime-picker') return 'DatetimePickerValue';
  if (demo.id === 'time-picker') return 'TimePickerValue';
  if (demo.id === 'dropdown') return 'LabelValuePair | null';
  if (demo.id === 'typeahead') return 'LabelValuePair[]';
  if (demo.id === 'range-slider') return 'readonly [number, number]';
  if (demo.id === 'paginator') return '{ id: number; name: string; status: string }[]';
  if (Array.isArray(initial)) return 'string[]';
  return typeof initial;
}
