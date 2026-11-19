import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  AfterContentChecked, afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed,
  contentChildren, ElementRef, inject, input, model, output, signal, viewChildren,
} from '@angular/core';
import { TabComponent } from './tab.component';

export type TabsAppearance = 'underline' | 'pills' | 'enclosed';
export type TabsSize = 's' | 'm' | 'l';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'automatic' | 'manual';

export interface TabChangeEvent {
  tabId: string | null;
  previousTabId: string | null;
  /** Index in the visible tab collection, including disabled tabs. -1 when empty. */
  index: number;
}

export interface TabCloseEvent {
  tabId: string;
  index: number;
}

let nextTabsId = 0;

@Component({
  selector: 'sq-tabs',
  imports: [NgTemplateOutlet],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterContentChecked {
  readonly activeTab = model<string | null>(null);
  readonly ariaLabel = input('Tabs');
  readonly ariaLabelledby = input<string | null>(null);
  readonly appearance = input<TabsAppearance>('underline');
  readonly size = input<TabsSize>('m');
  readonly orientation = input<TabsOrientation>('horizontal');
  readonly activation = input<TabsActivation>('automatic');
  /** Omit to inherit the document/ancestor direction. */
  readonly direction = input<'ltr' | 'rtl' | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly stretch = input(false, { transform: booleanAttribute });
  readonly preserveContent = input(false, { transform: booleanAttribute });
  readonly selectionChange = output<TabChangeEvent>();
  /** Request only: the consumer removes the tab, or leaves it open. */
  readonly tabClose = output<TabCloseEvent>();

  readonly tabs = contentChildren(TabComponent);
  readonly visibleTabs = computed(() => this.tabs().filter(tab => !tab.hidden()));
  readonly selectedTab = computed(() => this.visibleTabs().find(tab => tab.id() === this.activeTab() && !tab.disabled()) ?? null);
  readonly tabStop = computed(() => this.disabled() ? null
    : this.enabledTabs().find(tab => tab.id() === this.focusedTabId()) ?? this.selectedTab());
  readonly visited = signal<ReadonlySet<TabComponent>>(new Set());
  readonly groupId = `sq-tabs-${nextTabsId++}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  private readonly enabledTabs = computed(() => this.visibleTabs().filter(tab => !tab.disabled()));
  private readonly focusedTabId = signal<string | null>(null);
  private previousTabIds: readonly string[] = [];
  private previousId: string | null = null;
  private focusedButton: HTMLButtonElement | null = null;
  private focusedId: string | null = null;
  private focusedOrder: readonly string[] = [];

  // Projected definitions (including @for bindings) must finish updating before
  // reconciling IDs and disabled state. A component effect runs too early here.
  ngAfterContentChecked(): void {
    const tabs = this.visibleTabs();
    const requested = this.activeTab();
    let selected = tabs.find(tab => tab.id() === requested && !tab.disabled()) ?? null;
    if (!selected) {
      selected = this.resolveNeighbor(this.previousId, this.previousTabIds, this.enabledTabs());
    }
    const id = selected?.id() ?? null;
    if (requested !== id) this.activeTab.set(id);
    const visited = new Set([...this.visited()].filter(tab => tabs.includes(tab)));
    if (selected) visited.add(selected);
    if (visited.size !== this.visited().size || [...visited].some(tab => !this.visited().has(tab))) {
      this.visited.set(visited);
    }
    if (id !== this.previousId) {
      this.selectionChange.emit({ tabId: id, previousTabId: this.previousId, index: selected ? tabs.indexOf(selected) : -1 });
    }
    this.previousTabIds = tabs.map(tab => tab.id());
    this.previousId = id;
  }

  constructor() {
    afterRenderEffect(() => {
      const selected = this.selectedTab();
      const tabs = this.visibleTabs();
      const enabled = this.disabled() ? [] : this.enabledTabs();
      // Follow availability even when a manual focus move leaves selection unchanged.
      this.focusedTabId();
      const buttons = this.tabButtons().map(button => button.nativeElement);
      const focused = this.focusedButton;
      const needsFocus = focused && (!focused.isConnected || focused.disabled);
      if (needsFocus) this.focusedButton = null;
      if (needsFocus && (this.document.activeElement === this.document.body || this.document.activeElement === focused)) {
        const neighbor = this.resolveNeighbor(this.focusedId, this.focusedOrder, enabled);
        const next = buttons.find(button => neighbor && button.id === this.headerId(neighbor));
        if (next) next.focus({ preventScroll: true });
        else this.host.nativeElement.querySelector<HTMLElement>('.tabs')?.focus({ preventScroll: true });
      }
      const current = this.document.activeElement;
      const focusedHeader = buttons.find(button => button === current || button.parentElement?.contains(current));
      if (focusedHeader && !focusedHeader.disabled) {
        this.focusedId = tabs[buttons.indexOf(focusedHeader)].id();
        this.focusedOrder = tabs.map(tab => tab.id());
        this.reveal(current as HTMLElement);
        return;
      }
      const active = buttons.find(button => selected && button.id === this.headerId(selected));
      // Reveal selection only when keyboard focus is outside the header list.
      if (active) this.reveal(active);
    });
  }

  headerId(tab: TabComponent): string { return `${this.groupId}-tab-${encodeURIComponent(tab.id())}`; }
  panelId(tab: TabComponent): string { return `${this.groupId}-panel-${encodeURIComponent(tab.id())}`; }

  select(tab: TabComponent): void {
    if (!this.disabled() && !tab.disabled() && !tab.hidden()) this.activeTab.set(tab.id());
  }

  onFocus(tab: TabComponent, event: FocusEvent): void {
    const button = event.target as HTMLButtonElement;
    this.rememberFocus(tab, button);
    this.reveal(button);
    if (this.activation() === 'automatic') this.select(tab);
  }

  onCloseFocus(tab: TabComponent, event: FocusEvent): void {
    const button = event.target as HTMLButtonElement;
    this.rememberFocus(tab, button);
    this.reveal(button);
  }

  onListFocusOut(event: FocusEvent): void {
    const list = event.currentTarget as HTMLElement;
    if (list.contains(event.relatedTarget as Node | null)) return;
    this.focusedTabId.set(null);
    // A null destination may be the browser blurring a removed/disabled button;
    // retain that reference until the after-render recovery check can inspect it.
    if (event.relatedTarget) this.focusedButton = null;
  }

  requestClose(tab: TabComponent): void {
    if (!this.disabled() && !tab.disabled() && !tab.hidden() && tab.closable()) {
      this.tabClose.emit({ tabId: tab.id(), index: this.visibleTabs().indexOf(tab) });
    }
  }

  onKeydown(event: KeyboardEvent, tab: TabComponent): void {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || this.disabled() || tab.disabled()) return;
    if (event.key === 'Delete' && tab.closable()) {
      event.preventDefault();
      this.requestClose(tab);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select(tab);
      return;
    }
    const enabled = this.enabledTabs();
    const index = enabled.indexOf(tab);
    const vertical = this.orientation() === 'vertical';
    const rtl = this.direction() === 'rtl' || (!this.direction() && this.document.defaultView?.getComputedStyle(this.host.nativeElement).direction === 'rtl');
    let next: TabComponent | undefined;
    if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled.at(-1);
    else {
      let step = 0;
      if (vertical && event.key === 'ArrowDown') step = 1;
      if (vertical && event.key === 'ArrowUp') step = -1;
      if (!vertical && event.key === 'ArrowRight') step = rtl ? -1 : 1;
      if (!vertical && event.key === 'ArrowLeft') step = rtl ? 1 : -1;
      if (step) next = enabled[(index + step + enabled.length) % enabled.length];
    }
    if (!next) return;
    event.preventDefault();
    this.tabButtons().find(button => button.nativeElement.id === this.headerId(next!))?.nativeElement.focus({ preventScroll: true });
  }

  private rememberFocus(tab: TabComponent, button: HTMLButtonElement): void {
    this.focusedButton = button;
    this.focusedId = tab.id();
    this.focusedOrder = this.visibleTabs().map(item => item.id());
    this.focusedTabId.set(tab.id());
  }

  private resolveNeighbor(id: string | null, previousIds: readonly string[], enabled: readonly TabComponent[]): TabComponent | null {
    const byId = new Map(enabled.map(tab => [tab.id(), tab]));
    if (id !== null && byId.has(id)) return byId.get(id)!;
    const index = id === null ? -1 : previousIds.indexOf(id);
    if (index >= 0) {
      // Walk the previous order by ID so batched removals cannot skip a survivor.
      const neighbors = [...previousIds.slice(index + 1), ...previousIds.slice(0, index).reverse()];
      for (const neighbor of neighbors) {
        const tab = byId.get(neighbor);
        if (tab) return tab;
      }
    }
    return enabled[0] ?? null;
  }

  private reveal(button: HTMLElement): void {
    const list = button.closest<HTMLElement>('[role="tablist"]');
    if (!list) return;
    const bounds = list.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    if (this.orientation() === 'vertical') {
      if (rect.top < bounds.top) list.scrollTop += rect.top - bounds.top;
      else if (rect.bottom > bounds.bottom) list.scrollTop += rect.bottom - bounds.bottom;
    } else {
      if (rect.left < bounds.left) list.scrollLeft += rect.left - bounds.left;
      else if (rect.right > bounds.right) list.scrollLeft += rect.right - bounds.right;
    }
  }
}
