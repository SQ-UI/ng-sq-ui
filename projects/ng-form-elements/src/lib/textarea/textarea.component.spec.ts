import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TextareaComponent } from './textarea.component';

function stubTextareaRef(component: TextareaComponent, el: Partial<HTMLDivElement>): void {
  Object.defineProperty(component, 'textareaRef', {
    value: () => new ElementRef(el as HTMLDivElement),
    configurable: true,
  });
}

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fakeEl: { textContent: string; focus: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new TextareaComponent());
    fakeEl = { textContent: '', focus: vi.fn() };
    stubTextareaRef(component, fakeEl as unknown as HTMLDivElement);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the placeholder when the value is empty', () => {
    expect(component.isPlaceholderVisible()).toBe(true);

    component.value.set('some test text');

    expect(component.isPlaceholderVisible()).toBe(false);
  });

  it('should sync the DOM textContent when the value changes', () => {
    component.value.set('some test text');
    component['syncDomFromValue']();

    expect(fakeEl.textContent).toBe('some test text');
  });

  it('should update the value when the user types', () => {
    component.inputChange({ target: { textContent: 'typed text' } } as unknown as Event);

    expect(component.value()).toBe('typed text');
    expect(component.isPlaceholderVisible()).toBe(false);
  });

  it('should focus the textarea element', () => {
    component.focusOnArea();

    expect(fakeEl.focus).toHaveBeenCalled();
  });
});
