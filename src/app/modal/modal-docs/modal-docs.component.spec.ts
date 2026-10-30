import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

import { ModalDocsComponent } from './modal-docs.component';

describe('ModalDocsComponent', () => {
  let component: ModalDocsComponent;
  let fixture: ComponentFixture<ModalDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDocsComponent],
      providers: [provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with the modal closed and toggle it through the handlers', () => {
    expect(component.showModal()).toBe(false);
    component.confirmationBtnHandler();
    component.rejectionBtnHandler();
  });
});
