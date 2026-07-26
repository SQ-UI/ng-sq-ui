import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DropdownComponent } from './dropdown.component';
import { LabelValuePair } from '@sq-ui/ng-sq-common';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  const testOptions: LabelValuePair[] = [
    { label: 'option 1', value: 1 },
    { label: 'option 2', value: 2 },
    { label: 'option 3', value: 3 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new DropdownComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the dropdown value correctly when an option is chosen', () => {
    const selectedItem = testOptions[1];
    const onSelectItem = vi.fn();
    component.onSelectItem.subscribe(onSelectItem);

    expect(component.value()).toBeNull();

    component.selectOption(selectedItem);

    expect(onSelectItem).toHaveBeenCalledWith(selectedItem);
    expect(component.value()).toEqual(selectedItem);
    expect(Object.is(component.value(), selectedItem)).toBe(false);
    expect(component.listenForOutsideClick()).toBe(false);
  });

  it('should toggle the options', () => {
    expect(component.isOpen()).toBe(false);

    component.toggleOptionsDropdown();

    expect(component.isOpen()).toBe(true);
    expect(component.listenForOutsideClick()).toBe(true);
  });

  it('should close the dropdown onClickOutsideComponent', () => {
    component.toggleOptionsDropdown();

    component.onClickOutsideComponent();

    expect(component.isOpen()).toBe(false);
    expect(component.listenForOutsideClick()).toBe(false);
  });
});
