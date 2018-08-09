import {
  Directive, ElementRef, HostListener,
  EventEmitter, Output, Input, Renderer2, OnDestroy
} from '@angular/core';

@Directive({
  selector: '[sqOutsideClickListener]'
})
export class OutsideClickListenerDirective implements OnDestroy {
  @Output() clickOutside = new EventEmitter();
  @Input() listenForOutsideClick: boolean = false;

  private listener;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.listener = this.renderer.listen('document', 'click', (event) => {
      if (this.listenForOutsideClick) {
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
