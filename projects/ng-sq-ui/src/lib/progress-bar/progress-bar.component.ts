import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ISize, TSize } from '../shared/interfaces/sizes';

@Component({
  selector: 'sq-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProgressBarComponent implements OnInit, ISize {
  @Input()
  size: TSize;
  @Input()
  loaded: number;
  @Input()
  infinite = false;
  constructor() {}

  ngOnInit() {
    if (!this.size) {
      this.size = 'medium';
    }
  }
}
