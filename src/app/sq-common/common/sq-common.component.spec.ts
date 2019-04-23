import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqCommonComponent } from './sq-common.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SqCommonComponent', () => {
  let component: SqCommonComponent;
  let fixture: ComponentFixture<SqCommonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqCommonComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
