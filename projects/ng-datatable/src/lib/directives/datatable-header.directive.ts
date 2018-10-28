import {Directive, ElementRef, OnInit} from '@angular/core';

@Directive({
  selector: '[sq-datatable-header]'
})
export class DatatableHeaderDirective implements OnInit {

  constructor(private hostElement: ElementRef) { }

  ngOnInit() {
    console.log(this.hostElement);
  }
}
