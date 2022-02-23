import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';
import { FormsModule } from '@angular/forms';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CheckboxComponent],
      imports: [
        FormsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle its values when clicked', () => {
    expect(component.isSelected).toBe(false, 'unselected at first');
    component.toggleCheckboxSelection();
    expect(component.isSelected).toBe(true, 'selected after click');
    component.toggleCheckboxSelection();
    expect(component.isSelected).toBe(false, 'unselected again');
  });

  it('should automatically change isSelected on onWrite(...)', () => {
    component.writeValue(true);
    expect(component.isSelected).toEqual(true);
    component.writeValue(false);
    expect(component.isSelected).toEqual(false);
  });

});
