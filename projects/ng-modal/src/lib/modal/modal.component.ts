import {
  Component, OnInit, ViewEncapsulation, Input,
  Output, EventEmitter, ViewChild, OnChanges,
  Renderer2, ElementRef, SimpleChanges
} from '@angular/core';

@Component({
  selector: 'sq-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Output() showChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() customCssAnimation: {
    duration: number,
    entranceAnimation: string,
    exitAnimation: string
  } = {
    duration: 0,
    entranceAnimation: '',
    exitAnimation: ''
  };

  @ViewChild('sqModal') private sqModal: ElementRef;
  @ViewChild('sqModalWindow') private sqModalWindow: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngOnInit() { }

  ngOnChanges(changesObj: SimpleChanges) {
    if (changesObj.show && this.sqModalWindow) {
      const entranceAnimationClass = this.customCssAnimation.entranceAnimation || 'fadeInDown';
      const exitAnimationClass = this.customCssAnimation.exitAnimation || 'fadeOutUp';
      const animationDuration = this.customCssAnimation.duration || 500;

      if (changesObj.show.currentValue === true) {
        this.renderer.removeClass(this.sqModal.nativeElement, 'display-none');
        this.renderer.addClass(this.sqModalWindow.nativeElement, entranceAnimationClass);

        setTimeout(() => {
          this.renderer.removeClass(this.sqModalWindow.nativeElement, entranceAnimationClass);
        }, animationDuration);
      } else {
        this.renderer.addClass(this.sqModalWindow.nativeElement, exitAnimationClass);

        setTimeout(() => {
          this.renderer.addClass(this.sqModal.nativeElement, 'display-none');
          this.renderer.removeClass(this.sqModalWindow.nativeElement, exitAnimationClass);
        }, animationDuration);
      }
    }
  }

  close() {
    this.showChange.emit(false);
  }

  open() {
    this.showChange.emit(true);
  }

}
