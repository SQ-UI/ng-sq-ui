import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-dropdown-option]',
  standalone: false,
})
export class SqDropdownOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: '[sq-dropdown-chevron]',
  standalone: false,
})
export class SqDropdownChevronTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: '[sq-dropdown-selected-option]',
  standalone: false,
})
export class SqDropdownSelectedOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
