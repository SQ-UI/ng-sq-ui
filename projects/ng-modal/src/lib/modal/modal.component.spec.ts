import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#should open when open() is invoked', (done: DoneFn) => {
    const subscription = component.showChange.subscribe((isShown) => {
      expect(isShown).toBe(true, 'modal is open');
      subscription.unsubscribe();
      done();
    });

    component.open();
    fixture.detectChanges();
  });

  it('#should hide when close() is invoked', (done: DoneFn) => {
    component.open();
    fixture.detectChanges();

    const subscription = component.showChange.subscribe((isShown) => {
      expect(isShown).toBe(false, 'modal is hidden');
      subscription.unsubscribe();
      done();
    });

    component.close();
    fixture.detectChanges();
  });
});
