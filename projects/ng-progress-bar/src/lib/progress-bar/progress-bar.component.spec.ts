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
});
