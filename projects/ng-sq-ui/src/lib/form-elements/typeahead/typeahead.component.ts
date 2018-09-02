import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  forwardRef,
  ViewEncapsulation,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';

import { NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { SearchResult } from '../../shared/interfaces/search-result';
import { InputCoreComponent } from '../../shared/entities/input-core-component';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import { List, is } from 'immutable';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TypeaheadComponent),
  multi: true,
};

@Component({
  selector: 'sq-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class TypeaheadComponent extends InputCoreComponent
  implements OnInit, OnDestroy, OnChanges {
  @Input()
  searchResults: SearchResult[] = [];
  @Input()
  multiple = false;
  @Input()
  delay = 500;
  @Input()
  displayProp = '';
  @Output()
  onUserInputEnd = new EventEmitter<string>();

  private onInputValueChangeSubscription: Subscription;
  private onQueryInputControlSubscription: Subscription;
  private valueChangedSubscription: Subscription;
  private innerSelectedItemsListCopy: List<SearchResult>;

  selectedItems: List<SearchResult> = List<SearchResult>();

  constructor() {
    super();
  }

  queryInputControl = new FormControl();
  isLoading = false;
  listenForOutsideClick = false;
  hideResults = true;
  onInputValueChange = new Subject();

  ngOnInit() {
    this.value = [];

    this.onInputValueChangeSubscription = this.onInputValueChange
      .pipe(
        tap(() => {
          this.isLoading = true;
          this.hideResults = true;
        }),
        debounceTime(this.delay),
      )
      .subscribe((query: string) => {
        this.onUserInputEnd.emit(query);
      });

    this.onQueryInputControlSubscription = this.queryInputControl.valueChanges.subscribe(
      (newValue) => {
        if (newValue !== null) {
          this.onInputValueChange.next(newValue);
        }
      },
    );

    this.valueChangedSubscription = this._valueChange.subscribe(
      (predefinedEnteredItems) => {
        if (
          this.selectedItems.size === 0 &&
          predefinedEnteredItems &&
          predefinedEnteredItems.length > 0
        ) {
          predefinedEnteredItems.forEach((item) => {
            this.selectItem(item, false);
          });

          this.valueChangedSubscription.unsubscribe();
        }
      },
    );
  }

  ngOnChanges(changesObj) {
    if (changesObj.searchResults && changesObj.searchResults.currentValue) {
      this.isLoading = false;
      this.hideResults = false;
    }

    if (changesObj.disabled) {
      this.queryInputControl.disable();
    }
  }

  ngOnDestroy() {
    this.listenForOutsideClick = false;
    this.onQueryInputControlSubscription.unsubscribe();
    this.onInputValueChangeSubscription.unsubscribe();

    if (!this.valueChangedSubscription.closed) {
      this.valueChangedSubscription.unsubscribe();
    }
  }

  selectSearchResult(result: SearchResult) {
    this.selectItem(result);
  }

  removeSearchResult(itemIndex: number) {
    if (itemIndex < 0 || itemIndex > this.selectedItems.size) {
      return;
    }

    this.selectedItems = this.selectedItems.remove(itemIndex);

    if (this.selectedItems.size > 0) {
      this.copyResults();
    } else {
      this.value = [];
    }
  }

  onClickOutsideComponent() {
    this.listenForOutsideClick = false;
    this.hideResults = true;
    this.searchResults = [];
  }

  turnClickOutsideListenerOn() {
    this.listenForOutsideClick = true;
    this.value = [];
  }

  private selectItem(result: SearchResult, copyResults: boolean = true) {
    this.queryInputControl.setValue(null);

    if (!this.multiple && this.selectedItems.size === 1) {
      return;
    }

    if (this.selectedItems.indexOf(result) === -1) {
      this.selectedItems = this.selectedItems.push(result);
    }

    if (copyResults) {
      this.copyResults();
    }

    if (!this.multiple) {
      this.hideResults = true;
    }
  }

  private copyResults() {
    this.innerSelectedItemsListCopy = this.selectedItems;
    this.value = this.copyObjectsToNewIterable(this.innerSelectedItemsListCopy);
  }

  private copyObjectsToNewIterable(objList: List<SearchResult>) {
    const newList = objList.map((obj) => {
      let copiedSearchResult = {};

      if (typeof obj === 'object') {
        copiedSearchResult = Object.assign({}, obj);
      } else {
        copiedSearchResult[this.displayProp] = obj;
      }

      return copiedSearchResult;
    });

    return newList.toArray();
  }
}
