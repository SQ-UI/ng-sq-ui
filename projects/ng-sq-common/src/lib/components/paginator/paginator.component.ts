import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import { List } from 'immutable';

@Component({
  selector: 'sq-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit, OnChanges {
  @Input() items: {[key: string]: any}[] | string[] = [];
  @Input() viewCollection: {[key: string]: any}[] | string[] = [];
  @Output() itemsChange = new EventEmitter();
  @Input() displayProperty: string;
  @Input() itemsPerPage: number = 10;
  @Output() pageChange: EventEmitter<number> = new EventEmitter();

  pages: number;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changesObj) {
    if (changesObj.items && changesObj.items.currentValue) {
      this.generateViewCollection();
      this.updatePageCount();
    }

    if (changesObj.displayProperty && changesObj.displayProperty.currentValue) {
      this.generateViewCollection();
    }

    if (changesObj.itemsPerPage && changesObj.itemsPerPage.currentValue &&
        changesObj.itemsPerPage.currentValue > 0) {
      this.updatePageCount();
    }
  }

  onPageClick(page) {
    this.pageChange.emit(page);
  }

  private updatePageCount() {
    this.pages = this.items.length / this.itemsPerPage;
  }

  private generateViewCollection() {
    if (this.items && this.items.length > 0) {
      this.viewCollection = this.items.map((item) => {
        let newItem = item;
        if (typeof this.items[0] === 'object' && this.displayProperty) {
          newItem = item[this.displayProperty];
        }

        return newItem;
      });
    }
  }

}
