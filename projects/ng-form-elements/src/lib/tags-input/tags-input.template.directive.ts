import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  selector: '[sq-tag]',
  standalone: true,
})
export class SqTagTemplateDirective {
  readonly template = inject(TemplateRef);
}
