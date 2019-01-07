import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableRowComponent } from './datatable-row.component';

describe('DatatableRowComponent', () => {
  let component: DatatableRowComponent;
  let fixture: ComponentFixture<DatatableRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
