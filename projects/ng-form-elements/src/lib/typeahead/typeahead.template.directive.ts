import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-typeahead-option]',
  standalone: false,
})
export class SqTypeaheadOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: '[sq-typeahead-selected-option]',
  standalone: false,
})
export class SqTypeaheadSelectedOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
