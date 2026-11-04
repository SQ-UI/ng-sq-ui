import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';
import { LabelValuePair } from '@sq-ui/ng-sq-common';
import type { DropdownOption } from './dropdown.types';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;
  const testOptions: LabelValuePair[] = [
    {
      label: 'option 1',
      value: 1
    },
    {
      label: 'option 2',
      value: 2
    },
    {
      label: 'option 3',
      value: 3
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DropdownComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the dropdown value prop correctly when an option is chosen', () => {
    const selectedItem = testOptions[1];

    const subscription = component.onSelectItem.subscribe((chosenOption) => {
      expect(Object.is(chosenOption, selectedItem))
        .toBe(true);
    });

    expect(component.value()).toBe(null);

    component.selectOption(selectedItem);

    expect(!Object.is(component.value(), selectedItem))
      .toBe(true);

    expect(component.isOpen()).toBe(false);

    subscription.unsubscribe();
  });

  it('should close the dropdown after an option is selected', () => {
    fixture.componentRef.setInput('options', testOptions);
    component.toggleOptionsDropdown();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);

    const optionEls = (fixture.nativeElement as HTMLElement).querySelectorAll('.options .option');
    expect(optionEls.length).toBe(testOptions.length);

    (optionEls[1] as HTMLElement).click();
    fixture.detectChanges();

    // Selecting must not re-open the dropdown through the bubbling root click handler.
    expect(component.isOpen()).toBe(false);
    expect(component.value()?.value).toEqual(testOptions[1].value);
  });

  it('should toggle the options', () => {
    component.isOpen.set(false);
    component.listenForOutsideClick.set(false);

    component.toggleOptionsDropdown();
    expect(component.isOpen()).toBe(true);
    expect(component.listenForOutsideClick()).toBe(true);
  });

  it('keeps label-click opening and ignores the label while disabled', () => {
    fixture.componentRef.setInput('controlLabel', 'Choose an option');
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.sq-field-label') as HTMLElement).click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    component.onClickOutsideComponent();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.sq-field-label') as HTMLElement).click();
    expect(component.isOpen()).toBe(false);
  });

  it('should ignore toggling and selection while disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    component.toggleOptionsDropdown();
    component.selectOption(testOptions[0]);

    expect(component.isOpen()).toBe(false);
    expect(component.value()).toBeNull();
    expect(fixture.nativeElement.querySelector('.dropdown').getAttribute('tabindex')).toBe('-1');
  });

  it('should be focusable and emit touch when focus leaves it', () => {
    const touched = vi.fn();
    component.touch.subscribe(touched);
    const host: HTMLElement = fixture.nativeElement.querySelector('.dropdown');

    expect(host.getAttribute('tabindex')).toBe('0');
    expect(host.getAttribute('role')).toBe('combobox');

    host.dispatchEvent(new FocusEvent('focusout', { relatedTarget: document.body }));
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('should emit touch when an open dropdown is closed by an outside click', () => {
    const touched = vi.fn();
    component.touch.subscribe(touched);

    component.toggleOptionsDropdown();
    component.onClickOutsideComponent();
    component.onClickOutsideComponent();

    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('should support keyboard navigation and selection', () => {
    fixture.componentRef.setInput('options', testOptions);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('.dropdown');
    const press = (key: string) => {
      host.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
      fixture.detectChanges();
    };

    press('ArrowDown');
    expect(component.isOpen()).toBe(true);

    press('ArrowDown');
    press('ArrowDown');
    expect(component.activeIndex()).toBe(1);

    press('Enter');
    expect(component.value()?.value).toBe(2);
    expect(component.isOpen()).toBe(false);

    press(' ');
    expect(component.isOpen()).toBe(true);
    expect(component.activeIndex()).toBe(1);

    press('Escape');
    expect(component.isOpen()).toBe(false);
  });

  it('should close the dropdown onClickOutsideComponent', () => {
    component.isOpen.set(true);
    component.listenForOutsideClick.set(true);

    component.onClickOutsideComponent();
    expect(component.isOpen()).toBe(false);
    expect(component.listenForOutsideClick()).toBe(false);
  });

  it('ignores disabled options without closing or emitting a selection', () => {
    const disabled: DropdownOption = { label: 'Unavailable', value: 'disabled', disabled: true };
    const selected = vi.fn();
    component.onSelectItem.subscribe(selected);
    fixture.componentRef.setInput('options', [disabled]);
    component.toggleOptionsDropdown();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[role="option"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(component.value()).toBeNull();
    expect(component.isOpen()).toBe(true);
    expect(selected).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="option"]').getAttribute('aria-disabled')).toBe('true');
  });

  it('names an untitled trigger with its placeholder and prefers a visible label', () => {
    fixture.componentRef.setInput('controlPlaceholder', 'Choose a team');
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(trigger.getAttribute('aria-label')).toBe('Choose a team');
    fixture.componentRef.setInput('controlLabel', 'Team');
    fixture.detectChanges();
    expect(trigger.hasAttribute('aria-label')).toBe(false);
    expect(trigger.getAttribute('aria-labelledby')).toBe(component.controlId() + '-label');
  });

  it('skips disabled options and separates keyboard focus from the selected value', () => {
    fixture.componentRef.setInput('options', [testOptions[0], { ...testOptions[1], disabled: true }, testOptions[2]]);
    fixture.componentRef.setInput('value', { ...testOptions[0] });
    component.toggleOptionsDropdown();
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('.dropdown');
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    fixture.detectChanges();
    const options: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(component.activeIndex()).toBe(2);
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[2].getAttribute('aria-selected')).toBe('false');
    expect(host.getAttribute('aria-activedescendant')).toBe(options[2].id);
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    fixture.detectChanges();
    expect(component.value()?.value).toBe(testOptions[2].value);
    expect(component.isOpen()).toBe(false);
    expect(host.hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('keeps keyboard navigation safe when all options are disabled', () => {
    fixture.componentRef.setInput('options', testOptions.map(option => ({ ...option, disabled: true })));
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('.dropdown');
    for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'Enter']) {
      host.dispatchEvent(new KeyboardEvent('keydown', { key, cancelable: true }));
      fixture.detectChanges();
      expect(component.activeIndex()).toBe(-1);
      expect(component.value()).toBeNull();
    }
  });
});
