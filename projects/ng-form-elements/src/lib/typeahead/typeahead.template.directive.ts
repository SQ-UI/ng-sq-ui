import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[sq-typeahead-option]',
  standalone: true,
})
export class SqTypeaheadOptionTemplateDirective {
  readonly template = inject(TemplateRef);
}

@Directive({
  selector: '[sq-typeahead-selected-option]',
  standalone: true,
})
export class SqTypeaheadSelectedOptionTemplateDirective {
  readonly template = inject(TemplateRef);
}
