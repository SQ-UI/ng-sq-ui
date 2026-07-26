import { TestBed } from '@angular/core/testing';

import { SqCommonComponent } from './sq-common.component';

describe('SqCommonComponent', () => {
  it('should create', () => {
    TestBed.configureTestingModule({});
    const component = TestBed.runInInjectionContext(() => new SqCommonComponent());

    expect(component).toBeTruthy();
    expect(component.exports.length).toBeGreaterThan(0);
  });
});
