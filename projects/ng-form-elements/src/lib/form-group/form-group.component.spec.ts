import { TestBed } from '@angular/core/testing';

import { FormGroupComponent } from './form-group.component';

describe('FormGroupComponent', () => {
  let component: FormGroupComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new FormGroupComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default groupLabel to an empty string', () => {
    expect(component.groupLabel()).toBe('');
  });
});
