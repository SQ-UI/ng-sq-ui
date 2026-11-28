import {
  Component, ViewEncapsulation,
  ChangeDetectionStrategy,
  model, input, effect, signal, computed, inject, ElementRef, afterRenderEffect
} from '@angular/core';
import { DOCUMENT, NgClass } from '@angular/common';
import { OutsideClickListenerDirective, generateFormFieldId } from '@sq-ui/ng-sq-common';
import type { Size } from '@sq-ui/ng-sq-common';

const openModals: ModalComponent[] = [];
const scrollLocks = new WeakMap<Document, { count: number; previous: string }>();

@Component({
  selector: 'sq-modal',
  standalone: true,
  imports: [OutsideClickListenerDirective, NgClass],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape($event)',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class ModalComponent {
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly titleId = generateFormFieldId();
  show = model<boolean>(false);
  size = input<Size>('medium');

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

        // A modal bound as initially open (`[(show)]="true"`) is shown straight away, without
        // the entrance animation.
        if (isVisible) {
          this.isHidden.set(false);
          this.listenForOutsideClick.set(true);
        }

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

    effect(onCleanup => {
      if (!this.show()) return;
      const opener = this.document.activeElement as HTMLElement | null;
      openModals.push(this);
      const lock = scrollLocks.get(this.document) ?? { count: 0, previous: this.document.body.style.overflow };
      lock.count += 1;
      scrollLocks.set(this.document, lock);
      this.document.body.style.overflow = 'hidden';
      onCleanup(() => {
        const wasTop = openModals.at(-1) === this;
        const index = openModals.indexOf(this);
        if (index >= 0) openModals.splice(index, 1);
        lock.count -= 1;
        if (lock.count === 0) {
          this.document.body.style.overflow = lock.previous;
          scrollLocks.delete(this.document);
        }
        if (wasTop && opener?.isConnected) opener.focus();
      });
    });

    afterRenderEffect(() => {
      if (!this.show() || openModals.at(-1) !== this) return;
      const dialog = this.element.nativeElement.querySelector<HTMLElement>('[role="dialog"]');
      const target = dialog?.querySelector<HTMLElement>('[autofocus]') ?? this.focusable()[0] ?? dialog;
      target?.focus();
    });
  }

  close() {
    this.show.set(false);
  }

  open() {
    this.show.set(true);
  }

  onEscape(event?: Event) {
    if (!event?.defaultPrevented && this.show() && openModals.at(-1) === this) {
      this.close();
    }
  }

  onClickOutsideComponent() {
    if (openModals.at(-1) !== this) return;
    this.listenForOutsideClick.set(false);
    this.close();
  }

  private focusable(): HTMLElement[] {
    return Array.from(this.element.nativeElement.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'))
      .filter(element => !element.closest('[hidden], [inert]') && this.document.defaultView?.getComputedStyle(element).display !== 'none');
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.show() || openModals.at(-1) !== this) return;
    const elements = this.focusable();
    const first = elements[0], last = elements.at(-1);
    if (!first || !last) { event.preventDefault(); this.element.nativeElement.querySelector<HTMLElement>('[role="dialog"]')?.focus(); return; }
    const active = this.document.activeElement;
    if (!this.element.nativeElement.contains(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  }
}
