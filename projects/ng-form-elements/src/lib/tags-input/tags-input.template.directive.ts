import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-tag]'
})
export class SqTagTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
