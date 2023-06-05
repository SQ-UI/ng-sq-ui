import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaComponent } from './textarea.component';
import { FormsModule } from '@angular/forms';
import { ElementRef, Renderer2 } from '@angular/core';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;
  const renderer = {
    setProperty: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
  } as unknown as Renderer2;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TextareaComponent],
      imports: [
        FormsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    component = new TextareaComponent(renderer);
    component.textarea = new ElementRef({ textContent: '' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write to the textarea if value is defined', () => {
    jest.spyOn(renderer, 'setProperty');
    let testValue = null;
    component.writeValue(testValue);
    expect(renderer.setProperty).not.toHaveBeenCalled();
    expect(component.value).toEqual(null);
    expect(component.isPlaceholderVisible).toBe(true);
    testValue = 'some test text';
    component.writeValue(testValue);
    expect(renderer.setProperty).toHaveBeenCalledWith(component.textarea.nativeElement, 'textContent', testValue);
    expect(component.value).toEqual(testValue);
    expect(component.isPlaceholderVisible).toBe(false);
  });
});
