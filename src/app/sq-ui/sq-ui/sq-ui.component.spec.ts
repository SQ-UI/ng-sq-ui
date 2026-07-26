import { TestBed } from '@angular/core/testing';

import { SqUiComponent } from './sq-ui.component';

describe('SqUiComponent', () => {
  let component: SqUiComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new SqUiComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should merge internally declared and depended-on packages into exports', () => {
    expect(component.exports).toEqual([...component.internallyDeclared, ...component.dependsOn]);
  });

  it('should start with an invalid form because the name field is required', () => {
    expect(component.testForm().invalid()).toBe(true);
  });

  it('should become valid once the name field is filled in', () => {
    component.testForm.name().value.set('Ada');

    expect(component.testForm().valid()).toBe(true);
  });
});
