import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ModuleOverviewComponent } from './module-overview.component';

describe('ModuleOverviewComponent', () => {
  let component: ModuleOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new ModuleOverviewComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll to a fragment when it exists', () => {
    const element = document.createElement('div');
    element.id = 'my-fragment';
    document.body.appendChild(element);
    const scrollIntoViewSpy = vi.fn();
    element.scrollIntoView = scrollIntoViewSpy;

    component.scrollTo('my-fragment');

    expect(scrollIntoViewSpy).toHaveBeenCalled();
    element.remove();
  });
});
