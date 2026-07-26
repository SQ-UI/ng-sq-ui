import { TestBed } from '@angular/core/testing';

import { ModalDocsComponent } from './modal-docs.component';

describe('ModalDocsComponent', () => {
  let component: ModalDocsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new ModalDocsComponent());
  });

  it('should create and start with the modal hidden', () => {
    expect(component).toBeTruthy();
    expect(component.showModal()).toBe(false);
  });
});
