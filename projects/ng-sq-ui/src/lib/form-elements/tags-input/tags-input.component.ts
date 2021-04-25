import {
  Component, OnInit, forwardRef,
  ViewEncapsulation, EventEmitter, OnDestroy,
  AfterViewInit, ViewChild, ContentChild, TemplateRef
} from '@angular/core';
import { InputCoreComponent } from '@sq-ui/ng-sq-common';
import { DeviceOS } from '@sq-ui/ng-sq-common';
import { OSDetectorService } from '@sq-ui/ng-sq-common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { List } from 'immutable';
import { SqTagTemplateDirective } from './tags-input-templates.directive';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TagsInputComponent),
  multi: true
};

@Component({
  selector: 'sq-tags-input',
  templateUrl: './tags-input.component.html',
  styleUrls: ['./tags-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class TagsInputComponent extends InputCoreComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tagsInput', {static: true}) tagsInput;
  @ContentChild(SqTagTemplateDirective, { read: TemplateRef }) tagTemplate: TemplateRef<any>;

  private isModelEmpty: boolean = false;
  private enteredItemsSubscription: Subscription;
  private valueChangedSubscription: Subscription;
  private inputEventSubscription: Subscription;
  private innerEnteredItemsListCopy: List<string>;

  enteredItems: List<string> = List<string>();
  protected enteredItemsChange: EventEmitter<List<string>> = new EventEmitter<List<string>>();

  newTagName: string = '';

  constructor() {
    super();
  }

  ngOnInit() {
    this.enteredItemsSubscription = this.enteredItemsChange.subscribe((newTags) => {
      this.innerEnteredItemsListCopy = List(this.enteredItems);

      const itemsCopy = this.innerEnteredItemsListCopy;
      this.value = itemsCopy.toArray();
    });

    this.valueChangedSubscription = this._modelToViewChange.subscribe((predefinedEnteredItems) => {
      if (this.enteredItems.size === 0 && predefinedEnteredItems && predefinedEnteredItems.length > 0) {
        this.enteredItems = List<string>(predefinedEnteredItems);
        this.valueChangedSubscription.unsubscribe();
      }
    });
  }

  ngAfterViewInit() {
    if (OSDetectorService.getDeviceOS() === DeviceOS.Android) {
      const inputEvent = fromEvent(this.tagsInput.nativeElement, 'input');
      inputEvent.pipe(map(event => event));

      this.inputEventSubscription = inputEvent.subscribe(($event: any) => {
        if ($event.data === ' ') {
          this.onUserInput({ keyCode: 32 });
        }
      });
    }
  }

  ngOnDestroy() {
    this.enteredItemsSubscription.unsubscribe();

    if (this.inputEventSubscription) {
      this.inputEventSubscription.unsubscribe();
    }

    if (!this.valueChangedSubscription.closed) {
      this.valueChangedSubscription.unsubscribe();
    }
  }

  onUserInput($event) {
    if (this.newTagName.trim() !== '') {
      this.isModelEmpty = false;
      // if the user has pressed Space
      if ($event.keyCode === 32) {
        this.enteredItems = this.enteredItems.push(this.newTagName.trim());
        this.enteredItemsChange.emit(this.enteredItems);
        this.newTagName = '';
      }
    } else if (this.isModelEmpty) {
      // if the user has pressed Backspace
      if ($event.keyCode === 8 && this.enteredItems.size > 0) {
        this.enteredItems = this.enteredItems.remove(this.enteredItems.size - 1);
        this.enteredItemsChange.emit(this.enteredItems);
      }
    } else {
      this.isModelEmpty = true;
    }
  }

  removeTag = (tag: string) => {
    const tagIndex = this.enteredItems.indexOf(tag);

    if (tagIndex < 0 || tagIndex > this.enteredItems.size) {
      return;
    }

    this.enteredItems = this.enteredItems.remove(tagIndex);
    this.enteredItemsChange.emit(this.enteredItems);
  }
}
