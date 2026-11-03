import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiobuttonComponent } from './radiobutton.component';

describe('RadiobuttonComponent', () => {
  let component: RadiobuttonComponent;
  let fixture: ComponentFixture<RadiobuttonComponent>;
  const groupName = 'testGroupName';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiobuttonComponent]
    })
      .compileComponents();
  });

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

  it('should report a deselection only from the radio that was selected', () => {
    const makeRadio = (radioValue: string) => {
      const radioFixture = TestBed.createComponent(RadiobuttonComponent);
      radioFixture.componentRef.setInput('radioValue', radioValue);
      radioFixture.componentRef.setInput('name', groupName);
      radioFixture.detectChanges();
      const changes: boolean[] = [];
      radioFixture.componentInstance.isSelectedChange.subscribe(change => changes.push(change));
      return { radio: radioFixture.componentInstance, changes };
    };

    const a = makeRadio('a');
    const b = makeRadio('b');
    const c = makeRadio('c');

    a.radio.selectRadio();
    b.radio.selectRadio();

    expect(a.changes).toEqual([true, false]);
    expect(b.changes).toEqual([true]);
    expect(c.changes).toEqual([]);
  });

  it('should update value model when selected', () => {
    fixture.componentRef.setInput('radioValue', 'testValue');
    fixture.componentRef.setInput('name', groupName);
    fixture.detectChanges();

    component.selectRadio();
    expect(component.value()).toBe('testValue');
  });
});
