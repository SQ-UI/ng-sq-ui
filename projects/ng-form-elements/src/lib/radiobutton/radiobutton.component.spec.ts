import { TestBed } from '@angular/core/testing';

import { RadiobuttonComponent } from './radiobutton.component';

function stubReadonlySignal<T>(component: RadiobuttonComponent, name: 'name' | 'radioValue', value: T): void {
  Object.defineProperty(component, name, { value: () => value, configurable: true });
}

describe('RadiobuttonComponent', () => {
  let component: RadiobuttonComponent;
  let radio2: RadiobuttonComponent;
  const groupName = 'testGroupName';
  const radioValue = 'testValue';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new RadiobuttonComponent());
    radio2 = TestBed.runInInjectionContext(() => new RadiobuttonComponent());

    stubReadonlySignal(component, 'name', groupName);
    stubReadonlySignal(component, 'radioValue', radioValue);
    stubReadonlySignal(radio2, 'name', groupName);
    stubReadonlySignal(radio2, 'radioValue', 'radio2Value');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the radiobutton correctly when clicked, deselecting its siblings', () => {
    component.selectRadio();
    expect(component.isSelected()).toBe(true);
    expect(radio2.isSelected()).toBe(false);

    radio2.selectRadio();
    expect(component.isSelected()).toBe(false);
    expect(radio2.isSelected()).toBe(true);
  });
});
