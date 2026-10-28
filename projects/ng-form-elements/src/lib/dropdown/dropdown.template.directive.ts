import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[sq-dropdown-option]',
  standalone: true,
})
export class SqDropdownOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: '[sq-dropdown-chevron]',
  standalone: true,
})
export class SqDropdownChevronTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}

@Directive({
  selector: '[sq-dropdown-selected-option]',
  standalone: true,
})
export class SqDropdownSelectedOptionTemplateDirective {
  constructor(public template: TemplateRef<any>) { }
}
