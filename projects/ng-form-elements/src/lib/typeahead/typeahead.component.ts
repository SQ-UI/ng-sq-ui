import { Component, OnInit, Input, OnDestroy,
  forwardRef, ViewEncapsulation, OnChanges, Output,
  EventEmitter,
  SimpleChanges,
  ContentChild,
  TemplateRef
} from '@angular/core';

import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import { InputCoreComponent } from '@sq-ui/ng-sq-common';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import { List } from 'immutable';
import { SqTypeaheadOptionTemplateDirective, SqTypeaheadSelectedOptionTemplateDirective } from './typeahead.template.directive';

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
  @Input() hideSearchIcon: boolean = false;
  @Output() onUserInputEnd = new EventEmitter<string>();

  @ContentChild(SqTypeaheadOptionTemplateDirective, { read: TemplateRef }) optionTemplate: TemplateRef<any>;
  @ContentChild(SqTypeaheadSelectedOptionTemplateDirective, { read: TemplateRef }) selectedOptionTemplate: TemplateRef<any>;

  private onInputValueChangeSubscription: Subscription;
  private onQueryInputControlSubscription: Subscription;

  selectedItems: List<LabelValuePair> = List<LabelValuePair>();
  options: List<LabelValuePair> = List<LabelValuePair>();

  constructor() {
    super();
  }

  queryInputControl = new UntypedFormControl();
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
  }

  override writeValue(predefinedEnteredItems): void {
    super.writeValue(predefinedEnteredItems);
    if (this.selectedItems.size === 0 && predefinedEnteredItems && predefinedEnteredItems.length > 0) {
      this.transformToLabelValuePairList(predefinedEnteredItems).forEach((item) => {
        this.selectItem(item, false, true);
      });
    }
  }

  ngOnChanges(changesObj: SimpleChanges) {
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
  }

  selectSearchResult(result: LabelValuePair) {
    this.selectItem(result);
  }

  removeSearchResult = (choice: LabelValuePair) => {
    const itemIndex = this.selectedItems.indexOf(choice);

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

  private selectItem(result: LabelValuePair, copyResults: boolean = true, isInitialSelection: boolean = false) {
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

    if (!this.multiple || isInitialSelection) {
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
