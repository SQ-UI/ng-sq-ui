import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, signal, contentChild, output, viewChild, ElementRef, afterRenderEffect
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FORM_FIELD_DEFAULTS, generateFormFieldId, OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import type { SqFormFieldSignals, SqFormValueControl } from '@sq-ui/ng-sq-common';
import {
  SqDropdownChevronTemplateDirective,
  SqDropdownOptionTemplateDirective,
  SqDropdownSelectedOptionTemplateDirective
} from './dropdown.template.directive';
import type { DropdownSize, DropdownOption } from './dropdown.types';

@Component({
  selector: 'sq-dropdown',
  standalone: true,
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    OutsideClickListenerDirective,
  ],
})
export class DropdownComponent implements SqFormFieldSignals, SqFormValueControl<LabelValuePair | null> {
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
  readonly options = input<DropdownOption[]>([]);
  readonly size = input<DropdownSize>('s');

  // Two-way binding value
  readonly value = model<LabelValuePair | null>(null);

  // Event output
  readonly onSelectItem = output<LabelValuePair>();

  // Content children for custom templates
  readonly optionTemplate = contentChild(SqDropdownOptionTemplateDirective);
  readonly chevronTemplate = contentChild(SqDropdownChevronTemplateDirective);
  readonly selectedOptionTemplate = contentChild(SqDropdownSelectedOptionTemplateDirective);

  // Internal state
  readonly isOpen = signal<boolean>(false);
  readonly listenForOutsideClick = signal<boolean>(false);
  /** Option highlighted with the arrow keys (`-1` = none). */
  readonly activeIndex = signal<number>(-1);
  readonly keyboardNavigation = signal(false);
  private readonly optionsList = viewChild<ElementRef<HTMLElement>>('optionsList');

  constructor() {
    afterRenderEffect(() => {
      const index = this.activeIndex();
      const list = this.optionsList()?.nativeElement;
      const option = list?.children.item(index) as HTMLElement | null | undefined;
      if (!list || !option) return;
      if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
      }
    });
  }

  isOptionSelected(option: LabelValuePair): boolean {
    return !!this.value() && Object.is(option.value, this.value()?.value);
  }

  onLabelClick(event: MouseEvent, control: HTMLElement) {
    // The label moved outside the trigger; its click must not count as outside.
    event.stopPropagation();
    if (!this.disabled()) {
      control.focus();
      this.toggleOptionsDropdown();
    }
  }

  toggleOptionsDropdown() {
    if (this.disabled()) {
      return;
    }

    const willOpen = !this.isOpen();
    this.isOpen.set(willOpen);
    this.listenForOutsideClick.set(willOpen);
    this.activeIndex.set(willOpen ? this.selectedIndex() : -1);
    this.keyboardNavigation.set(false);
  }

  onClickOutsideComponent() {
    const wasOpen = this.isOpen();
    this.close();

    if (wasOpen) {
      this.touch.emit();
    }
  }

  selectOption(option: DropdownOption) {
    if (this.disabled() || option.disabled) {
      return;
    }

    // A copy is stored on purpose, so the caller's option object is never shared with the model.
    this.value.set({ ...option });
    this.close();
    this.onSelectItem.emit(option);
  }

  onKeydown(event: KeyboardEvent) {
    if (this.disabled()) {
      return;
    }

    const optionCount = this.options()?.length ?? 0;

    switch (event.key) {
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const active = this.options()?.[this.activeIndex()];
        if (this.isOpen() && active) {
          this.selectOption(active);
        } else {
          this.toggleOptionsDropdown();
        }
        break;
      }
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleOptionsDropdown();
        } else if (optionCount > 0) {
          this.activeIndex.set(this.nextEnabledIndex(this.activeIndex(), 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen() && optionCount > 0) {
          this.activeIndex.set(this.nextEnabledIndex(this.activeIndex() < 0 ? optionCount : this.activeIndex(), -1));
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
    if (this.isOpen() && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      this.keyboardNavigation.set(true);
    }
  }

  /** Marks the field touched once focus leaves the control (not when moving inside it). */
  onFocusOut(event: FocusEvent) {
    const host = event.currentTarget as HTMLElement | null;
    const next = event.relatedTarget as Node | null;

    if (!host || !next || !host.contains(next)) {
      this.touch.emit();
    }
  }

  private close() {
    this.isOpen.set(false);
    this.listenForOutsideClick.set(false);
    this.activeIndex.set(-1);
  }

  private selectedIndex(): number {
    const current = this.value();
    if (!current) {
      return -1;
    }

    return (this.options() ?? []).findIndex(option => !option.disabled && Object.is(option.value, current.value));
  }

  private nextEnabledIndex(from: number, direction: 1 | -1): number {
    const options = this.options();
    for (let index = from + direction; index >= 0 && index < options.length; index += direction) {
      if (!options[index].disabled) return index;
    }
    return from >= 0 && from < options.length && !options[from].disabled ? from : -1;
  }
}
