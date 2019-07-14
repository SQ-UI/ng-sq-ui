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

  @ViewChild('sqModal', { static: false }) private sqModal: ElementRef;
  @ViewChild('sqModalWindow', { static: false }) private sqModalWindow: ElementRef;

  listenForOutsideClick: boolean = false;

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
          this.listenForOutsideClick = true;
        }, animationDuration);
      } else {
        this.renderer.addClass(this.sqModalWindow.nativeElement, exitAnimationClass);

        setTimeout(() => {
          this.renderer.addClass(this.sqModal.nativeElement, 'display-none');
          this.renderer.removeClass(this.sqModalWindow.nativeElement, exitAnimationClass);
          this.listenForOutsideClick = false;
        }, animationDuration);
      }
    }
  }

  close() {
    this.show = false;
    this.showChange.emit(false);
  }

  open() {
    this.show = true;
    this.showChange.emit(true);
  }

  onClickOutsideComponent() {
    this.listenForOutsideClick = false;
    this.close();
  }

}
