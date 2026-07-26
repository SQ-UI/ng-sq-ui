import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { SqInputCore } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class InputComponent extends SqInputCore implements FormValueControl<string> {
  readonly type = input<string>('text');
  readonly value = model('');

  protected readonly patternAttr = computed(() => {
    const patterns = this.pattern();
    return patterns.length > 0 ? patterns.map((regExp) => regExp.source).join('|') : undefined;
  });

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
