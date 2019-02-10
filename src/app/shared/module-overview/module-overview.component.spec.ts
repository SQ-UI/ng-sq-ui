import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleOverviewComponent } from './module-overview.component';

describe('ModuleOverviewComponent', () => {
  let component: ModuleOverviewComponent;
  let fixture: ComponentFixture<ModuleOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModuleOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
