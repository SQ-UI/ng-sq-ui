import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChipComponent } from './chip.component';

@Component({
  standalone: true,
  imports: [ChipComponent],
  template: `<form (submit)="submitted = true; $event.preventDefault()">
    <sq-chip [removable]="removable" [disabled]="disabled" removeLabel="Remove Angular"
             (removed)="removals = removals + 1">Angular</sq-chip>
  </form>`,
})
class ChipHost {
  removable = false;
  disabled = false;
  removals = 0;
  submitted = false;
}

describe('ChipComponent', () => {
  it('projects a label without a removal control by default', () => {
    const fixture = TestBed.createComponent(ChipHost);
    fixture.detectChanges();
    const chip: HTMLElement = fixture.nativeElement.querySelector('sq-chip');
    expect(chip.textContent?.trim()).toBe('Angular');
    expect(chip.querySelector('button')).toBeNull();
    expect(chip.hasAttribute('tabindex')).toBe(false);
  });

  it('emits removal without submitting a form or hiding the chip itself', () => {
    const fixture = TestBed.createComponent(ChipHost);
    fixture.componentInstance.removable = true;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Remove Angular');
    button.click();
    expect(fixture.componentInstance.removals).toBe(1);
    expect(fixture.componentInstance.submitted).toBe(false);
    expect(fixture.nativeElement.querySelector('sq-chip')).not.toBeNull();
    fixture.componentInstance.removable = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('keeps a disabled X visible and suppresses removal until enabled', () => {
    const fixture = TestBed.createComponent(ChipHost);
    fixture.componentInstance.removable = true;
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('sq-chip').getAttribute('aria-disabled')).toBe('true');
    button.click();
    // Also guard programmatic dispatch, which bypasses native disabled handling.
    button.dispatchEvent(new MouseEvent('click'));
    expect(fixture.componentInstance.removals).toBe(0);
    fixture.componentInstance.disabled = false;
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
    button.click();
    expect(fixture.componentInstance.removals).toBe(1);
  });
});
