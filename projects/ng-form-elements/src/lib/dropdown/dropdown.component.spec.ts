import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';
import { FormsModule } from '@angular/forms';
import { OutsideClickListenerDirective } from '@sq-ui/ng-sq-common';
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
      declarations: [
        DropdownComponent,
        OutsideClickListenerDirective
      ],
      imports: [
        FormsModule
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
        .toBe(true, 'emitted option is the chosen one');
    });

    expect(component.value).toBe(undefined);

    component.selectOption(selectedItem);

    expect(!Object.is(component.value, selectedItem))
      .toBe(true, 'populated after choosing an item');

    expect(component.isOpen).toBe(false);

    subscription.unsubscribe();
  });

  it('should toggle the options', () => {
    component.isOpen = false;
    component.listenForOutsideClick = false;

    component.toggleOptionsDropdown();
    expect(component.isOpen).toBe(true);
    expect(component.listenForOutsideClick).toBe(true);
  });

  it('should close the dropdown onClickOutsideComponent', () => {
    component.isOpen = true;
    component.listenForOutsideClick = true;

    component.onClickOutsideComponent();
    expect(component.isOpen).toBe(false);
    expect(component.listenForOutsideClick).toBe(false);
  });
});
