import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { PaginatorComponent, type LabelValuePair, type Size } from '@sq-ui/ng-sq-common';
import { ButtonComponent, InputComponent, TextareaComponent, DropdownComponent, TagsInputComponent,
  TypeaheadComponent, CheckboxComponent, RadiobuttonComponent, FormGroupComponent,
  SqDropdownOptionTemplateDirective, SqDropdownSelectedOptionTemplateDirective,
  SqDropdownChevronTemplateDirective, SqTagTemplateDirective,
  SqTypeaheadOptionTemplateDirective, SqTypeaheadSelectedOptionTemplateDirective,
  SqCheckboxLabelTemplateDirective, SqRadiobuttonLabelTemplateDirective } from '@sq-ui/ng-form-elements';
import { DatatableComponent, DatatableHeaderDirective, DatatableBodyDirective } from '@sq-ui/ng-datatable';
import { DatetimePickerComponent, TimePickerComponent, type DatetimePickerValue } from '@sq-ui/ng-datetime-picker';
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';
import { ModalComponent } from '@sq-ui/ng-modal';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';
import { TypographyPreviewComponent } from '../typography-preview/typography-preview.component';
import { ButtonPreviewComponent } from '../button-preview/button-preview.component';
import { LinkPreviewComponent } from '../link-preview/link-preview.component';

@Component({
  selector: 'sq-component-preview',
  standalone: true,
  imports: [ButtonComponent, InputComponent, TextareaComponent, DropdownComponent, TagsInputComponent,
    TypeaheadComponent, CheckboxComponent, RadiobuttonComponent, FormGroupComponent, PaginatorComponent,
    DatatableComponent, DatetimePickerComponent, TimePickerComponent, ModalComponent, ProgressBarComponent,
    SqDropdownOptionTemplateDirective, SqDropdownSelectedOptionTemplateDirective,
    SqDropdownChevronTemplateDirective, SqTagTemplateDirective,
    SqTypeaheadOptionTemplateDirective, SqTypeaheadSelectedOptionTemplateDirective,
    SqCheckboxLabelTemplateDirective, SqRadiobuttonLabelTemplateDirective,
    DatatableHeaderDirective, DatatableBodyDirective, TypographyPreviewComponent, ButtonPreviewComponent, LinkPreviewComponent],
  templateUrl: './component-preview.component.html',
  styleUrls: ['./component-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentPreviewComponent {
  readonly paletteGroups = [
    { name: 'Main & brand', colors: [
      { name: 'Black', token: 'black', hex: '#202020' },
      { name: 'White', token: 'white', hex: '#FFFFFF' },
      { name: 'Brand', token: 'brand', hex: '#00C474' },
      { name: 'Brand Light', token: 'brand-light', hex: '#E5F9F1' },
    ] },
    { name: 'Status', colors: [
      { name: 'Critical', token: 'critical', hex: '#FF3815' },
      { name: 'OK', token: 'ok', hex: '#00D214' },
      { name: 'Warning', token: 'warning', hex: '#FFB800' },
      { name: 'Unknown / disabled', token: 'unknown', hex: '#AAAAAA' },
    ] },
    { name: 'Gray', colors: [
      { name: 'Gray 1', token: 'gray-1', hex: '#FAFAFA' },
      { name: 'Gray 2', token: 'gray-2', hex: '#EBEBEB' },
      { name: 'Gray 3', token: 'gray-3', hex: '#DCDCDC' },
      { name: 'Gray 4', token: 'gray-4', hex: '#CDCDCD' },
      { name: 'Gray 5', token: 'gray-5', hex: '#BEBEBE' },
      { name: 'Gray 6', token: 'gray-6', hex: '#AFAFAF' },
    ] },
  ];
  readonly fieldSizes = [
    { name: 'S', height: 28, lineHeight: '20px' }, { name: 'M', height: 32, lineHeight: '24px' },
    { name: 'L', height: 40, lineHeight: '32px' },
  ];
  readonly sizes: { label: string; value: Size }[] = [
    { label: 'S', value: 'small' }, { label: 'M', value: 'medium' }, { label: 'L', value: 'large' },
  ];
  readonly options: LabelValuePair[] = [
    { label: 'Design', value: 'design' }, { label: 'Development', value: 'development' },
    { label: 'Documentation', value: 'documentation' },
  ];
  readonly selected = signal<LabelValuePair | null>(null);
  readonly tags = signal(['Angular', 'Design']);
  readonly suggestions = signal<LabelValuePair[]>([]);
  readonly searchSelection = signal<LabelValuePair[]>([]);
  readonly checked = signal(true);
  readonly radio = signal('standard');
  readonly customSelected = signal<LabelValuePair | null>(null);
  readonly customTags = signal(['Design', 'Angular']);
  readonly customSuggestions = signal<LabelValuePair[]>([]);
  readonly customSearchSelection = signal<LabelValuePair[]>([]);
  readonly customChecked = signal(true);
  readonly customRadio = signal('daily');
  readonly showError = signal(false);
  readonly validatedName = signal('');
  readonly rows = [
    { name: 'Design tokens', owner: 'Ada', status: 'Ready' },
    { name: 'Form controls', owner: 'Lin', status: 'Review' },
    { name: 'Documentation', owner: 'Sam', status: 'Draft' },
    { name: 'Calendar', owner: 'Ada', status: 'Ready' },
    { name: 'Data table', owner: 'Lin', status: 'Review' },
    { name: 'Modal', owner: 'Sam', status: 'Ready' },
    { name: 'Pagination', owner: 'Ada', status: 'Ready' },
  ];
  readonly pagination = { itemsPerPage: 3, maxDisplayedPages: 3 };
  readonly visibleRows = signal<typeof this.rows>([]);
  readonly date = Temporal.PlainDate.from('2026-11-19');
  readonly minDate = Temporal.PlainDate.from('2026-11-01');
  readonly maxDate = Temporal.PlainDate.from('2026-12-31');
  readonly singleDate = signal<DatetimePickerValue>(this.date);
  readonly range = signal<DatetimePickerValue>(Array.from({ length: 5 }, (_, index) => this.minDate.add({ days: 11 + index })));
  readonly modalVisible = signal(false);
  readonly modalSize = signal<Size>('medium');
  readonly modalParagraphs = Array.from({ length: 8 }, (_, index) => `Section ${index + 1}. This dialog keeps its title and actions visible while longer content scrolls. Projected content and close interactions remain available at every size.`);

  search(query: string) {
    this.suggestions.set(this.options.filter(option => option.label.toLowerCase().includes(query.toLowerCase())));
  }

  searchCustom(query: string) {
    this.customSuggestions.set(this.options.filter(option => option.label.toLowerCase().includes(query.toLowerCase())));
  }

  openModal(size: Size) {
    this.modalSize.set(size);
    this.modalVisible.set(true);
  }
}
