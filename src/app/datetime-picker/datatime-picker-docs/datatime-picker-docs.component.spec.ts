import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatimePickerDocsComponent } from './datatime-picker-docs.component';

describe('DatatimePickerDocsComponent', () => {
  let component: DatatimePickerDocsComponent;
  let fixture: ComponentFixture<DatatimePickerDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatimePickerDocsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatimePickerDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
