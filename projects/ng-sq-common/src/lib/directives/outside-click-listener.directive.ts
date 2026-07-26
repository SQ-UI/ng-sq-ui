import {
  Directive, ElementRef,
  Renderer2, OnDestroy, input, output
} from '@angular/core';

@Directive({
  selector: '[sqOutsideClickListener]',
  standalone: true
})
export class OutsideClickListenerDirective implements OnDestroy {
  clickOutside = output<void>();
  listenForOutsideClick = input<boolean>(false);

  private listener;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.listener = this.renderer.listen('document', 'click', (event) => {
      if (this.listenForOutsideClick()) {
        const clickedInside = this.elementRef.nativeElement.contains(event.target);

        if (!clickedInside) {
          this.clickOutside.emit();
        }
      }
    });
  }

  ngOnDestroy() {
    this.listener();
  }
}
