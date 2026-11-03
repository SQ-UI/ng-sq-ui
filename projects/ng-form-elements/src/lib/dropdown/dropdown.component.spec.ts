import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';
import { LabelValuePair } from '@sq-ui/ng-sq-common';

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
});
