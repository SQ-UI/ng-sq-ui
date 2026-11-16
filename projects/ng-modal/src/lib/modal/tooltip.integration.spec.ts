import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from '@sq-ui/ng-sq-common';
import { ModalComponent } from './modal.component';

@Component({
  standalone: true,
  imports: [ModalComponent, TooltipDirective],
  template: `<sq-modal [show]="true">
    <div sq-modal-body><button sqTooltip="Action details">Action</button></div>
  </sq-modal>`,
})
class TooltipModalHost {}

describe('sq-modal with TooltipDirective', () => {
  it('dismisses its tooltip on the first Escape and the modal on the second', () => {
    const fixture = TestBed.createComponent(TooltipModalHost);
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.directive(ModalComponent)).componentInstance as ModalComponent;
    const button = fixture.nativeElement.querySelector('.content button') as HTMLButtonElement;
    button.focus();
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(modal.show()).toBe(true);
    expect(document.activeElement).toBe(button);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(modal.show()).toBe(false);
    fixture.destroy();
  });
});
