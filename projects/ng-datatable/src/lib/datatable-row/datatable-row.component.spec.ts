import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableRowComponent } from './datatable-row.component';

describe('DatatableRowComponent', () => {
  let component: DatatableRowComponent;
  let fixture: ComponentFixture<DatatableRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatatableRowComponent]
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
