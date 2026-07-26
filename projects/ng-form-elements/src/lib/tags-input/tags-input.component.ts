import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, viewChild, contentChild, ElementRef, TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { generateFormFieldId } from '@sq-ui/ng-sq-common';
import { SqTagTemplateDirective } from './tags-input.template.directive';

@Component({
  selector: 'sq-tags-input',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './tags-input.component.html',
  styleUrls: ['./tags-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputComponent {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Two-way value binding — the value IS the tags array
  readonly value = model<string[]>([]);

  // Signal-based queries
  readonly tagsInput = viewChild<ElementRef>('tagsInput');
  readonly tagTemplate = contentChild(SqTagTemplateDirective, { read: TemplateRef });

  private isModelEmpty: boolean = false;

  newTagName: string = '';

  onUserInput($event: KeyboardEvent) {
    if (this.newTagName.trim() !== '') {
      this.isModelEmpty = false;
      // if the user has pressed Space
      if ($event.keyCode === 32) {
        this.value.update(tags => [...tags, this.newTagName.trim()]);
        this.newTagName = '';
      }
    } else if (this.isModelEmpty) {
      // if the user has pressed Backspace
      if ($event.keyCode === 8 && this.value().length > 0) {
        this.value.update(tags => tags.slice(0, -1));
      }
    } else {
      this.isModelEmpty = true;
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
