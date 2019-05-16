import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableDocsComponent } from './datatable-docs.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDatatableModule } from '@sq-ui/ng-datatable';


describe('DatatableDocsComponent', () => {
  let component: DatatableDocsComponent;
  let fixture: ComponentFixture<DatatableDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableDocsComponent ],
      imports: [
        RouterTestingModule,
        CommonModule,
        NgDatatableModule
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
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
