import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDocsComponent } from './modal-docs.component';

describe('ModalDocsComponent', () => {
  let component: ModalDocsComponent;
  let fixture: ComponentFixture<ModalDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDocsComponent ]
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
