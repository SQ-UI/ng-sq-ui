import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatimePickerDocsComponent } from './datatime-picker-docs.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgDatetimePickerModule } from '@sq-ui/ng-datetime-picker';
import { RouterTestingModule } from '@angular/router/testing';

describe('DatatimePickerDocsComponent', () => {
  let component: DatatimePickerDocsComponent;
  let fixture: ComponentFixture<DatatimePickerDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatimePickerDocsComponent ],
      imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        NgDatetimePickerModule,
        RouterTestingModule
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
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
