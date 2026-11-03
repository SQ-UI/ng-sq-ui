import { Component, ViewEncapsulation, ChangeDetectionStrategy, input, model, computed, viewChild, effect, ElementRef, output } from '@angular/core';
import { FORM_FIELD_DEFAULTS, generateFormFieldId } from '@sq-ui/ng-sq-common';
import type { SqFormFieldSignals, SqFormValueControl } from '@sq-ui/ng-sq-common';

/** `innerText` keeps the line breaks a contenteditable inserts (`<div>`/`<br>`); `textContent` drops them. */
const supportsInnerText = typeof HTMLElement !== 'undefined' && 'innerText' in HTMLElement.prototype;

function readText(element: HTMLElement): string {
  return (supportsInnerText ? element.innerText : element.textContent) ?? '';
}

function writeText(element: HTMLElement, text: string) {
  if (supportsInnerText) {
    element.innerText = text;
  } else {
    element.textContent = text;
  }
}

@Component({
  selector: 'sq-textarea',
  standalone: true,
  imports: [],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent implements SqFormFieldSignals, SqFormValueControl<string> {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>(FORM_FIELD_DEFAULTS.controlLabel);
  readonly controlPlaceholder = input<string>(FORM_FIELD_DEFAULTS.controlPlaceholder);
  readonly required = input<boolean>(FORM_FIELD_DEFAULTS.required);
  readonly pattern = input<readonly RegExp[]>(FORM_FIELD_DEFAULTS.pattern);
  readonly disabled = input<boolean>(FORM_FIELD_DEFAULTS.disabled);

  /** Signals that the user left the control, so `[formField]` can mark the field as touched. */
  readonly touch = output<void>();

  // Component-specific inputs
  readonly minHeight = input<number>(100);

  // Two-way value binding via model()
  readonly value = model<string>('');

  // ViewChild for contentEditable div
  readonly textarea = viewChild<ElementRef<HTMLElement>>('textarea');

  // Computed placeholder visibility
  readonly isPlaceholderVisible = computed(() => !this.value());

  constructor() {
    // Sync programmatic value changes to the contentEditable DOM element
    effect(() => {
      const el = this.textarea()?.nativeElement;
      const val = this.value() ?? '';
      if (el && readText(el) !== val) {
        writeText(el, val);
      }
    });
  }

  onInput(event: Event) {
    this.value.set(readText(event.target as HTMLElement));
  }

  focusOnArea() {
    if (!this.disabled()) {
      this.textarea()?.nativeElement.focus();
    }
  }
}
