import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiobuttonComponent } from './radiobutton.component';
import { FormsModule } from '@angular/forms';
import { CustomEventBroadcasterService } from '@sq-ui/ng-sq-common';

describe('RadiobuttonComponent', () => {
  let component: RadiobuttonComponent;
  let fixture: ComponentFixture<RadiobuttonComponent>;
  let eventBroadcaster: CustomEventBroadcasterService;
  const groupName = 'testGroupName';
  const radioValue = 'testValue';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RadiobuttonComponent],
      imports: [
        FormsModule
      ],
      providers: [
        CustomEventBroadcasterService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiobuttonComponent);
    eventBroadcaster = TestBed.inject(CustomEventBroadcasterService);
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

    radio2.radioValue = 'radio2Value';
    radio2.name = groupName;

    component.name = groupName;
    component.radioValue = radioValue;
    radio2Fixture.detectChanges();

    component.selectRadio();
    expect(component.isSelected).toBe(true);
    expect(radio2.isSelected).toBe(false);

    radio2.selectRadio();
    expect(component.isSelected).toBe(false);
    expect(radio2.isSelected).toBe(true);
  });
});
