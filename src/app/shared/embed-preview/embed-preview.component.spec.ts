import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { appRoutes } from '../../app-routes';

describe('Embedded documentation examples', () => {
  async function open(path: string) {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(path);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders an interactive form without app navigation and restores the normal shell on navigation', async () => {
    const fixture = await open('/embed/forms');
    expect(fixture.nativeElement.querySelector('sq-app-nav')).toBeNull();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('sq-input input');
    input.value = 'Maria';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('sq-button button').click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Saved Maria');

    await TestBed.inject(Router).navigateByUrl('/about');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('sq-app-nav')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.sq-embed')).toBeNull();
  });

  it('updates real progress components from the embedded controls', async () => {
    const fixture = await open('/embed/progress');
    const bar = () => fixture.nativeElement.querySelector('[aria-label="Continuous progress"]');
    expect(bar().getAttribute('aria-valuenow')).toBe('25');
    fixture.nativeElement.querySelector('sq-button button').click();
    await fixture.whenStable();
    expect(bar().getAttribute('aria-valuenow')).toBe('50');
    fixture.nativeElement.querySelectorAll('sq-button button')[1].click();
    await fixture.whenStable();
    expect(bar().getAttribute('aria-valuenow')).toBe('0');
  });

  it('offers a playground link when an unknown example is requested', async () => {
    const fixture = await open('/embed/unknown');
    expect(fixture.nativeElement.textContent).toContain('Example not found');
    expect(fixture.nativeElement.querySelector('a[href="#/preview"]')).not.toBeNull();
  });
});
