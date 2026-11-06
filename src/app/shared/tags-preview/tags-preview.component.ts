import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, viewChildren } from '@angular/core';
import { TagsInputComponent, type TagsInputSize } from '@sq-ui/ng-form-elements';

@Component({
  selector: 'sq-tags-preview',
  standalone: true,
  imports: [TagsInputComponent],
  templateUrl: './tags-preview.component.html',
  styleUrls: ['./tags-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsPreviewComponent {
  readonly sizes: { value: TagsInputSize; label: string }[] = [
    { value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' },
  ];
  private readonly typingExamples = viewChildren<TagsInputComponent, ElementRef<HTMLElement>>('typingExample', { read: ElementRef });

  constructor() {
    afterNextRender(() => {
      // NgModel registers its controls in a microtask after the initial render.
      queueMicrotask(() => {
        for (const example of this.typingExamples()) {
          const input = example.nativeElement.querySelector('input');
          if (input) {
            input.value = 'Text Activ';
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      });
    });
  }
}
