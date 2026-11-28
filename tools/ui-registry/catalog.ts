/** Framework-free examples shared by the Angular demo and the MCP registry. */
export interface DemoVariant {
  id: string;
  name: string;
  description: string;
  inputs: Record<string, unknown>;
}

export interface ComponentDemo {
  id: string;
  name: string;
  selector: string;
  exportName: string;
  package: string;
  category: string;
  icon: string;
  description: string;
  section: string;
  content?: string;
  model?: string;
  variants: DemoVariant[];
}

export const demoCategories = ['Forms & selection', 'Layout & navigation', 'Data display', 'Date & time', 'Feedback & overlays'];

const forms = '@sq-ui/ng-form-elements';
const common = '@sq-ui/ng-sq-common';
const datetime = '@sq-ui/ng-datetime-picker';
const options = [
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Documentation', value: 'documentation' },
];
const items = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1, name: `Project ${index + 1}`, status: index % 2 ? 'In progress' : 'Ready',
}));
const variant = (id: string, name: string, description: string, inputs: Record<string, unknown>): DemoVariant => ({ id, name, description, inputs });
const sizes = (base: Record<string, unknown>, compact = false) => (compact ? ['s', 'm', 'l'] : ['small', 'medium', 'large']).map((size, index) =>
  variant(size, ['Small', 'Medium', 'Large'][index], `The ${size} size, with the same content and behavior.`, { ...base, size }));
const states = (base: Record<string, unknown>) => [
  variant('default', 'Default', 'An editable control with a helpful description.', { ...base, helpText: 'Choose the value that works for you.' }),
  variant('error', 'Error', 'Caller-supplied error text replaces the helper and marks the control invalid.', { ...base, errorText: 'Please check this value.' }),
  variant('disabled', 'Disabled', 'A disabled control prevents editing and selection.', { ...base, disabled: true }),
];

export const componentDemos: ComponentDemo[] = [
  {
    id: 'button', name: 'Button', selector: 'sq-button', exportName: 'ButtonComponent', package: forms,
    category: demoCategories[0], icon: 'fa-arrow-pointer', section: 'previewButtons', content: 'Save changes',
    description: 'Actions with three appearances, four semantic tones and four sizes.',
    variants: [
      ...['primary', 'secondary', 'neutral'].map(appearance => variant(appearance, appearance[0].toUpperCase() + appearance.slice(1), `Use the ${appearance} appearance to set the emphasis of an action.`, { appearance, size: 'm' })),
      ...['ok', 'warning', 'critical'].map(tone => variant(tone, tone[0].toUpperCase() + tone.slice(1), `The ${tone} tone communicates the intent of an action.`, { tone, size: 'm' })),
      ...sizes({}, true),
      variant('xl', 'Extra large', 'An extra large action for more prominent placements.', { size: 'xl' }),
      variant('disabled', 'Disabled', 'An unavailable action cannot be clicked.', { disabled: true }),
    ],
  },
  {
    id: 'input', name: 'Input', selector: 'sq-input', exportName: 'InputComponent', package: forms,
    category: demoCategories[0], icon: 'fa-i-cursor', section: 'previewFields', model: 'value',
    description: 'Text, email and password fields with labels, helper text and errors.',
    variants: [
      ...states({ controlLabel: 'Display name', controlPlaceholder: 'Your name', value: 'Alex' }),
      variant('email', 'Email', 'Use a native email input with a visible label.', { type: 'email', controlLabel: 'Email address', value: 'alex@example.com' }),
      variant('password', 'Password', 'Mask the entered text using the native password type.', { type: 'password', controlLabel: 'Password', value: 'secret123' }),
      variant('required', 'Required', 'The required input sets the native validation attribute. The caller controls error messages.', { controlLabel: 'Project name', required: true, value: '' }),
    ],
  },
  {
    id: 'textarea', name: 'Textarea', selector: 'sq-textarea', exportName: 'TextareaComponent', package: forms,
    category: demoCategories[0], icon: 'fa-align-left', section: 'previewFields', model: 'value',
    description: 'An auto-growing multiline editor that preserves line breaks.',
    variants: [...states({ controlLabel: 'Notes', controlPlaceholder: 'Write a note', value: 'A little room for your ideas.' }),
      variant('tall', 'Custom height', 'Set minHeight in pixels for longer notes.', { controlLabel: 'Project brief', minHeight: 180, value: 'Start with the problem.\nDescribe the outcome.' })],
  },
  {
    id: 'dropdown', name: 'Dropdown', selector: 'sq-dropdown', exportName: 'DropdownComponent', package: forms,
    category: demoCategories[0], icon: 'fa-caret-down', section: 'previewDropdowns', model: 'value',
    description: 'Select one option with keyboard navigation, size variants and disabled options.',
    variants: [...sizes({ controlLabel: 'Team', controlPlaceholder: 'Choose a team', options, value: null }, true),
      variant('selected', 'Preselected', 'Initialize the value with one of the label/value pairs.', { controlLabel: 'Team', options, value: options[0] }),
      variant('disabled-option', 'Disabled option', 'An individual option can be visible but unavailable.', { controlLabel: 'Team', options: options.map((option, index) => ({ ...option, disabled: index === 1 })), value: null }),
      ...states({ controlLabel: 'Team', options, value: null }).slice(1)],
  },
  {
    id: 'typeahead', name: 'Typeahead', selector: 'sq-typeahead', exportName: 'TypeaheadComponent', package: forms,
    category: demoCategories[0], icon: 'fa-magnifying-glass', section: 'previewMultiselect', model: 'value',
    description: 'Search local suggestions and choose a single result or multiple results.',
    variants: [
      variant('single', 'Single selection', 'Type to filter a deterministic local list. No external API is needed.', { controlLabel: 'Find a team', controlPlaceholder: 'Type Design', multiple: false, value: [] }),
      variant('multiple', 'Multiple selection', 'Select several results and remove them individually.', { controlLabel: 'Teams', multiple: true, value: [options[0]] }),
      ...sizes({ controlLabel: 'Find a team', multiple: true, value: [] }, true),
      variant('disabled', 'Disabled', 'Display a selected result without allowing edits.', { controlLabel: 'Team', disabled: true, value: [options[0]] }),
    ],
  },
  {
    id: 'tags-input', name: 'Tags input', selector: 'sq-tags-input', exportName: 'TagsInputComponent', package: forms,
    category: demoCategories[0], icon: 'fa-tags', section: 'previewTags', model: 'value',
    description: 'Create free-text tags with Enter and remove existing tags.',
    variants: [...sizes({ controlLabel: 'Topics', controlPlaceholder: 'Type a topic and press Enter', value: ['Angular', 'Design'] }, true),
      ...states({ controlLabel: 'Topics', value: ['Angular', 'Design'] }).slice(1)],
  },
  {
    id: 'chip', name: 'Chip', selector: 'sq-chip', exportName: 'ChipComponent', package: forms,
    category: demoCategories[0], icon: 'fa-tag', section: 'previewChips', content: 'Design',
    description: 'Compact labels with optional removal, disabled state and three sizes.',
    variants: [...sizes({}, true), variant('removable', 'Removable', 'The remove action emits removed; the caller decides how to update the collection.', { removable: true, removeLabel: 'Remove Design' }),
      variant('disabled', 'Disabled', 'The remove action is unavailable on a disabled chip.', { removable: true, disabled: true })],
  },
  {
    id: 'checkbox', name: 'Checkbox', selector: 'sq-checkbox', exportName: 'CheckboxComponent', package: forms,
    category: demoCategories[0], icon: 'fa-square-check', section: 'previewFields', model: 'value',
    description: 'A labelled boolean control for independent choices.',
    variants: [variant('unchecked', 'Unchecked', 'Toggle the checkbox to update the boolean value.', { controlLabel: 'Send product updates', value: false }),
      variant('checked', 'Checked', 'Initialize a checkbox with a true value.', { controlLabel: 'Send product updates', value: true }),
      variant('disabled', 'Disabled', 'A disabled checkbox preserves its selected state.', { controlLabel: 'Send product updates', value: true, disabled: true })],
  },
  {
    id: 'radiobutton', name: 'Radio button', selector: 'sq-radiobutton', exportName: 'RadiobuttonComponent', package: forms,
    category: demoCategories[0], icon: 'fa-circle-dot', section: 'previewFields', model: 'value',
    description: 'Mutually exclusive choices sharing the same name and value signal.',
    variants: [variant('default', 'Radio group', 'Choose a delivery method. Both controls share a value signal.', { value: 'standard' }),
      variant('selected', 'Preselected', 'Start with the express option selected.', { value: 'express' }),
      variant('disabled', 'Disabled', 'Disable every option in the group.', { value: 'standard', disabled: true })],
  },
  {
    id: 'form-group', name: 'Form group', selector: 'sq-form-group', exportName: 'FormGroupComponent', package: forms,
    category: demoCategories[0], icon: 'fa-list-check', section: 'previewFields',
    description: 'A shared visual label and container for related form controls.',
    variants: [variant('checkboxes', 'Checkbox group', 'Place independent choices under a shared heading.', { groupLabel: 'Notifications' }),
      variant('radios', 'Radio group', 'Group a set of mutually exclusive delivery options.', { groupLabel: 'Delivery method' })],
  },
  ...[
    { id: 'slider', name: 'Slider', selector: 'sq-slider', exportName: 'SliderComponent', value: 40, icon: 'fa-sliders' },
    { id: 'range-slider', name: 'Range slider', selector: 'sq-range-slider', exportName: 'RangeSliderComponent', value: [20, 70], icon: 'fa-arrows-left-right' },
  ].map(demo => ({ ...demo, package: common, category: demoCategories[0], section: 'previewSliders', model: 'value',
    description: demo.id === 'slider' ? 'Choose a numeric value with steps, ticks and keyboard support.' : 'Choose lower and upper bounds with two independent handles.',
    variants: [...sizes({ controlLabel: demo.name, value: demo.value }),
      variant('ticks', 'Steps & ticks', 'Snap to increments of ten and show the available steps.', { controlLabel: demo.name, value: demo.value, step: 10, showTicks: true }),
      variant('disabled', 'Disabled', 'Keep the current value while preventing changes.', { controlLabel: demo.name, value: demo.value, disabled: true })],
  })),
  {
    id: 'card', name: 'Card', selector: 'sq-card', exportName: 'CardComponent', package: common,
    category: demoCategories[1], icon: 'fa-window-restore', section: 'previewCards', content: 'Group related information in a consistent surface.',
    description: 'Content surfaces with outlined, elevated and filled appearances.',
    variants: ['outlined', 'elevated', 'filled'].map(appearance => variant(appearance, appearance[0].toUpperCase() + appearance.slice(1), `A card with the ${appearance} appearance. Header, media, actions and footer slots accept projected content.`, { appearance, title: 'Project overview', subtitle: 'Everything in one place' })),
  },
  {
    id: 'navbar', name: 'Navbar', selector: 'sq-navbar', exportName: 'NavbarComponent', package: common,
    category: demoCategories[1], icon: 'fa-bars', section: 'previewNavbar',
    description: 'Responsive navigation with active links and a collapsible mobile menu.',
    variants: [variant('links', 'Navigation links', 'Follow local component links. The menu collapses on narrow screens.', { brand: 'Workspace', brandHref: '#/components', items: [{ id: 'components', label: 'Components', href: '#/components', active: true }, { id: 'playground', label: 'Playground', href: '#/preview' }] }),
      variant('disabled', 'Disabled item', 'Show a navigation item that is not available yet.', { brand: 'Workspace', brandHref: '#/components', items: [{ id: 'components', label: 'Components', href: '#/components', active: true }, { id: 'soon', label: 'Coming soon', disabled: true }] })],
  },
  {
    id: 'datatable', name: 'Data table', selector: 'sq-datatable', exportName: 'DatatableComponent', package: '@sq-ui/ng-datatable',
    category: demoCategories[2], icon: 'fa-table', section: 'previewTables',
    description: 'Automatic columns, sortable headings, pagination and empty states.',
    variants: [...sizes({ items, sortByAllColumns: true, paginatorConfig: { itemsPerPage: 4, maxDisplayedPages: 3 } }),
      variant('unpaginated', 'All rows', 'Render a small dataset without pagination.', { items: items.slice(0, 5), sortByAllColumns: true }),
      variant('empty', 'Empty state', 'Use emptyText to explain why no rows are shown.', { items: [], emptyText: 'No projects found. Create your first project to get started.' })],
  },
  {
    id: 'paginator', name: 'Paginator', selector: 'sq-paginator', exportName: 'PaginatorComponent', package: common,
    category: demoCategories[2], icon: 'fa-ellipsis', section: 'previewPagination', model: 'paginatedCollection',
    description: 'Page a local collection and inspect the visible rows.',
    variants: [...sizes({ items, itemsPerPage: 4, maxDisplayedPages: 3 }),
      variant('wide', 'More page links', 'Show a wider page window with two items per page.', { items, itemsPerPage: 2, maxDisplayedPages: 5 })],
  },
  {
    id: 'datetime-picker', name: 'Date picker', selector: 'sq-datetime-picker', exportName: 'DatetimePickerComponent', package: datetime,
    category: demoCategories[3], icon: 'fa-calendar-days', section: 'previewCalendar', model: 'value',
    description: 'Single dates, date ranges, locale selection and an optional time picker.',
    variants: [variant('single', 'Single date', 'Pick a date. The default output is a Temporal.PlainDate.', { controlLabel: 'Start date', value: null }),
      variant('range', 'Date range', 'Click a start and end date. The value contains the selected dates.', { controlLabel: 'Travel dates', isMultipleSelect: true, value: [] }),
      variant('with-time', 'Date & time', 'Enable the embedded time picker.', { controlLabel: 'Appointment', isTimepickerEnabled: true, value: null }),
      variant('locale', 'Bulgarian locale', 'Localize the calendar with the bg locale.', { controlLabel: 'Дата', locale: 'bg', value: null }),
      variant('disabled', 'Disabled', 'Show an unavailable calendar.', { controlLabel: 'Start date', disabled: true, value: null })],
  },
  {
    id: 'time-picker', name: 'Time picker', selector: 'sq-time-picker', exportName: 'TimePickerComponent', package: datetime,
    category: demoCategories[3], icon: 'fa-clock', section: 'previewCalendar', model: 'value',
    description: '24-hour or AM/PM time with editable fields and configurable increments.',
    variants: [variant('24-hour', '24-hour', 'Edit the time directly or use the spinner buttons.', { hours: 14, minutes: 30 }),
      variant('am-pm', 'AM / PM', 'Switch between morning and afternoon in 12-hour format.', { hours: 14, minutes: 30, isMeridiem: true }),
      variant('steps', '15-minute steps', 'Use the spinners to move in fifteen-minute increments.', { hours: 14, minutes: 30, minuteStep: 15, isEditable: false }),
      variant('disabled', 'Disabled', 'Prevent changes to the displayed time.', { hours: 14, minutes: 30, disabled: true })],
  },
  {
    id: 'progress-bar', name: 'Progress bar', selector: 'sq-progress-bar', exportName: 'ProgressBarComponent', package: '@sq-ui/ng-progress-bar',
    category: demoCategories[4], icon: 'fa-bars-progress', section: 'previewProgress',
    description: 'Continuous, segmented, step-based and indeterminate progress.',
    variants: [...sizes({ loaded: 60, label: 'Project setup' }),
      variant('segmented', 'Segmented', 'Divide the track into four segments.', { loaded: 50, variant: 'segmented', segments: 4, label: 'Upload progress' }),
      variant('steps', 'Labeled steps', 'Name each step and identify the current zero-based step.', { variant: 'steps', steps: ['Start', 'Review', 'Done'], currentStep: 1, label: 'Setup steps' }),
      variant('infinite', 'Indeterminate', 'Animate the track while the completion percentage is unknown.', { infinite: true, label: 'Loading projects' })],
  },
  {
    id: 'modal', name: 'Modal', selector: 'sq-modal', exportName: 'ModalComponent', package: '@sq-ui/ng-modal',
    category: demoCategories[4], icon: 'fa-window-maximize', section: 'previewModals', model: 'show',
    description: 'Dialogs with projected title, body and footer content in three sizes.',
    variants: sizes({}),
  },
  {
    id: 'tooltip', name: 'Tooltip', selector: '[sqTooltip]', exportName: 'TooltipDirective', package: common,
    category: demoCategories[4], icon: 'fa-comment', section: 'previewTooltips',
    description: 'Contextual hints on pointer hover and keyboard focus. An attribute directive.',
    variants: ['top', 'bottom', 'left', 'right'].map(position => variant(position, position[0].toUpperCase() + position.slice(1), `Hover or focus the button to show a tooltip on the ${position}.`, { sqTooltip: 'Helpful context for this action', sqTooltipPosition: position })),
  },
];

export const demoVariantCount = componentDemos.reduce((count, demo) => count + demo.variants.length, 0);

/** Search terms include configuration names, selectors and the package, not just the title. */
export function matchesDemo(demo: ComponentDemo, query: string, category: string): boolean {
  const text = [demo.name, demo.selector, demo.description, demo.package, ...demo.variants.flatMap(config => [config.name, config.description])].join(' ').toLowerCase();
  return (!category || demo.category === category) && query.toLowerCase().trim().split(/\s+/).every(term => text.includes(term));
}
