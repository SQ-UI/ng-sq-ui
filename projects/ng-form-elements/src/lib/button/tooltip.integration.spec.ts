import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TooltipDirective } from '@sq-ui/ng-sq-common';
import { ButtonComponent } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent, TooltipDirective],
  template: '<sq-button sqTooltip="Save changes">Save</sq-button>',
})
class TooltipButtonHost {}

describe('sq-button with TooltipDirective', () => {
  it('describes the focused native button and removes the description on blur', () => {
    const fixture = TestBed.createComponent(TooltipButtonHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('sq-button') as HTMLElement;
    const button = host.querySelector('button')!;
    button.focus();
    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(tooltip).not.toBeNull();
    expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
    expect(host.hasAttribute('aria-describedby')).toBe(false);
    button.blur();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    fixture.destroy();
  });
});
