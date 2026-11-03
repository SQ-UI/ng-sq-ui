import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<form (submit)="$event.preventDefault(); submitted = true">
    <sq-button type="submit" [disabled]="disabled">Continue</sq-button>
  </form>`,
})
class ButtonFormHost {
  submitted = false;
  disabled = false;
}

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps projected text, native submission and disabled behavior', () => {
    const host = TestBed.createComponent(ButtonFormHost);
    host.detectChanges();
    const button: HTMLButtonElement = host.nativeElement.querySelector('button');
    expect(button.textContent?.trim()).toBe('Continue');
    button.click();
    expect(host.componentInstance.submitted).toBe(true);
    host.componentInstance.submitted = false;
    host.componentInstance.disabled = true;
    host.detectChanges();
    button.click();
    expect(host.componentInstance.submitted).toBe(false);
  });

  it('falls back to a native button for an unknown type', () => {
    fixture.componentRef.setInput('type', 'primary');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').type).toBe('button');
  });
});
