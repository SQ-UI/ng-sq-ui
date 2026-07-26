import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  input,
  model,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { SqInputCore } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TextareaComponent extends SqInputCore implements FormValueControl<string> {
  readonly minHeight = input(100);
  readonly value = model('');

  private readonly textareaRef = viewChild.required<ElementRef<HTMLDivElement>>('textarea');

  readonly isPlaceholderVisible = computed(() => !this.value());

  constructor() {
    super();

    effect(() => this.syncDomFromValue());
  }

  inputChange(event: Event): void {
    const text = (event.target as HTMLElement).textContent ?? '';
    this.value.set(text);
  }

  focusOnArea(): void {
    this.textareaRef().nativeElement.focus();
  }

  protected syncDomFromValue(): void {
    const el = this.textareaRef()?.nativeElement;

    if (!el) {
      return;
    }

    const value = this.value();

    if (el.textContent !== value) {
      el.textContent = value;
    }
  }
}
