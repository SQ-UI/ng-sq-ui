import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show placeholder when value is empty', () => {
    expect(component.isPlaceholderVisible()).toBe(true);
  });

  it('should hide placeholder when value is set', () => {
    component.value.set('some test text');
    expect(component.isPlaceholderVisible()).toBe(false);
  });

  it('should sync value to the contentEditable div via effect', async () => {
    component.value.set('hello world');
    fixture.detectChanges();
    await fixture.whenStable();

    const textareaEl = fixture.nativeElement.querySelector('[contenteditable]');
    expect(textareaEl.textContent).toBe('hello world');
  });

  it('should update value on input event', () => {
    const textareaEl = fixture.nativeElement.querySelector('[contenteditable]') as HTMLElement;
    textareaEl.textContent = 'typed text';
    textareaEl.dispatchEvent(new Event('input', { bubbles: true }));

    expect(component.value()).toBe('typed text');
    expect(component.isPlaceholderVisible()).toBe(false);
  });

  it('should not be editable or focusable while disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const textareaEl = fixture.nativeElement.querySelector('[role="textbox"]') as HTMLElement;
    expect(textareaEl.getAttribute('contenteditable')).toBe('false');
    expect(textareaEl.getAttribute('tabindex')).toBe('-1');
    expect(textareaEl.getAttribute('aria-disabled')).toBe('true');
  });

  it('should expose a valid multi-line textbox role labelled by its label', () => {
    fixture.componentRef.setInput('controlId', 'notes');
    fixture.componentRef.setInput('controlLabel', 'Notes');
    fixture.detectChanges();

    const textareaEl = fixture.nativeElement.querySelector('[role="textbox"]') as HTMLElement;
    expect(textareaEl.getAttribute('aria-multiline')).toBe('true');
    expect(textareaEl.getAttribute('contenteditable')).toBe('true');
    expect(textareaEl.id).toBe('notes');
    expect(textareaEl.getAttribute('aria-labelledby')).toBe('notes-label');
  });
});
