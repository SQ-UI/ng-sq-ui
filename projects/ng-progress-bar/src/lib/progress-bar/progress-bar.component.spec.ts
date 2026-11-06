import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('announces a named percentage and omits the value for indeterminate progress', () => {
    fixture.componentRef.setInput('label', 'Upload');
    fixture.componentRef.setInput('loaded', 42);
    fixture.detectChanges();
    const bar: HTMLElement = fixture.nativeElement.querySelector('[role=progressbar]');
    expect(bar.getAttribute('aria-label')).toBe('Upload');
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
    fixture.componentRef.setInput('infinite', true);
    fixture.detectChanges();
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('clamps determinate values and handles invalid numbers', () => {
    const line = () => fixture.nativeElement.querySelector('.loading-line') as HTMLElement;
    for (const [value, expected] of [[-20, 0], [150, 100], [Number.NaN, 0], [Infinity, 0]]) {
      fixture.componentRef.setInput('loaded', value);
      fixture.detectChanges();
      expect(line().style.width).toBe(expected + '%');
      expect(fixture.nativeElement.querySelector('[role=progressbar]').getAttribute('aria-valuenow')).toBe(String(expected));
    }
  });

  it('fills segments from the loaded percentage, including a partial segment', () => {
    fixture.componentRef.setInput('variant', 'segmented');
    fixture.componentRef.setInput('segments', 4);
    fixture.componentRef.setInput('loaded', 37.5);
    fixture.detectChanges();
    const fills = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.segment .loading-line'));
    expect(fills.map(fill => fill.style.width)).toEqual(['100%', '50%', '0%', '0%']);
    fixture.componentRef.setInput('segments', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.segment').length).toBe(1);
  });

  it('keeps step labels and states synchronized as the current step changes', () => {
    fixture.componentRef.setInput('variant', 'steps');
    fixture.componentRef.setInput('label', 'Checkout');
    fixture.componentRef.setInput('steps', ['Cart', 'Payment', 'Delivery']);
    fixture.componentRef.setInput('currentStep', 1);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role=group]')?.getAttribute('aria-label')).toBe('Checkout');
    expect(root.querySelectorAll('ol .step').length).toBe(3);
    expect(root.querySelectorAll('.done').length).toBe(1);
    expect(root.querySelector('[aria-current=step]')?.getAttribute('aria-label')).toBe('Payment, current');
    expect((root.querySelector('.step-fill') as HTMLElement).style.width).toBe('50%');
    fixture.componentRef.setInput('currentStep', 3);
    fixture.detectChanges();
    expect(root.querySelector('[aria-current]')).toBeNull();
    expect(root.querySelectorAll('.done').length).toBe(3);
    expect((root.querySelector('.step-fill') as HTMLElement).style.width).toBe('100%');
    fixture.componentRef.setInput('currentStep', -1);
    fixture.detectChanges();
    expect(root.querySelectorAll('.done, .current').length).toBe(0);
  });

  it('renders empty and single-step lists without an invalid connector', () => {
    fixture.componentRef.setInput('variant', 'steps');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.step').length).toBe(0);
    expect(fixture.nativeElement.querySelector('.step-track')).toBeNull();
    fixture.componentRef.setInput('steps', ['Done']);
    fixture.componentRef.setInput('currentStep', Number.NaN);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.current').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.step-track')).toBeNull();
  });

  it('uses the existing indeterminate bar when infinite is combined with a new variant', () => {
    fixture.componentRef.setInput('variant', 'steps');
    fixture.componentRef.setInput('steps', ['One', 'Two']);
    fixture.componentRef.setInput('infinite', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.progress.infinite')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.progress-steps')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.loading-line').length).toBe(2);
    expect(fixture.nativeElement.querySelector('[role=progressbar]').hasAttribute('aria-valuenow')).toBe(false);
  });
});
