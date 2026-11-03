import { Component, ViewEncapsulation, ChangeDetectionStrategy, input, model, contentChild, TemplateRef, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { FORM_FIELD_DEFAULTS, generateFormFieldId } from '@sq-ui/ng-sq-common';
import { SqTagTemplateDirective } from './tags-input.template.directive';
import type { SqFormFieldSignals, SqFormValueControl } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-tags-input',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './tags-input.component.html',
  styleUrls: ['./tags-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputComponent implements SqFormFieldSignals, SqFormValueControl<string[]> {
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

  // Two-way value binding — the value IS the tags array
  readonly value = model<string[]>([]);

  // Signal-based queries
  readonly tagTemplate = contentChild(SqTagTemplateDirective, { read: TemplateRef });

  newTagName: string = '';

  /**
   * Bound to `keydown`, so the pressed key has not reached the input yet: the separator is never
   * part of the tag, `preventDefault()` keeps it out of the field, and `newTagName` still holds the
   * text from before the key press.
   */
  onUserInput($event: KeyboardEvent) {
    const key = $event.key;
    const pendingTag = this.newTagName.trim();

    // Space, Enter or Comma commit the current tag.
    if (key === ' ' || key === 'Enter' || key === ',') {
      if (pendingTag !== '') {
        $event.preventDefault();
        this.value.update(tags => [...tags, pendingTag]);
        this.newTagName = '';
      } else if (key !== 'Enter') {
        // Don't let a leading separator into the empty field; Enter keeps its default (submit).
        $event.preventDefault();
      }
      return;
    }

    // Backspace in an already empty field removes the last tag.
    if (key === 'Backspace' && this.newTagName === '' && this.value().length > 0) {
      this.value.update(tags => tags.slice(0, -1));
    }
  }

  removeTag = (tag: string) => {
    const tagIndex = this.value().indexOf(tag);

    if (tagIndex < 0 || tagIndex >= this.value().length) {
      return;
    }

    this.value.update(tags => tags.filter((_, i) => i !== tagIndex));
  }
}
