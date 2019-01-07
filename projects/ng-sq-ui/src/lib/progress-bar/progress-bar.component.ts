import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ProgressBarSize, Size } from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProgressBarComponent implements OnInit, ProgressBarSize {
  @Input()
  size: Size;
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
