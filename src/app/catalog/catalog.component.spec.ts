import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CatalogComponent } from './catalog.component';
import { ComponentDetailComponent } from './component-detail.component';

describe('Component explorer navigation', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideRouter([
      { path: 'components', component: CatalogComponent },
      { path: 'components/:component', component: ComponentDetailComponent },
    ])],
  }));

  it('combines search with a category and keeps the filters in the URL', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/components?category=Forms%20%26%20selection', CatalogComponent);
    const input = harness.routeNativeElement!.querySelector('input')!;
    input.value = 'sq-input';
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(component.filtered().map(demo => demo.id)).toEqual(['input']);
    expect(harness.routeNativeElement!.querySelectorAll('.catalog-card')).toHaveLength(1);
    expect(TestBed.inject(Router).url).toContain('q=sq-input');
    expect(component.category()).toBe('Forms & selection');

    const link = harness.routeNativeElement!.querySelector<HTMLAnchorElement>('.catalog-card')!;
    expect(link.href).toContain('/components/input');
    expect(link.href).toContain('q=sq-input');
  });

  it('shows a useful empty state and clears both filters', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/components?q=does-not-exist&category=Date%20%26%20time', CatalogComponent);
    expect(harness.routeNativeElement!.querySelector('.catalog-empty')).not.toBeNull();
    component.clear();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(component.filtered()).toHaveLength(21);
    expect(TestBed.inject(Router).url).toBe('/components');
  });

  it('restores a deep-linked configuration, falls back for an unknown variant and resets edits', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/components/input?variant=email&q=input', ComponentDetailComponent);
    harness.detectChanges();
    expect(component.config()?.id).toBe('email');
    expect(harness.routeNativeElement!.querySelector('sq-input input')!.getAttribute('type')).toBe('email');

    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('sq-input input')!;
    input.value = 'edited@example.com';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('output')!.textContent).toContain('edited@example.com');
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('.detail-reset')!.click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector<HTMLInputElement>('sq-input input')!.value).toBe('alex@example.com');

    await harness.navigateByUrl('/components/input?variant=unknown', ComponentDetailComponent);
    expect(component.config()?.id).toBe('default');
    expect(component.code().template).toContain('controlLabel="Display name"');
  });

  it('renders a missing component page instead of an empty example', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/components/unknown', ComponentDetailComponent);
    expect(harness.routeNativeElement!.textContent).toContain('Component not found');
  });
});
