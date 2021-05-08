import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-dropdown-option]'
})
export class SqDropdownOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: '[sq-dropdown-chevron]'
})
export class SqDropdownChevronTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: '[sq-dropdown-selected-option]'
})
export class SqDropdownSelectedOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
