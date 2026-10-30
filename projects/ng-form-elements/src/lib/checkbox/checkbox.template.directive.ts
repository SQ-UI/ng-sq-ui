import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[sq-checkbox-label]',
  standalone: true,
})
export class SqCheckboxLabelTemplateDirective {
  readonly template = inject(TemplateRef);
}
