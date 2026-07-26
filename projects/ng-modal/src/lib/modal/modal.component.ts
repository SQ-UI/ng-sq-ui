import {
  Component, ViewEncapsulation,
  ChangeDetectionStrategy,
  model, input, effect, signal, computed
} from '@angular/core';
import { NgClass } from '@angular/common';
import { OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-modal',
  standalone: true,
  imports: [OutsideClickListenerDirective, NgClass],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  show = model<boolean>(false);

  customCssAnimation = input<{
    duration: number,
    entranceAnimation: string,
    exitAnimation: string
  }>({
    duration: 0,
    entranceAnimation: '',
    exitAnimation: ''
  });

  isHidden = signal<boolean>(true);
  entranceClass = signal<string>('');
  exitClass = signal<string>('');

  currentAnimationClass = computed(() => this.entranceClass() || this.exitClass());

  listenForOutsideClick = signal<boolean>(false);

  private initialized = false;

  constructor() {
    effect((onCleanup) => {
      const isVisible = this.show();

      const animation = this.customCssAnimation();
      const entranceAnimationClass = animation.entranceAnimation || 'fadeInDown';
      const exitAnimationClass = animation.exitAnimation || 'fadeOutUp';
      const animationDuration = animation.duration || 500;

      if (!this.initialized) {
        this.initialized = true;
        return;
      }

      let timerId: ReturnType<typeof setTimeout>;

      if (isVisible) {
        this.isHidden.set(false);
        this.entranceClass.set(entranceAnimationClass);

        timerId = setTimeout(() => {
          this.entranceClass.set('');
          this.listenForOutsideClick.set(true);
        }, animationDuration);
      } else {
        this.exitClass.set(exitAnimationClass);

        timerId = setTimeout(() => {
          this.isHidden.set(true);
          this.exitClass.set('');
          this.listenForOutsideClick.set(false);
        }, animationDuration);
      }

      onCleanup(() => clearTimeout(timerId));
    });
  }

  close() {
    this.show.set(false);
  }

  open() {
    this.show.set(true);
  }

  onClickOutsideComponent() {
    this.listenForOutsideClick.set(false);
    this.close();
  }
}
