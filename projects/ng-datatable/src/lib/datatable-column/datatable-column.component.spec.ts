import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableColumnComponent } from './datatable-column.component';

describe('DatatableColumnComponent', () => {
  let component: DatatableColumnComponent;
  let fixture: ComponentFixture<DatatableColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
