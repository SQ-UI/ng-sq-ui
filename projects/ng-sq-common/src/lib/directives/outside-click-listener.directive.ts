import {
  Directive, ElementRef, OnDestroy, Renderer2, inject, input, output
} from '@angular/core';

@Directive({
  selector: '[sqOutsideClickListener]',
  standalone: true,
})
export class OutsideClickListenerDirective implements OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly listenForOutsideClick = input<boolean>(false);
  readonly clickOutside = output<void>();

  private readonly unlisten = this.renderer.listen('document', 'click', (event: Event) => {
    if (!this.listenForOutsideClick()) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.clickOutside.emit();
    }
  });

  ngOnDestroy(): void {
    this.unlisten();
  }
}
