import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TabComponent, TabContentDirective, TabLabelDirective, TabsComponent,
  type TabCloseEvent, type TabsActivation, type TabsAppearance, type TabsSize,
} from '@sq-ui/ng-sq-common';

@Component({
  selector: 'sq-tabs-preview',
  imports: [TabsComponent, TabComponent, TabContentDirective, TabLabelDirective],
  templateUrl: './tabs-preview.component.html',
  styleUrls: ['./tabs-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPreviewComponent {
  readonly appearances: TabsAppearance[] = ['underline', 'pills', 'enclosed'];
  readonly sizes: TabsSize[] = ['s', 'm', 'l'];
  readonly appearance = signal<TabsAppearance>('underline');
  readonly size = signal<TabsSize>('m');
  readonly vertical = signal(false);
  readonly rtl = signal(false);
  readonly manual = signal(false);
  readonly preserve = signal(true);
  readonly stretch = signal(false);
  readonly disabled = signal(false);
  readonly active = signal<string | null>('overview');
  readonly status = signal('');
  readonly tabs = signal([
    { id: 'overview', label: 'Overview', icon: 'fa-solid fa-layer-group', badge: null as number | null, disabled: false, closable: false },
    { id: 'activity', label: 'Activity', icon: 'fa-regular fa-bell', badge: 8, disabled: false, closable: true },
    { id: 'settings', label: 'Settings', icon: 'fa-solid fa-sliders', badge: null, disabled: false, closable: true },
    { id: 'unavailable', label: 'Archived', icon: 'fa-solid fa-lock', badge: null, disabled: true, closable: false },
  ]);
  readonly manualActivation: TabsActivation = 'manual';
  private nextId = 1;

  addTab(): void {
    const number = this.nextId++;
    const id = `document-${number}`;
    this.tabs.update(tabs => [...tabs, { id, label: `Document ${number}`, icon: 'fa-regular fa-file', badge: null, disabled: false, closable: true }]);
    this.active.set(id);
    this.status.set(`Document ${number} added`);
  }

  closeTab(event: TabCloseEvent): void {
    const label = this.tabs().find(tab => tab.id === event.tabId)?.label;
    this.tabs.update(tabs => tabs.filter(tab => tab.id !== event.tabId));
    this.status.set(`${label} closed`);
  }
}
