import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, signal, contentChild, output, effect, untracked, TemplateRef, viewChild, ElementRef, afterRenderEffect,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, tap } from 'rxjs/operators';
import { Subject, timer } from 'rxjs';

import { LabelValuePair, FORM_FIELD_DEFAULTS, generateFormFieldId, OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';
import { SqTypeaheadOptionTemplateDirective, SqTypeaheadSelectedOptionTemplateDirective } from './typeahead.template.directive';
import type { SqFormFieldSignals, SqFormValueControl } from '@sq-ui/ng-sq-common';

export type TypeaheadSize = 's' | 'm' | 'l';
export interface TypeaheadOption<TValue = unknown> extends LabelValuePair<TValue> {
  disabled?: boolean;
}

@Component({
  selector: 'sq-typeahead',
  standalone: true,
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    OutsideClickListenerDirective,
  ],
})
export class TypeaheadComponent implements SqFormFieldSignals, SqFormValueControl<LabelValuePair[]> {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>(FORM_FIELD_DEFAULTS.controlLabel);
  readonly controlPlaceholder = input<string>(FORM_FIELD_DEFAULTS.controlPlaceholder);
  readonly required = input<boolean>(FORM_FIELD_DEFAULTS.required);
  readonly pattern = input<readonly RegExp[]>(FORM_FIELD_DEFAULTS.pattern);
  readonly disabled = input<boolean>(FORM_FIELD_DEFAULTS.disabled);
  readonly helpText = input<string>('');
  readonly errorText = input<string>('');

  /** Signals that the user left the control, so `[formField]` can mark the field as touched. */
  readonly touch = output<void>();

  // Component-specific inputs
  /**
   * Results for the last `(onUserInputEnd)` query. Pass a **new array** for every search (even an
   * empty one): the loader is cleared when this input changes, and re-binding the same array
   * instance is not a change.
   */
  readonly searchResults = input<readonly unknown[]>([]);
  readonly multiple = input<boolean>(false);
  readonly size = input<TypeaheadSize>('s');
  readonly delay = input<number>(500);
  readonly displayProp = input<string>('');
  readonly hideSearchIcon = input<boolean>(false);

  // Two-way binding for selected items
  readonly value = model<LabelValuePair[]>([]);

  // Component-specific output
  readonly onUserInputEnd = output<string>();

  // Content children for custom templates
  readonly optionTemplate = contentChild(SqTypeaheadOptionTemplateDirective, { read: TemplateRef });
  readonly selectedOptionTemplate = contentChild(SqTypeaheadSelectedOptionTemplateDirective, { read: TemplateRef });

  // Internal state signals
  readonly selectedItems = signal<LabelValuePair[]>([]);
  readonly options = signal<TypeaheadOption[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly listenForOutsideClick = signal<boolean>(false);
  readonly hideResults = signal<boolean>(true);
  readonly searchText = signal<string>('');
  readonly activeIndex = signal(-1);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly optionsList = viewChild<ElementRef<HTMLElement>>('optionsList');

  // Debounced search via RxJS Subject
  private searchSubject = new Subject<string>();

  constructor() {
    afterRenderEffect(() => {
      const index = this.activeIndex();
      const list = this.optionsList()?.nativeElement;
      const option = list?.children.item(index) as HTMLElement | null | undefined;
      if (this.hideResults() || !list || !option) return;
      if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
      }
    });
    // Set up debounced search pipeline. `debounce` with a duration selector re-reads `[delay]`
    // on every keystroke, so the input can change after construction.
    this.searchSubject.pipe(
      tap(() => {
        this.isLoading.set(true);
        this.hideResults.set(true);
      }),
      debounce(() => timer(this.delay())),
      takeUntilDestroyed(),
    ).subscribe((query: string) => {
      // An empty query is not searched by the parent, so nothing would ever clear the loader.
      if (query.trim() === '') {
        this.isLoading.set(false);
        this.hideResults.set(true);
      }

      this.onUserInputEnd.emit(query);
    });

    // Keep the internal chip list in sync with programmatic writes to `[(value)]`.
    effect(() => {
      const incoming = this.value() ?? [];
      const current = untracked(() => this.selectedItems());
      if (!this.areSameItems(incoming, current)) {
        untracked(() => this.selectedItems.set([...incoming]));
      }
    });

    let searchResultsInitialized = false;
    effect(() => {
      const results = this.searchResults();
      if (!searchResultsInitialized) {
        searchResultsInitialized = true;
        return;
      }
      if (results) {
        const parsedResults = untracked(() => this.transformToLabelValuePairList(results));
        this.options.set(parsedResults);
        this.isLoading.set(false);
        this.hideResults.set(results.length > 0 ? false : true);
        this.activeIndex.set(-1);
      }
    });
  }

  onSearchInput(event: Event) {
    if (this.disabled()) return;
    const text = (event.target as HTMLInputElement).value || '';
    this.searchText.set(text);
    this.activeIndex.set(-1);
    this.searchSubject.next(text);
  }

  selectSearchResult(result: TypeaheadOption) {
    if (this.disabled() || result.disabled) return;
    if (this.multiple() && this.isOptionSelected(result)) {
      this.removeSearchResult(result);
      return;
    }
    this.selectItem(result);
  }

  isOptionSelected(result: LabelValuePair): boolean {
    return this.selectedItems().some(item => Object.is(item.value, result.value));
  }

  onFieldClick(event: MouseEvent) {
    if (!this.multiple() || this.disabled() || (event.target as HTMLElement).closest('button')) return;
    this.searchInput()?.nativeElement.focus();
    if (this.hideResults()) this.openResults();
  }

  toggleResults() {
    if (this.disabled()) return;
    this.searchInput()?.nativeElement.focus();
    if (this.hideResults()) this.openResults();
    else this.closeResults();
  }

  onKeydown(event: KeyboardEvent) {
    if (this.disabled()) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.hideResults()) this.openResults();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const from = this.activeIndex() < 0 && direction < 0 ? this.options().length : this.activeIndex();
      for (let index = from + direction; index >= 0 && index < this.options().length; index += direction) {
        if (!this.options()[index].disabled) { this.activeIndex.set(index); break; }
      }
    } else if (event.key === 'Enter' && !this.hideResults() && this.activeIndex() >= 0) {
      event.preventDefault();
      const option = this.options()[this.activeIndex()];
      if (option) this.selectSearchResult(option);
    } else if (event.key === 'Escape') {
      if (!this.hideResults()) event.preventDefault();
      this.closeResults();
    } else if (event.key === 'Tab') this.closeResults();
  }

  private openResults() {
    const options = this.transformToLabelValuePairList(this.searchResults());
    this.options.set(options);
    this.activeIndex.set(-1);
    this.listenForOutsideClick.set(true);
    if (options.length) this.hideResults.set(false);
    else this.searchSubject.next(this.searchText());
  }

  private closeResults() {
    this.hideResults.set(true);
    this.activeIndex.set(-1);
  }

  removeSearchResult = (choice: LabelValuePair) => {
    if (this.disabled()) return;
    const items = this.selectedItems();
    const itemIndex = items.findIndex(item => item === choice || Object.is(item.value, choice.value));

    if (itemIndex < 0 || itemIndex >= items.length) {
      return;
    }

    this.selectedItems.update(list => list.filter((_, i) => i !== itemIndex));

    if (this.selectedItems().length > 0) {
      this.copyResults();
    } else {
      this.value.set([]);
    }
  }

  onClickOutsideComponent() {
    this.options.set([]);
    this.listenForOutsideClick.set(false);
    this.closeResults();
  }

  turnClickOutsideListenerOn() {
    // Only arms the outside-click listener: clearing `value` here used to wipe the bound model
    // every time the input received focus.
    if (!this.disabled()) this.listenForOutsideClick.set(true);
  }

  showInput(): boolean {
    const isMulti = this.multiple();
    const itemCount = this.selectedItems().length;
    return isMulti || itemCount === 0;
  }

  private selectItem(result: LabelValuePair, copyResults: boolean = true) {
    this.searchText.set('');

    if (!this.multiple() && this.selectedItems().length === 1) {
      return;
    }

    const items = this.selectedItems();
    if (!items.some(item => Object.is(item.value, result.value))) {
      this.selectedItems.update(list => [...list, result]);
    }

    if (copyResults) {
      this.copyResults();
    }

    if (!this.multiple()) {
      this.hideResults.set(true);
    }
  }

  private copyResults() {
    this.value.set([...this.selectedItems()]);
  }

  private areSameItems(left: LabelValuePair[], right: LabelValuePair[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => item === right[index]);
  }

  /**
   * Maps the raw `[searchResults]` to the pair the component renders.
   *
   * `resultsList` is deliberately `readonly unknown[]`: the control accepts whatever the caller's
   * search returns (strings, numbers, arbitrary objects). `displayProp` names the object key used as
   * the label; without it the objects are expected to already look like `{ label, value }` pairs.
   */
  private transformToLabelValuePairList(resultsList: readonly unknown[]): TypeaheadOption[] {
    const dp = this.displayProp();

    return resultsList.map(item => {
      if (typeof item === 'object') {
        const record = (item ?? {}) as Record<string, unknown>;

        if (dp === '') {
          // The results already look like `{ label, value }` pairs, but the object is kept whole so
          // custom option templates can still read extra properties.
          return { ...record } as unknown as LabelValuePair;
        }

        const label = record[dp];

        return {
          label: label === null || label === undefined ? '' : String(label),
          value: { ...record },
          ...(record['disabled'] === true ? { disabled: true } : {}),
        };
      }

      return {
        label: String(item),
        value: item,
      };
    });
  }
}
