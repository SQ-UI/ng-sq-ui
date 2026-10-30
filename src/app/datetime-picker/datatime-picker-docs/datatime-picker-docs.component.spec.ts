import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

import { DatatimePickerDocsComponent } from './datatime-picker-docs.component';

describe('DatatimePickerDocsComponent', () => {
  let component: DatatimePickerDocsComponent;
  let fixture: ComponentFixture<DatatimePickerDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatatimePickerDocsComponent],
      providers: [provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatimePickerDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
