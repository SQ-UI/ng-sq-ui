import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormValueControl } from '@angular/forms/signals';
import { DeviceOS, OSDetectorService, SqInputCore } from '@sq-ui/ng-sq-common';
import { SqTagTemplateDirective } from './tags-input.template.directive';

@Component({
  selector: 'sq-tags-input',
  templateUrl: './tags-input.component.html',
  styleUrls: ['./tags-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class TagsInputComponent
  extends SqInputCore
  implements FormValueControl<string[]>, AfterViewInit, OnDestroy
{
  readonly value = model<string[]>([]);

  readonly tagTemplate = contentChild(SqTagTemplateDirective, { read: TemplateRef });
  private readonly tagsInputRef = viewChild.required<ElementRef<HTMLInputElement>>('tagsInput');

  readonly newTagName = signal('');

  private isModelEmpty = false;
  private removeAndroidSpaceListener: (() => void) | undefined;

  ngAfterViewInit(): void {
    if (OSDetectorService.getDeviceOS() === DeviceOS.Android) {
      const inputEl = this.tagsInputRef().nativeElement;
      const listener = (event: Event) => {
        if ((event as InputEvent).data === ' ') {
          this.onUserInput({ keyCode: 32 });
        }
      };

      inputEl.addEventListener('input', listener);
      this.removeAndroidSpaceListener = () => inputEl.removeEventListener('input', listener);
    }
  }

  ngOnDestroy(): void {
    this.removeAndroidSpaceListener?.();
  }

  onNewTagNameInput(event: Event): void {
    this.newTagName.set((event.target as HTMLInputElement).value);
  }

  onUserInput($event: { keyCode: number }): void {
    const currentTagName = this.newTagName().trim();

    if (currentTagName !== '') {
      this.isModelEmpty = false;

      // if the user has pressed Space
      if ($event.keyCode === 32) {
        this.value.update((items) => [...items, currentTagName]);
        this.newTagName.set('');
      }
    } else if (this.isModelEmpty) {
      // if the user has pressed Backspace
      if ($event.keyCode === 8 && this.value().length > 0) {
        this.value.update((items) => items.slice(0, -1));
      }
    } else {
      this.isModelEmpty = true;
    }
  }

  removeTag = (tag: string): void => {
    const items = this.value();
    const tagIndex = items.indexOf(tag);

    if (tagIndex < 0) {
      return;
    }

    this.value.set(items.filter((_, index) => index !== tagIndex));
  };
}
