import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal, type Signal, type Type, viewChild } from '@angular/core';
import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { ButtonComponent, CheckboxComponent, ChipComponent, DropdownComponent, FormGroupComponent, InputComponent, RadiobuttonComponent, TagsInputComponent, TextareaComponent, TypeaheadComponent } from '@sq-ui/ng-form-elements';
import { CardComponent, NavbarComponent, PaginatorComponent, RangeSliderComponent, SliderComponent, TooltipDirective, type LabelValuePair, type Size, type TooltipPosition } from '@sq-ui/ng-sq-common';
import { DatatableComponent } from '@sq-ui/ng-datatable';
import { DatetimePickerComponent, TimePickerComponent } from '@sq-ui/ng-datetime-picker';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';
import { ModalComponent } from '@sq-ui/ng-modal';
import { ComponentDemo, DemoVariant } from './component-catalog';

const components: Record<string, Type<unknown>> = {
  button: ButtonComponent, input: InputComponent, textarea: TextareaComponent, dropdown: DropdownComponent,
  'tags-input': TagsInputComponent, checkbox: CheckboxComponent, slider: SliderComponent,
  'range-slider': RangeSliderComponent, card: CardComponent, navbar: NavbarComponent,
  datatable: DatatableComponent, paginator: PaginatorComponent, 'datetime-picker': DatetimePickerComponent,
  'time-picker': TimePickerComponent, 'progress-bar': ProgressBarComponent,
};

/** Recreated for each preset so edits to one example never leak into another configuration. */
@Component({
  selector: 'sq-demo-example',
  imports: [NgComponentOutlet, RadiobuttonComponent, FormGroupComponent, CheckboxComponent, TypeaheadComponent, ChipComponent, ModalComponent, TooltipDirective],
  template: `
    @switch (demo().id) {
      @case ('radiobutton') {
        <div class="demo-choice-list">
          <sq-radiobutton name="catalogDelivery" controlLabel="Standard" radioValue="standard" [(value)]="radio" [disabled]="disabled()"></sq-radiobutton>
          <sq-radiobutton name="catalogDelivery" controlLabel="Express" radioValue="express" [(value)]="radio" [disabled]="disabled()"></sq-radiobutton>
        </div>
        <output>Value: {{radio()}}</output>
      }
      @case ('form-group') {
        <sq-form-group [groupLabel]="config().inputs['groupLabel'] + ''">
          @if (config().id === 'radios') {
            <sq-radiobutton name="catalogGroupedDelivery" controlLabel="Standard" radioValue="standard" [(value)]="radio"></sq-radiobutton>
            <sq-radiobutton name="catalogGroupedDelivery" controlLabel="Express" radioValue="express" [(value)]="radio"></sq-radiobutton>
          } @else {
            <sq-checkbox controlLabel="Email" [(value)]="email"></sq-checkbox>
            <sq-checkbox controlLabel="SMS" [(value)]="sms"></sq-checkbox>
          }
        </sq-form-group>
        <output>{{config().id === 'radios' ? 'Value: ' + radio() : 'Email: ' + email() + ' · SMS: ' + sms()}}</output>
      }
      @case ('typeahead') {
        <sq-typeahead [controlLabel]="config().inputs['controlLabel'] + ''" [controlPlaceholder]="placeholder()"
          [size]="compactSize()" [multiple]="multiple()" [disabled]="disabled()"
          [searchResults]="results()" (onUserInputEnd)="search($event)" [(value)]="selection"></sq-typeahead>
        <output>Value: {{format(selection())}}</output>
      }
      @case ('chip') {
        @if (chipVisible()) {
          <sq-chip [size]="compactSize()" [removable]="removable()" [disabled]="disabled()" [removeLabel]="removeLabel()" (removed)="chipVisible.set(false)">Design</sq-chip>
        } @else { <p>Chip removed. Use Reset example to restore it.</p> }
      }
      @case ('modal') {
        <button class="example-trigger" type="button" (click)="modal.set(true)">Open {{config().name.toLowerCase()}} dialog</button>
        <sq-modal [size]="size()" [(show)]="modal">
          <div sq-modal-title>Save your changes?</div>
          <div sq-modal-body>Your project is ready for the next step.</div>
          <div sq-modal-footer><button class="example-trigger" type="button" (click)="modal.set(false)">Close</button></div>
        </sq-modal>
        <output>{{modal() ? 'Dialog open' : 'Dialog closed'}}</output>
      }
      @case ('tooltip') {
        <button class="example-trigger" type="button" [sqTooltip]="config().inputs['sqTooltip'] + ''" [sqTooltipPosition]="tooltipPosition()">Hover or focus me</button>
      }
      @default {
        <ng-container *ngComponentOutlet="component(); inputs: config().inputs; content: content()"></ng-container>
        @if (demo().model) { <output>Value: {{currentValue()}}</output> }
      }
    }
  `,
  styles: `
    :host { display: block; width: 100%; min-width: 0; }
    output { display: block; margin-top: 24px; border-top: 1px dashed var(--demo-border); padding-top: 16px; font-family: monospace; font-size: 11px; line-height: 1.7; color: var(--demo-muted); overflow-wrap: anywhere; white-space: pre-wrap; }
    .demo-choice-list { display: grid; gap: 12px; }
    .example-trigger { padding: 10px 16px; border: 1px solid var(--demo-border); border-radius: 6px; background: white; font: inherit; font-size: 13px; cursor: pointer; }
    .example-trigger:focus-visible { outline: 2px solid var(--demo-brand); outline-offset: 4px; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoExampleComponent {
  readonly demo = input.required<ComponentDemo>();
  readonly config = input.required<DemoVariant>();
  private readonly document = inject(DOCUMENT);
  private readonly outlet = viewChild(NgComponentOutlet);
  readonly component = computed(() => components[this.demo().id]);
  readonly disabled = computed(() => this.config().inputs['disabled'] === true);
  readonly multiple = computed(() => this.config().inputs['multiple'] === true);
  readonly removable = computed(() => this.config().inputs['removable'] === true);
  readonly compactSize = computed(() => (this.config().inputs['size'] ?? (this.demo().id === 'typeahead' ? 's' : 'm')) as 's' | 'm' | 'l');
  readonly placeholder = computed(() => String(this.config().inputs['controlPlaceholder'] ?? ''));
  readonly removeLabel = computed(() => String(this.config().inputs['removeLabel'] ?? 'Remove chip'));
  readonly size = computed(() => this.config().inputs['size'] as Size);
  readonly tooltipPosition = computed(() => this.config().inputs['sqTooltipPosition'] as TooltipPosition);
  readonly content = computed(() => {
    const text = this.document.createTextNode(this.demo().content ?? '');
    return this.demo().id === 'card' ? [[], [], [text], [], []] : [[text]];
  });
  // The component is recreated when the preset changes; linkedSignal also seeds its local models from the inputs.
  readonly radio = linkedPresetValue<string>(this.config, 'standard');
  readonly selection = linkedPresetValue<LabelValuePair[]>(this.config, []);
  readonly email = signal(true);
  readonly sms = signal(false);
  readonly chipVisible = signal(true);
  readonly modal = signal(false);
  readonly results = signal<LabelValuePair[]>([]);
  readonly options: LabelValuePair[] = [{ label: 'Design', value: 'design' }, { label: 'Engineering', value: 'engineering' }, { label: 'Documentation', value: 'documentation' }];

  search(query: string): void {
    this.results.set(this.options.filter(option => option.label.toLowerCase().includes(query.toLowerCase())));
  }

  currentValue(): string {
    const instance = this.outlet()?.componentInstance as Record<string, unknown> | null;
    const model = instance?.[this.demo().model ?? 'value'];
    return this.format(typeof model === 'function' ? model() : null);
  }

  format(value: unknown): string {
    return value === undefined ? '—' : JSON.stringify(value, null, 2);
  }
}

function linkedPresetValue<T>(config: Signal<DemoVariant>, fallback: T) {
  return linkedSignal(() => (config().inputs['value'] ?? fallback) as T);
}
