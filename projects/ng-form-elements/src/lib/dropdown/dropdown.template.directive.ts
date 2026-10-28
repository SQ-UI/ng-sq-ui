import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[sq-dropdown-option]',
  standalone: true,
})
export class SqDropdownOptionTemplateDirective {
  readonly template = inject(TemplateRef);
}

@Directive({
  selector: '[sq-dropdown-chevron]',
  standalone: true,
})
export class SqDropdownChevronTemplateDirective {
  readonly template = inject(TemplateRef);
}

@Directive({
  selector: '[sq-dropdown-selected-option]',
  standalone: true,
})
export class SqDropdownSelectedOptionTemplateDirective {
  readonly template = inject(TemplateRef);
}
