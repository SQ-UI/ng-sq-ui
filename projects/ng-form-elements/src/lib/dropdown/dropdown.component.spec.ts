import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        DropdownComponent
      ]
    })
      .compileComponents();
  }));

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

  it('should toggle the options', () => {
    component.isOpen.set(false);
    component.listenForOutsideClick.set(false);

    component.toggleOptionsDropdown();
    expect(component.isOpen()).toBe(true);
    expect(component.listenForOutsideClick()).toBe(true);
  });

  it('should close the dropdown onClickOutsideComponent', () => {
    component.isOpen.set(true);
    component.listenForOutsideClick.set(true);

    component.onClickOutsideComponent();
    expect(component.isOpen()).toBe(false);
    expect(component.listenForOutsideClick()).toBe(false);
  });
});
