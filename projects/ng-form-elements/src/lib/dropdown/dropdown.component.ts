import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, signal, contentChild, output
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
  readonly options = input<LabelValuePair[]>([]);

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

  toggleOptionsDropdown() {
    if (this.disabled()) {
      return;
    }

    const willOpen = !this.isOpen();
    this.isOpen.set(willOpen);
    this.listenForOutsideClick.set(willOpen);
    this.activeIndex.set(willOpen ? this.selectedIndex() : -1);
  }

  onClickOutsideComponent() {
    const wasOpen = this.isOpen();
    this.close();

    if (wasOpen) {
      this.touch.emit();
    }
  }

  selectOption(option: LabelValuePair) {
    if (this.disabled()) {
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
          this.activeIndex.update(index => Math.min(index + 1, optionCount - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen() && optionCount > 0) {
          this.activeIndex.update(index => Math.max(index - 1, 0));
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

    return (this.options() ?? []).findIndex(option => Object.is(option.value, current.value));
  }
}
