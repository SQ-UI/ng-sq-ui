import { TestBed } from '@angular/core/testing';
import { Temporal } from '@js-temporal/polyfill';

import { DatatimePickerDocsComponent } from './datatime-picker-docs.component';

describe('DatatimePickerDocsComponent', () => {
  let component: DatatimePickerDocsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new DatatimePickerDocsComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should seed the standalone datepicker one day in the future', () => {
    const value = component.testForm.standAloneDatepicker().value();
    expect(value).toBeInstanceOf(Temporal.PlainDate);
  });
});
