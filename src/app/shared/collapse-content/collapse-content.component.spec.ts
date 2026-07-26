import { TestBed } from '@angular/core/testing';

import { CollapseContentComponent } from './collapse-content.component';

describe('CollapseContentComponent', () => {
  let component: CollapseContentComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new CollapseContentComponent());
  });

  it('should create and start collapsed (expanded content visible)', () => {
    expect(component).toBeTruthy();
    expect(component.isCollapsed()).toBe(true);
  });

  it('should toggle the collapsed state', () => {
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(false);

    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(true);
  });
});
