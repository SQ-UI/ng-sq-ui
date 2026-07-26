import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, signal, contentChild, output, effect, TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

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
    FormsModule,
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
    // Set up debounced search pipeline
    this.searchSubject.pipe(
      tap(() => {
        this.isLoading.set(true);
        this.hideResults.set(true);
      }),
      debounceTime(this.delay()),
      takeUntilDestroyed(),
    ).subscribe((query: string) => {
      this.onUserInputEnd.emit(query);
    });

    // React to searchResults input changes
    effect(() => {
      const results = this.searchResults();
      if (results && results.length > 0) {
        const parsedResults = this.transformToLabelValuePairList(results);
        this.options.set(parsedResults);
        this.isLoading.set(false);
        this.hideResults.set(false);
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
    this.listenForOutsideClick.set(false);
    this.hideResults.set(true);
  }

  turnClickOutsideListenerOn() {
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
