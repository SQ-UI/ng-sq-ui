import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, signal, contentChild, output, effect, untracked, TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, tap } from 'rxjs/operators';
import { Subject, timer } from 'rxjs';

import { LabelValuePair, generateFormFieldId, OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';
import { SqTypeaheadOptionTemplateDirective, SqTypeaheadSelectedOptionTemplateDirective } from './typeahead.template.directive';

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
export class TypeaheadComponent {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Component-specific inputs
  readonly searchResults = input<any[]>([]);
  readonly multiple = input<boolean>(false);
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
  readonly options = signal<LabelValuePair[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly listenForOutsideClick = signal<boolean>(false);
  readonly hideResults = signal<boolean>(true);
  readonly searchText = signal<string>('');

  // Debounced search via RxJS Subject
  private searchSubject = new Subject<string>();

  constructor() {
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
      }
    });
  }

  onSearchInput(event: Event) {
    const text = (event.target as HTMLInputElement).value || '';
    this.searchText.set(text);
    this.searchSubject.next(text);
  }

  selectSearchResult(result: LabelValuePair) {
    this.selectItem(result);
  }

  removeSearchResult = (choice: LabelValuePair) => {
    const items = this.selectedItems();
    const itemIndex = items.indexOf(choice);

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
    this.hideResults.set(true);
  }

  turnClickOutsideListenerOn() {
    // Only arms the outside-click listener: clearing `value` here used to wipe the bound model
    // every time the input received focus.
    this.listenForOutsideClick.set(true);
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
    if (items.indexOf(result) === -1) {
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

  private transformToLabelValuePairList(resultsList: any[]): LabelValuePair[] {
    const dp = this.displayProp();
    return resultsList.map(item => {
      if (typeof item === 'object') {
        if (dp === '') {
          return Object.assign({}, item);
        } else {
          return {
            label: item[dp],
            value: Object.assign({}, item),
          };
        }
      } else {
        return {
          label: item,
          value: item,
        };
      }
    });
  }
}
