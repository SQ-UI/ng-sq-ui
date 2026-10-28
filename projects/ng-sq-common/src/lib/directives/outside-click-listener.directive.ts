import {
  Directive, ElementRef,
  Renderer2, OnDestroy, inject, input, output
} from '@angular/core';

@Directive({
  selector: '[sqOutsideClickListener]',
  standalone: true
})
export class OutsideClickListenerDirective implements OnDestroy {
  clickOutside = output<void>();
  listenForOutsideClick = input<boolean>(false);

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  private readonly listener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
    if (this.listenForOutsideClick()) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);

      if (!clickedInside) {
        this.clickOutside.emit();
      }
    }
  });

  ngOnDestroy() {
    this.listener();
  }
}
