import {Component, OnInit, ViewEncapsulation, Input,
        Output, EventEmitter, ViewChild, OnChanges, AfterViewInit} from '@angular/core';

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

  @ViewChild('sqModal') private sqModal;
  @ViewChild('sqModalWindow') private sqModalWindow;

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changesObj) {
    if (changesObj.hasOwnProperty('show') && !changesObj.firstChange) {
      if (this.sqModalWindow) {
        const entranceAnimationClass = this.customCssAnimation.entranceAnimation || 'flipInX';
        const exitAnimationClass = this.customCssAnimation.exitAnimation || 'flipOutX';
        const animationDuration = this.customCssAnimation.duration || 1000;

        if (changesObj.show.currentValue === true) {
          this.sqModal.nativeElement.classList.remove('display-none');
          this.sqModalWindow.nativeElement.classList.add(entranceAnimationClass);
          setTimeout(() => {
            this.sqModalWindow.nativeElement.classList.remove(entranceAnimationClass);
          }, animationDuration);
        } else {
          this.sqModalWindow.nativeElement.classList.add(exitAnimationClass);
          setTimeout(() => {
            this.sqModal.nativeElement.classList.add('display-none');
            this.sqModalWindow.nativeElement.classList.remove(exitAnimationClass);
          }, animationDuration);
        }
      }
    }
  }

  close() {
    this.showChange.emit(false);
  }

}
