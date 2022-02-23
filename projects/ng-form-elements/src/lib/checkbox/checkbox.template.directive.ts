import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-checkbox-label]'
})
export class SqCheckboxLabelTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
