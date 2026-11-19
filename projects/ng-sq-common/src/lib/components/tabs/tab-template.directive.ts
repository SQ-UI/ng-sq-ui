import { Directive, inject, TemplateRef } from '@angular/core';

/** Custom, non-interactive header content. Use ariaLabel for icon-only labels. */
@Directive({ selector: 'ng-template[sq-tab-label]' })
export class TabLabelDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Instantiates the panel body only when its tab is selected. */
@Directive({ selector: 'ng-template[sq-tab-content]' })
export class TabContentDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
