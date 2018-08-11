import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiobuttonComponent } from './radiobutton.component';
import { FormsModule } from '@angular/forms';

describe('RadiobuttonComponent', () => {
  let component: RadiobuttonComponent;
  let fixture: ComponentFixture<RadiobuttonComponent>;
  const groupName = 'testGroupName';
  const radioValue = 'testValue';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadiobuttonComponent ],
      imports: [
        FormsModule
      ]
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

  it('#should select the radiobutton correctly when clicked', () => {
    const radio2 = new RadiobuttonComponent();
    radio2.radioValue = 'radio2Value';
    radio2.name = groupName;

    component.name = groupName;
    component.radioValue = radioValue;

    component.selectRadio();
    expect(component.isSelected).toBe(true, 'after clicking on the first radio, it is selected');
    expect(radio2.isSelected).toBe(undefined, 'the second radio should not be selected');

    radio2.selectRadio();
    expect(component.isSelected).toBe(false, 'after clicking on the second radio, the first is deselected');
    expect(radio2.isSelected).toBe(true, 'after clicking on the second radio, it is deselected');
  });
});
