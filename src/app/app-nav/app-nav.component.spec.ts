import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppNavComponent } from './app-nav.component';

describe('AppNavComponent', () => {
  let component: AppNavComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    component = TestBed.runInInjectionContext(() => new AppNavComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with the nav closed', () => {
    expect(component.isNavOpen()).toBe(false);
    expect(component.listenForOutsideClick()).toBe(false);
  });

  it('should open the nav via showNav', () => {
    component.showNav();
    expect(component.isNavOpen()).toBe(true);
  });
});
