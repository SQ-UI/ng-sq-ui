import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqUiComponent } from './sq-ui.component';

describe('SqUiComponent', () => {
  let component: SqUiComponent;
  let fixture: ComponentFixture<SqUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
