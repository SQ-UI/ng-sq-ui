import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'sq-form-group',
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormGroupComponent implements OnInit {
  @Input() groupLabel: string = '';

  constructor() { }

  ngOnInit() {
  }

}
