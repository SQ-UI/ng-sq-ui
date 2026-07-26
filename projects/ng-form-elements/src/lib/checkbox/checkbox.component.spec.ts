import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CheckboxComponent]
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
    expect(component.isSelected()).toBe(false);
    component.toggleCheckboxSelection();
    expect(component.isSelected()).toBe(true);
    component.toggleCheckboxSelection();
    expect(component.isSelected()).toBe(false);
  });

  it('should update value model when toggled', () => {
    expect(component.value()).toBe(false);
    component.toggleCheckboxSelection();
    expect(component.value()).toBe(true);
    component.toggleCheckboxSelection();
    expect(component.value()).toBe(false);
  });

});
