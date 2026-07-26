import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormValueControl } from '@angular/forms/signals';
import { Subject, Subscription, timer } from 'rxjs';
import { debounce, tap } from 'rxjs/operators';
import { LabelValuePair, OutsideClickListenerDirective, SqInputCore } from '@sq-ui/ng-sq-common';
import {
  SqTypeaheadOptionTemplateDirective,
  SqTypeaheadSelectedOptionTemplateDirective,
} from './typeahead.template.directive';

@Component({
  selector: 'sq-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet, OutsideClickListenerDirective],
})
export class TypeaheadComponent extends SqInputCore implements FormValueControl<any[]>, OnInit, OnDestroy {
  readonly searchResults = input<any[]>([]);
  readonly multiple = input(false);
  readonly delay = input(500);
  readonly displayProp = input('');
  readonly hideSearchIcon = input(false);
  readonly onUserInputEnd = output<string>();

  readonly optionTemplate = contentChild(SqTypeaheadOptionTemplateDirective, { read: TemplateRef });
  readonly selectedOptionTemplate = contentChild(SqTypeaheadSelectedOptionTemplateDirective, { read: TemplateRef });

  readonly value = model<any[]>([]);

  readonly query = signal('');
  readonly isLoading = signal(false);
  readonly listenForOutsideClick = signal(false);
  readonly hideResults = signal(true);

  readonly selectedItems = signal<LabelValuePair[]>([]);
  readonly options = signal<LabelValuePair[]>([]);

  private readonly onInputValueChange = new Subject<string>();
  private readonly onInputValueChangeSubscription: Subscription;

  constructor() {
    super();

    effect(() => this.syncOptionsFromSearchResults());

    this.onInputValueChangeSubscription = this.onInputValueChange
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.hideResults.set(true);
        }),
        debounce(() => timer(this.delay())),
      )
      .subscribe((query) => {
        this.onUserInputEnd.emit(query);
      });
  }

  ngOnInit(): void {
    const initialValue = this.value();

    if (this.selectedItems().length === 0 && initialValue && initialValue.length > 0) {
      this.selectedItems.set(this.transformToLabelValuePairList(initialValue));

      if (!this.multiple()) {
        this.hideResults.set(true);
      }
    }
  }

  ngOnDestroy(): void {
    this.onInputValueChangeSubscription.unsubscribe();
  }

  onQueryInput(event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    this.query.set(newValue);

    if (newValue !== null) {
      this.onInputValueChange.next(newValue);
    }
  }

  selectSearchResult(result: LabelValuePair): void {
    this.selectItem(result);
  }

  removeSearchResult = (choice: LabelValuePair): void => {
    const items = this.selectedItems();
    const itemIndex = items.indexOf(choice);

    if (itemIndex < 0) {
      return;
    }

    this.selectedItems.set(items.filter((_, index) => index !== itemIndex));

    if (this.selectedItems().length > 0) {
      this.copyResults();
    } else {
      this.value.set([]);
    }
  };

  onClickOutsideComponent(): void {
    this.listenForOutsideClick.set(false);
    this.hideResults.set(true);
  }

  turnClickOutsideListenerOn(): void {
    this.listenForOutsideClick.set(true);
    this.value.set([]);
  }

  protected syncOptionsFromSearchResults(): void {
    const results = this.searchResults();

    if (results && results.length > 0) {
      this.options.set(this.transformToLabelValuePairList(results));
      this.isLoading.set(false);
      this.hideResults.set(false);
    }
  }

  private selectItem(result: LabelValuePair, copyResults: boolean = true, isInitialSelection: boolean = false): void {
    this.query.set('');

    if (!this.multiple() && this.selectedItems().length === 1) {
      return;
    }

    if (this.selectedItems().indexOf(result) === -1) {
      this.selectedItems.update((items) => [...items, result]);
    }

    if (copyResults) {
      this.copyResults();
    }

    if (!this.multiple() || isInitialSelection) {
      this.hideResults.set(true);
    }
  }

  private copyResults(): void {
    this.value.set(this.selectedItems().slice());
  }

  private transformToLabelValuePairList(resultsList: any[]): Array<LabelValuePair> {
    return resultsList.map((item) => {
      let searchResult: LabelValuePair | any;

      if (typeof item === 'object') {
        // if displayProp is an empty string,
        // it assumes that the author passes LabelValuePair items
        if (this.displayProp() === '') {
          searchResult = Object.assign({}, item);
        } else {
          // in case the author wants a specific display property
          searchResult = {
            label: item[this.displayProp()],
            value: Object.assign({}, item),
          };
        }
      } else {
        searchResult = {
          label: item,
          value: item,
        };
      }

      return searchResult;
    });
  }
}
