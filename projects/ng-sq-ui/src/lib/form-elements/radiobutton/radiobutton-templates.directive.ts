import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-radio-label]'
})
export class SqRadiobuttonLabelTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
