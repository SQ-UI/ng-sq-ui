import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start hidden when show is false', () => {
    expect(component.isHidden()).toBe(true);
  });

  it('should close on Escape while shown', () => {
    component.show.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.show()).toBe(false);
  });
});

describe('ModalComponent initially shown', () => {
  it('should be visible when show starts as true', async () => {
    await TestBed.configureTestingModule({ imports: [ModalComponent] }).compileComponents();

    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('show', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.isHidden()).toBe(false);
    expect(fixture.nativeElement.querySelector('.modal-cover').classList.contains('display-none')).toBe(false);
  });
});
