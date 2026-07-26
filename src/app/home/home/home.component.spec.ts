import { TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  it('should create', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new HomeComponent());

    expect(component).toBeTruthy();
  });
});
