import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-radio-label]',
  standalone: true,
})
export class SqRadiobuttonLabelTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
