import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, signal, viewChildren, type WritableSignal } from '@angular/core';
import { TypeaheadComponent, type TypeaheadSize, type TypeaheadOption } from '@sq-ui/ng-form-elements';

@Component({
  selector: 'sq-multiselect-preview',
  standalone: true,
  imports: [TypeaheadComponent],
  templateUrl: './multiselect-preview.component.html',
  styleUrls: ['./multiselect-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectPreviewComponent {
  readonly sizes: { value: TypeaheadSize; label: string }[] = [
    { value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' },
  ];
  readonly options: TypeaheadOption[] = [
    { label: 'Option Default', value: 'default' },
    { label: 'Option Middle Selected', value: 'selected' },
    { label: 'Option Bottom Disabled', value: 'disabled', disabled: true },
  ];
  readonly typingResults: Record<TypeaheadSize, WritableSignal<readonly TypeaheadOption[]>> = {
    s: signal(this.options), m: signal(this.options), l: signal(this.options),
  };
  private readonly typingExamples = viewChildren<TypeaheadComponent, ElementRef<HTMLElement>>('typingExample', { read: ElementRef });

  constructor() {
    afterNextRender(() => {
      for (const example of this.typingExamples()) {
        const input = example.nativeElement.querySelector('input');
        if (input) {
          input.value = 'Tex';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });
  }

  search(query: string, size: TypeaheadSize) {
    this.typingResults[size].set(this.options.filter(option => option.label.toLowerCase().includes(query.toLowerCase())));
  }
}
