import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, computed, viewChild, effect, ElementRef,
} from '@angular/core';
import { generateFormFieldId } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-textarea',
  standalone: true,
  imports: [],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Component-specific inputs
  readonly minHeight = input<number>(100);

  // Two-way value binding via model()
  readonly value = model<any>('');

  // ViewChild for contentEditable div
  readonly textarea = viewChild<ElementRef>('textarea');

  // Computed placeholder visibility
  readonly isPlaceholderVisible = computed(() => !this.value());

  constructor() {
    // Sync programmatic value changes to the contentEditable DOM element
    effect(() => {
      const el = this.textarea()?.nativeElement;
      const val = this.value();
      if (el && el.textContent !== val) {
        el.textContent = val;
      }
    });
  }

  onInput(event: Event) {
    const text = (event.target as HTMLElement).textContent || '';
    this.value.set(text);
  }

  focusOnArea() {
    this.textarea()?.nativeElement.focus();
  }
}
