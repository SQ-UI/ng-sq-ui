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

  it('links each dialog to its own projected-title container', () => {
    const second = TestBed.createComponent(ModalComponent);
    second.detectChanges();
    const article = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const title = fixture.nativeElement.querySelector('.modal-title') as HTMLElement;
    expect(article.getAttribute('aria-labelledby')).toBe(title.id);
    expect(second.nativeElement.querySelector('.modal-title').id).not.toBe(title.id);
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

  it('moves focus inside, contains Tab and restores focus and scrolling on close', async () => {
    // The shared test setup reports display:none for every element; this scenario needs visible controls.
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ display: 'inline-block' } as CSSStyleDeclaration);
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const previousOverflow = document.body.style.overflow;
    component.show.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const close = fixture.nativeElement.querySelector('.close') as HTMLButtonElement;
    expect(document.activeElement).toBe(close);
    expect(document.body.style.overflow).toBe('hidden');
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    close.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
    component.close();
    fixture.detectChanges();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe(previousOverflow);
    opener.remove();
  });

  it('closes only the top modal and retains the scroll lock for an underlying modal', async () => {
    component.show.set(true); fixture.detectChanges();
    const second = TestBed.createComponent(ModalComponent);
    second.componentInstance.show.set(true); second.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    second.detectChanges(); fixture.detectChanges();
    expect(second.componentInstance.show()).toBe(false);
    expect(component.show()).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    second.destroy();
    component.close(); fixture.detectChanges();
    expect(document.body.style.overflow).not.toBe('hidden');
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
