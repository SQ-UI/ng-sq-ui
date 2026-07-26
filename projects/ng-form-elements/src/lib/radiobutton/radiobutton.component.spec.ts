import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiobuttonComponent } from './radiobutton.component';

describe('RadiobuttonComponent', () => {
  let component: RadiobuttonComponent;
  let fixture: ComponentFixture<RadiobuttonComponent>;
  const groupName = 'testGroupName';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RadiobuttonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiobuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select the radiobutton correctly when clicked', () => {
    const radio2Fixture = TestBed.createComponent(RadiobuttonComponent);
    const radio2 = radio2Fixture.componentInstance;
    radio2Fixture.detectChanges();

    fixture.componentRef.setInput('radioValue', 'testValue');
    fixture.componentRef.setInput('name', groupName);

    radio2Fixture.componentRef.setInput('radioValue', 'radio2Value');
    radio2Fixture.componentRef.setInput('name', groupName);

    fixture.detectChanges();
    radio2Fixture.detectChanges();

    component.selectRadio();
    expect(component.isSelected()).toBe(true);
    expect(radio2.isSelected()).toBe(false);

    radio2.selectRadio();
    expect(component.isSelected()).toBe(false);
    expect(radio2.isSelected()).toBe(true);
  });

  it('should update value model when selected', () => {
    fixture.componentRef.setInput('radioValue', 'testValue');
    fixture.componentRef.setInput('name', groupName);
    fixture.detectChanges();

    component.selectRadio();
    expect(component.value()).toBe('testValue');
  });
});
