import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sq-collapse-content',
  templateUrl: './collapse-content.component.html',
  styleUrls: ['./collapse-content.component.scss']
})
export class CollapseContentComponent implements OnInit {
  @Input() title: string;
  @Input() isSecondary = false;

  isCollapsed = true;

  constructor() { }

  ngOnInit() {
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }


}
