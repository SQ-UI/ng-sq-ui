import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

@Component({
  imports: [CardComponent],
  template: `
    <sq-card title="Fallback title" subtitle="Fallback subtitle" role="group" aria-labelledby="card-heading">
      <h2 sq-card-header id="card-heading">Custom heading</h2>
      <img sq-card-media src="example.svg" alt="Example artwork">
      <p>Card body</p>
      <ng-container sq-card-actions>
        @if (showActions()) {
          <button type="button" (click)="clicks = clicks + 1">Save</button>
          <a href="#details">Details</a>
        }
      </ng-container>
      <small sq-card-footer>Last updated today</small>
    </sq-card>
  `,
})
class CardHost {
  readonly showActions = signal(true);
  clicks = 0;
}

describe('CardComponent', () => {
  it('renders and updates the default heading through signal inputs', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('title', 'Project');
    fixture.componentRef.setInput('subtitle', 'Design workspace');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h3').textContent).toBe('Project');
    expect(fixture.nativeElement.querySelector('.card-subtitle').textContent).toBe('Design workspace');

    fixture.componentRef.setInput('title', 'Updated project');
    fixture.componentRef.setInput('subtitle', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h3').textContent).toBe('Updated project');
    expect(fixture.nativeElement.querySelector('.card-subtitle')).toBeNull();

    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.card-header').matches(':empty')).toBe(true);
  });

  it('projects each slot once and replaces the fallback header', () => {
    const fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.card-header h2')?.textContent).toBe('Custom heading');
    expect(root.querySelector('.card-title')).toBeNull();
    expect(root.querySelector('.card-subtitle')).toBeNull();
    expect(root.querySelector('.card-media img')?.getAttribute('alt')).toBe('Example artwork');
    expect(root.querySelector('.card-content')?.textContent?.trim()).toBe('Card body');
    expect(root.querySelectorAll('.card-actions > *').length).toBe(2);
    expect(root.querySelector('.card-footer small')?.textContent).toBe('Last updated today');
    expect(root.querySelectorAll('img').length).toBe(1);
  });

  it('preserves consumer semantics and interactions when projected actions change', async () => {
    const fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const card = root.querySelector('sq-card')!;
    expect(card.getAttribute('role')).toBe('group');
    expect(card.getAttribute('aria-labelledby')).toBe('card-heading');
    expect(card.hasAttribute('tabindex')).toBe(false);
    root.querySelector<HTMLButtonElement>('.card-actions button')!.click();
    expect(fixture.componentInstance.clicks).toBe(1);
    expect(root.querySelector('.card-actions a')?.getAttribute('href')).toBe('#details');

    fixture.componentInstance.showActions.set(false);
    await fixture.whenStable();
    expect(root.querySelector('.card-actions')?.matches(':empty')).toBe(true);
    fixture.componentInstance.showActions.set(true);
    await fixture.whenStable();
    root.querySelector<HTMLButtonElement>('.card-actions button')!.click();
    expect(fixture.componentInstance.clicks).toBe(2);
  });

  it('updates appearance and action alignment on the host', () => {
    const fixture = TestBed.createComponent(CardComponent);
    fixture.detectChanges();
    const card: HTMLElement = fixture.nativeElement;
    expect(card.getAttribute('data-appearance')).toBe('outlined');
    expect(card.getAttribute('data-actions-align')).toBe('start');
    for (const appearance of ['elevated', 'filled', 'outlined']) {
      fixture.componentRef.setInput('appearance', appearance);
      fixture.detectChanges();
      expect(card.getAttribute('data-appearance')).toBe(appearance);
    }
    fixture.componentRef.setInput('actionsAlign', 'end');
    fixture.detectChanges();
    expect(card.getAttribute('data-actions-align')).toBe('end');
  });
});
