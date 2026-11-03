import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppNavComponent } from './app-nav.component';

describe('AppNavComponent', () => {
  let component: AppNavComponent;
  let fixture: ComponentFixture<AppNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppNavComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('announces navigation expansion and returns focus to the opener on Escape', () => {
    const opener = fixture.nativeElement.querySelector('.demo-menu-button') as HTMLButtonElement;
    opener.click();
    fixture.detectChanges();
    expect(opener.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('#demo-sidebar').classList.contains('show')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(opener.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('#demo-sidebar').classList.contains('show')).toBe(false);
    expect(document.activeElement).toBe(opener);
  });
});
