import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[sq-radio-label]',
  standalone: true,
})
export class SqRadiobuttonLabelTemplateDirective {
  readonly template = inject(TemplateRef);
}
