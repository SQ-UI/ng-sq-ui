import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDocsComponent } from './modal-docs.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ModalDocsComponent', () => {
  let component: ModalDocsComponent;
  let fixture: ComponentFixture<ModalDocsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ModalDocsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
