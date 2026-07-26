import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[sq-tag]',
    standalone: true
})
export class SqTagTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
