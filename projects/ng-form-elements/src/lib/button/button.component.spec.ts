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

  it('updates presentation inputs without changing native button behavior', () => {
    fixture.componentRef.setInput('appearance', 'secondary');
    fixture.componentRef.setInput('tone', 'critical');
    fixture.componentRef.setInput('size', 'xl');
    fixture.componentRef.setInput('type', 'reset');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('sq-button-secondary')).toBe(true);
    expect(button.dataset.tone).toBe('critical');
    expect(button.dataset.size).toBe('xl');
    expect(button.type).toBe('reset');
    expect(button.disabled).toBe(false);
    fixture.componentRef.setInput('appearance', 'neutral');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(button.classList.contains('sq-button-secondary')).toBe(false);
    expect(button.classList.contains('sq-button-neutral')).toBe(true);
    expect(button.disabled).toBe(true);
  });
});
