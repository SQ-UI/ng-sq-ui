import {
  Component, ViewEncapsulation,
  Renderer2, ElementRef, ChangeDetectionStrategy,
  model, input, viewChild, effect, signal, inject
} from '@angular/core';
import { OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-modal',
  standalone: true,
  imports: [OutsideClickListenerDirective],
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

  private sqModal = viewChild<ElementRef>('sqModal');
  private sqModalWindow = viewChild<ElementRef>('sqModalWindow');

  listenForOutsideClick = signal<boolean>(false);

  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const isVisible = this.show();
      const modalEl = this.sqModal();
      const windowEl = this.sqModalWindow();
      if (!modalEl || !windowEl) return;

      const animation = this.customCssAnimation();
      const entranceAnimationClass = animation.entranceAnimation || 'fadeInDown';
      const exitAnimationClass = animation.exitAnimation || 'fadeOutUp';
      const animationDuration = animation.duration || 500;

      if (isVisible) {
        this.renderer.removeClass(modalEl.nativeElement, 'display-none');
        this.renderer.addClass(windowEl.nativeElement, entranceAnimationClass);

        setTimeout(() => {
          this.renderer.removeClass(windowEl.nativeElement, entranceAnimationClass);
          this.listenForOutsideClick.set(true);
        }, animationDuration);
      } else {
        this.renderer.addClass(windowEl.nativeElement, exitAnimationClass);

        setTimeout(() => {
          this.renderer.addClass(modalEl.nativeElement, 'display-none');
          this.renderer.removeClass(windowEl.nativeElement, exitAnimationClass);
          this.listenForOutsideClick.set(false);
        }, animationDuration);
      }
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
