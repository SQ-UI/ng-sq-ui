import { Component, OnDestroy, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TabComponent } from './tab.component';
import { TabContentDirective, TabLabelDirective } from './tab-template.directive';
import { TabChangeEvent, TabCloseEvent, TabsActivation, TabsComponent, TabsOrientation } from './tabs.component';

@Component({ selector: 'sq-lifecycle-probe', template: '<input aria-label="Panel input">' })
class LifecycleProbe implements OnDestroy {
  static created = 0;
  static destroyed = 0;
  constructor() { LifecycleProbe.created++; }
  ngOnDestroy(): void { LifecycleProbe.destroyed++; }
}

interface Definition { id: string; label: string; disabled?: boolean; hidden?: boolean; closable?: boolean; }

@Component({
  imports: [TabsComponent, TabComponent, TabContentDirective, TabLabelDirective, LifecycleProbe],
  template: `<form (submit)="submitted = true; $event.preventDefault()">
    <h2 id="heading">Workspace</h2>
    <sq-tabs [(activeTab)]="active" [activation]="activation()" [orientation]="orientation()"
             [direction]="direction()" [preserveContent]="preserve()" [disabled]="disabled()"
             [ariaLabelledby]="labelledby()" (selectionChange)="changes.push($event)" (tabClose)="close($event)">
      @for (tab of definitions(); track tab.id) {
        <sq-tab [id]="tab.id" [label]="tab.label" [disabled]="tab.disabled || false" [hidden]="tab.hidden || false"
                [closable]="tab.closable || false" icon="example-icon" [badge]="0">
          @if (tab.id === 'custom') {
            <ng-template sq-tab-label><strong>Custom header</strong></ng-template>
          }
          <ng-template sq-tab-content><p>{{tab.label}} content</p><sq-lifecycle-probe /></ng-template>
        </sq-tab>
      }
    </sq-tabs>
  </form><button id="outside" type="button">Outside</button>`,
})
class TabsHost {
  readonly definitions = signal<Definition[]>([
    { id: 'overview', label: 'Overview' },
    { id: 'disabled', label: 'Unavailable', disabled: true },
    { id: 'activity', label: 'Activity', closable: true },
    { id: 'custom', label: 'Custom', closable: true },
  ]);
  readonly active = signal<string | null>(null);
  readonly activation = signal<TabsActivation>('automatic');
  readonly orientation = signal<TabsOrientation>('horizontal');
  readonly direction = signal<'ltr' | 'rtl' | null>(null);
  readonly preserve = signal(false);
  readonly disabled = signal(false);
  readonly labelledby = signal<string | null>(null);
  readonly changes: TabChangeEvent[] = [];
  readonly closed: TabCloseEvent[] = [];
  honorClose = false;
  submitted = false;
  close(event: TabCloseEvent): void {
    this.closed.push(event);
    if (this.honorClose) this.definitions.update(tabs => tabs.filter(tab => tab.id !== event.tabId));
  }
}

@Component({
  imports: [TabsComponent, TabComponent],
  template: `<sq-tabs ariaLabel="Outer"><sq-tab id="outer" label="Outer">
    <p>Projected body</p>
    <sq-tabs ariaLabel="Inner"><sq-tab id="inner" label="Inner">Inner content</sq-tab></sq-tabs>
  </sq-tab><sq-tab id="other" label="Other">Other body</sq-tab></sq-tabs>`,
})
class NestedHost {}

describe('TabsComponent', () => {
  beforeEach(() => { LifecycleProbe.created = 0; LifecycleProbe.destroyed = 0; });

  async function create(setup?: (host: TabsHost) => void) {
    const fixture = TestBed.createComponent(TabsHost);
    setup?.(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const buttons = () => [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = () => [...root.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    const key = async (button: HTMLElement, name: string, options: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...options });
      button.dispatchEvent(event);
      await fixture.whenStable();
      return event;
    };
    return { fixture, host: fixture.componentInstance, root, buttons, panels, key };
  }

  it('selects the first enabled tab with matching ARIA references and one tab stop', async () => {
    const { root, host, buttons, panels } = await create();
    expect(host.active()).toBe('overview');
    expect(root.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Tabs');
    buttons().forEach((button, index) => {
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-controls')).toBe(panels()[index].id);
      expect(panels()[index].getAttribute('aria-labelledby')).toBe(button.id);
      expect(button.getAttribute('aria-selected')).toBe(String(index === 0));
      expect(panels()[index].hidden).toBe(index !== 0);
    });
    expect(buttons().filter(button => button.tabIndex === 0)).toHaveLength(1);
    expect([...root.querySelectorAll<HTMLButtonElement>('.tab-close')].every(button => button.tabIndex === -1)).toBe(true);
    expect(host.changes).toEqual([{ tabId: 'overview', previousTabId: null, index: 0 }]);
  });

  it('honors initial selection and external model updates without stealing outside focus', async () => {
    const { fixture, host, root, buttons } = await create(host => host.active.set('activity'));
    expect(buttons()[2].getAttribute('aria-selected')).toBe('true');
    const outside = root.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    host.active.set('custom');
    await fixture.whenStable();
    expect(buttons()[3].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(outside);
  });

  it('emits one change per selection and does not submit an enclosing form', async () => {
    const { fixture, host, buttons } = await create();
    buttons()[2].click();
    await fixture.whenStable();
    buttons()[2].click();
    await fixture.whenStable();
    expect(host.active()).toBe('activity');
    expect(host.changes).toHaveLength(2);
    expect(host.changes[1]).toEqual({ tabId: 'activity', previousTabId: 'overview', index: 2 });
    expect(host.submitted).toBe(false);
  });

  it('renders icons, zero badges and custom label templates', async () => {
    const { buttons } = await create();
    expect(buttons()[0].querySelector('.example-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(buttons()[0].querySelector('.tab-badge')?.textContent).toBe('0');
    expect(buttons()[3].querySelector('strong')?.textContent).toBe('Custom header');
  });

  it('uses an external accessible label when supplied', async () => {
    const { root } = await create(host => host.labelledby.set('heading'));
    expect(root.querySelector('[role="tablist"]')?.getAttribute('aria-labelledby')).toBe('heading');
    expect(root.querySelector('[role="tablist"]')?.hasAttribute('aria-label')).toBe(false);
  });

  it('wraps horizontal navigation, skipping disabled tabs, and supports Home/End', async () => {
    const { host, buttons, key } = await create();
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    expect(document.activeElement).toBe(buttons()[2]);
    expect(host.active()).toBe('activity');
    await key(buttons()[2], 'End');
    expect(host.active()).toBe('custom');
    await key(buttons()[3], 'ArrowRight');
    expect(host.active()).toBe('overview');
    await key(buttons()[0], 'ArrowLeft');
    expect(host.active()).toBe('custom');
    await key(buttons()[3], 'Home');
    expect(host.active()).toBe('overview');
    expect((await key(buttons()[0], 'ArrowDown')).defaultPrevented).toBe(false);
    expect((await key(buttons()[0], 'ArrowRight', { ctrlKey: true })).defaultPrevented).toBe(false);
  });

  it('keeps selection on manual arrow navigation until Enter or Space activates it', async () => {
    const { host, buttons, key } = await create(host => host.activation.set('manual'));
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    expect(document.activeElement).toBe(buttons()[2]);
    expect(host.active()).toBe('overview');
    await key(buttons()[2], 'Enter');
    expect(host.active()).toBe('activity');
    await key(buttons()[2], 'End');
    expect(host.active()).toBe('activity');
    await key(buttons()[3], ' ');
    expect(host.active()).toBe('custom');
  });

  it('moves the tab stop with manual focus and restores the selected entry point on leaving', async () => {
    const { fixture, host, root, buttons, key } = await create(host => {
      host.activation.set('manual');
      host.active.set('custom');
    });
    buttons()[3].focus();
    await key(buttons()[3], 'Home');
    expect(host.active()).toBe('custom');
    expect(buttons().filter(button => button.tabIndex === 0)).toEqual([buttons()[0]]);

    root.querySelector<HTMLButtonElement>('#outside')!.focus();
    await fixture.whenStable();
    expect(buttons().filter(button => button.tabIndex === 0)).toEqual([buttons()[3]]);
  });

  it('navigates vertically with Up/Down while leaving Left/Right untouched', async () => {
    const { root, host, buttons, key } = await create(host => host.orientation.set('vertical'));
    expect(root.querySelector('[role="tablist"]')?.getAttribute('aria-orientation')).toBe('vertical');
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowUp');
    expect(host.active()).toBe('custom');
    await key(buttons()[3], 'ArrowDown');
    expect(host.active()).toBe('overview');
    expect((await key(buttons()[0], 'ArrowRight')).defaultPrevented).toBe(false);
  });

  it('reverses horizontal arrows in RTL, including inherited direction', async () => {
    const { fixture, host, buttons, key } = await create(host => host.direction.set('rtl'));
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    expect(host.active()).toBe('custom');
    host.direction.set(null);
    await fixture.whenStable();
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration);
    await key(buttons()[3], 'ArrowLeft');
    expect(host.active()).toBe('overview');
  });

  it('does not select, focus or close disabled tabs', async () => {
    const { fixture, host, buttons, key } = await create();
    expect(buttons()[1].disabled).toBe(true);
    buttons()[1].click();
    await key(buttons()[1], 'Enter');
    host.disabled.set(true);
    await fixture.whenStable();
    expect(buttons().every(button => button.disabled)).toBe(true);
    buttons()[2].click();
    await key(buttons()[2], 'Delete');
    expect(host.active()).toBe('overview');
    expect(host.closed).toHaveLength(0);
  });

  it('falls back from invalid, disabled and hidden selections', async () => {
    const { fixture, host } = await create(host => host.active.set('missing'));
    expect(host.active()).toBe('overview');
    host.active.set('disabled');
    await fixture.whenStable();
    expect(host.active()).toBe('overview');
    host.definitions.update(tabs => tabs.map(tab => ({ ...tab, hidden: tab.id === 'overview' })));
    await fixture.whenStable();
    expect(host.active()).toBe('activity');
  });

  it('selects a neighbor on removal and preserves selection on reordering or insertion', async () => {
    const { fixture, host } = await create(host => host.active.set('activity'));
    host.definitions.update(tabs => [...tabs].reverse());
    await fixture.whenStable();
    expect(host.active()).toBe('activity');
    expect(host.changes).toHaveLength(1);
    host.definitions.update(tabs => tabs.filter(tab => tab.id !== 'activity'));
    await fixture.whenStable();
    expect(host.active()).toBe('overview');
    host.definitions.update(tabs => [{ id: 'new', label: 'New' }, ...tabs]);
    await fixture.whenStable();
    expect(host.active()).toBe('overview');
  });

  it('selects the previous enabled neighbor when removing the last tab', async () => {
    const { fixture, host } = await create(host => host.active.set('custom'));
    host.definitions.update(tabs => tabs.filter(tab => tab.id !== 'custom'));
    await fixture.whenStable();
    expect(host.active()).toBe('activity');
  });

  it.each([
    { selected: 'b', remaining: ['c', 'd'], expected: 'c' },
    { selected: 'b', remaining: ['d', 'c'], expected: 'c' },
    { selected: 'd', remaining: ['a', 'b'], expected: 'b' },
  ])('resolves $selected to its surviving neighbor $expected after a batched update', async ({ selected, remaining, expected }) => {
    const { fixture, host } = await create(host => {
      host.definitions.set(['a', 'b', 'c', 'd'].map(id => ({ id, label: id })));
      host.active.set(selected);
    });
    host.definitions.update(tabs => remaining.map(id => tabs.find(tab => tab.id === id)!));
    await fixture.whenStable();
    expect(host.active()).toBe(expected);
    expect(host.changes.at(-1)).toEqual({ tabId: expected, previousTabId: selected, index: remaining.indexOf(expected) });
  });

  it('handles empty/all-disabled groups and selects a new enabled tab when it appears', async () => {
    const { fixture, host, buttons, panels } = await create(host => host.definitions.set([]));
    expect(host.active()).toBeNull();
    expect(buttons()).toHaveLength(0);
    expect(panels()).toHaveLength(0);
    host.definitions.set([{ id: 'only', label: 'Only', disabled: true }]);
    await fixture.whenStable();
    expect(host.active()).toBeNull();
    host.definitions.set([{ id: 'only', label: 'Only' }]);
    await fixture.whenStable();
    expect(host.active()).toBe('only');
  });

  it('emits close requests through Delete and a separate button without removing or selecting tabs', async () => {
    const { root, host, buttons, key } = await create();
    await key(buttons()[2], 'Delete');
    root.querySelector<HTMLButtonElement>('.tab-close')!.click();
    expect(host.closed).toEqual([{ tabId: 'activity', index: 2 }, { tabId: 'activity', index: 2 }]);
    expect(buttons()).toHaveLength(4);
    expect(host.active()).toBe('overview');
    expect(root.querySelector('.tab-close')?.getAttribute('aria-label')).toBe('Close Activity');
  });

  it('restores focus to a neighbor after a focused tab is closed', async () => {
    const { fixture, host, buttons, key } = await create(host => { host.honorClose = true; });
    buttons()[2].focus();
    await fixture.whenStable();
    await key(buttons()[2], 'Delete');
    expect(host.active()).toBe('custom');
    expect(document.activeElement).toBe(buttons()[2]);
    await key(buttons()[2], 'Delete');
    expect(host.active()).toBe('overview');
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('restores focus after the close button removes its tab and handles closing the final tab', async () => {
    const { fixture, host, root } = await create(host => {
      host.honorClose = true;
      host.definitions.set([{ id: 'only', label: 'Only', closable: true }]);
    });
    const close = root.querySelector<HTMLButtonElement>('.tab-close')!;
    close.focus();
    close.click();
    await fixture.whenStable();
    expect(host.active()).toBeNull();
    expect(document.activeElement).toBe(root.querySelector('.tabs'));
  });

  it('moves focus to a neighbor when closing an unselected header in manual mode', async () => {
    const { fixture, host, buttons, key } = await create(host => {
      host.honorClose = true;
      host.activation.set('manual');
    });
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    await key(buttons()[2], 'Delete');
    expect(host.active()).toBe('overview');
    expect(document.activeElement).toBe(buttons()[2]);
    await key(buttons()[2], 'Enter');
    expect(host.active()).toBe('custom');
  });

  it('keeps the focused replacement visible when closing an unselected manual header', async () => {
    const { fixture, host, root, buttons, key } = await create(host => {
      host.honorClose = true;
      host.activation.set('manual');
    });
    const list = root.querySelector<HTMLElement>('[role="tablist"]')!;
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 40));
    buttons().forEach(button => {
      vi.spyOn(button, 'getBoundingClientRect').mockImplementation(() =>
        new DOMRect(buttons().indexOf(button) * 100 - list.scrollLeft, 0, 100, 40));
    });
    buttons()[3].focus();
    await fixture.whenStable();
    await key(buttons()[3], 'Delete');
    expect(host.active()).toBe('overview');
    expect(document.activeElement).toBe(buttons()[2]);
    expect(list.scrollLeft).toBe(200);
    expect(buttons()[2].getBoundingClientRect().left).toBe(0);
  });

  it('uses surviving IDs to restore manual focus after multiple tabs disappear together', async () => {
    const { fixture, host, buttons } = await create(host => {
      host.activation.set('manual');
      host.definitions.set(['a', 'b', 'c', 'd'].map(id => ({ id, label: id })));
    });
    buttons()[1].focus();
    await fixture.whenStable();
    host.definitions.update(tabs => tabs.filter(tab => tab.id === 'c' || tab.id === 'd'));
    await fixture.whenStable();
    expect(host.active()).toBe('c');
    expect(document.activeElement).toBe(buttons()[0]);
  });

  it('recovers manual focus when an unselected header is disabled', async () => {
    const { fixture, host, buttons, key } = await create(host => host.activation.set('manual'));
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    host.definitions.update(tabs => tabs.map(tab => tab.id === 'activity' ? { ...tab, disabled: true } : tab));
    await fixture.whenStable();
    expect(host.active()).toBe('overview');
    expect(document.activeElement).toBe(buttons()[3]);
    expect(buttons().filter(button => button.tabIndex === 0)).toEqual([buttons()[3]]);
  });

  it('preserves outside focus when a previously focused manual header is disabled', async () => {
    const { fixture, host, root, buttons, key } = await create(host => host.activation.set('manual'));
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    const outside = root.querySelector<HTMLButtonElement>('#outside')!;
    outside.focus();
    await fixture.whenStable();
    host.definitions.update(tabs => tabs.map(tab => tab.id === 'activity' ? { ...tab, disabled: true } : tab));
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
    expect(buttons().filter(button => button.tabIndex === 0)).toEqual([buttons()[0]]);
  });

  it('falls back to the group when it is disabled with focus on an unselected manual header', async () => {
    const { fixture, host, root, buttons, key } = await create(host => host.activation.set('manual'));
    buttons()[0].focus();
    await key(buttons()[0], 'ArrowRight');
    host.disabled.set(true);
    await fixture.whenStable();
    expect(host.active()).toBe('overview');
    expect(document.activeElement).toBe(root.querySelector('.tabs'));
    expect(buttons().filter(button => button.tabIndex === 0)).toHaveLength(0);
  });

  it('moves focus away from a tab that becomes disabled', async () => {
    const { fixture, host, buttons } = await create();
    buttons()[2].focus();
    await fixture.whenStable();
    host.definitions.update(tabs => tabs.map(tab => tab.id === 'activity' ? { ...tab, disabled: true } : tab));
    await fixture.whenStable();
    expect(host.active()).toBe('custom');
    expect(document.activeElement).toBe(buttons()[3]);
  });

  it('creates lazy bodies only on activation and destroys them on leaving by default', async () => {
    const { fixture, buttons, panels } = await create();
    expect(LifecycleProbe.created).toBe(1);
    expect(panels()[2].querySelector('input')).toBeNull();
    buttons()[2].click();
    await fixture.whenStable();
    expect(LifecycleProbe.created).toBe(2);
    expect(LifecycleProbe.destroyed).toBe(1);
    expect(panels()[0].querySelector('input')).toBeNull();
    buttons()[0].click();
    await fixture.whenStable();
    expect(LifecycleProbe.created).toBe(3);
  });

  it('preserves visited lazy panel instances and entered values when requested', async () => {
    const { fixture, buttons, panels } = await create(host => host.preserve.set(true));
    const input = panels()[0].querySelector('input')!;
    input.value = 'Keep my draft';
    buttons()[2].click();
    await fixture.whenStable();
    expect(LifecycleProbe.created).toBe(2);
    expect(LifecycleProbe.destroyed).toBe(0);
    expect(panels()[0].hidden).toBe(true);
    buttons()[0].click();
    await fixture.whenStable();
    expect(panels()[0].querySelector('input')).toBe(input);
    expect(input.value).toBe('Keep my draft');
    expect(LifecycleProbe.created).toBe(2);
  });

  it('destroys retained inactive views when preservation is turned off', async () => {
    const { fixture, host, buttons } = await create(host => host.preserve.set(true));
    buttons()[2].click();
    await fixture.whenStable();
    host.preserve.set(false);
    await fixture.whenStable();
    expect(LifecycleProbe.destroyed).toBe(1);
  });

  it('keeps nested tab groups independent and supports ordinary projected content', async () => {
    const fixture = TestBed.createComponent(NestedHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const groups = fixture.debugElement.queryAll(By.directive(TabsComponent));
    expect(groups).toHaveLength(2);
    expect(groups[0].componentInstance.tabs()).toHaveLength(2);
    expect(groups[1].componentInstance.tabs()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Projected body');
    const ids = [...fixture.nativeElement.querySelectorAll('[id]')].map(element => (element as HTMLElement).id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
