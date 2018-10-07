import { Component, OnInit, Input, OnDestroy,
  forwardRef, ViewEncapsulation, OnChanges, Output,
  EventEmitter
} from '@angular/core';

import { NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { LabelValuePair } from '../../shared/shared.module';
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
  @Input() searchResults: any[] = [];
  @Input() multiple = false;
  @Input() delay = 500;
  @Input() displayProp = '';
  @Output() onUserInputEnd = new EventEmitter<string>();

  private onInputValueChangeSubscription: Subscription;
  private onQueryInputControlSubscription: Subscription;
  private valueChangedSubscription: Subscription;

  selectedItems: List<LabelValuePair> = List<LabelValuePair>();
  options: List<LabelValuePair> = List<LabelValuePair>();

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

    this.valueChangedSubscription = this._modelToViewChange.subscribe(
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
      const parsedResults = this.transformToLabelValuePairList(this.searchResults);
      this.options = List(parsedResults);

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

  selectSearchResult(result: LabelValuePair) {
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

  private selectItem(result: LabelValuePair, copyResults: boolean = true) {
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
      this.value = this.selectedItems.toArray();
  }

  private transformToLabelValuePairList(resultsList: any): Array<LabelValuePair> {
    const newList = resultsList.map(item => {
      let searchResult: LabelValuePair | any;

      if (typeof item === 'object') {
        // if displayProp is an empty string,
        // it assumes that the author passes LabelValuePair items
        if (this.displayProp === '') {
          searchResult = Object.assign({}, item);
        } else {
          // in case the author wants a specific display property
          searchResult = {
            label: item[this.displayProp],
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

    return newList;
  }
}
