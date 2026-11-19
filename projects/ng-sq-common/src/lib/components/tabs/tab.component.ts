import { booleanAttribute, ChangeDetectionStrategy, Component, contentChild, input, TemplateRef, viewChild } from '@angular/core';
import { TabContentDirective, TabLabelDirective } from './tab-template.directive';

let nextTabId = 0;

/** A declarative tab definition. Its parent sq-tabs renders the header and panel. */
@Component({
  selector: 'sq-tab',
  template: '<ng-template #body><ng-content /></ng-template>',
  styles: ':host { display: none; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  /** Unique within a group; supply a stable ID when using activeTab. */
  readonly id = input(`sq-tab-${nextTabId++}`);
  readonly label = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly icon = input('');
  readonly badge = input<string | number | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hidden = input(false, { transform: booleanAttribute });
  readonly closable = input(false, { transform: booleanAttribute });
  readonly closeLabel = input<string | null>(null);
  readonly labelTemplate = contentChild(TabLabelDirective);
  readonly lazyContent = contentChild(TabContentDirective);
  readonly body = viewChild.required<TemplateRef<unknown>>('body');
}
