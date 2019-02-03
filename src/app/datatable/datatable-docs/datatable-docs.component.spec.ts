import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableDocsComponent } from './datatable-docs.component';

describe('DatatableDocsComponent', () => {
  let component: DatatableDocsComponent;
  let fixture: ComponentFixture<DatatableDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableDocsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
