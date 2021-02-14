import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaComponent } from './textarea.component';
import { FormsModule } from '@angular/forms';

function populateWitheDummyData(paragraphsCount: number = 2): string {
  const dummyText = `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
  let result = '';

  for (let i = 0; i < paragraphsCount; i++) {
    result += dummyText;
  }

  return result;
}

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;
  let textarea: HTMLElement;

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
    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    textarea = fixture.nativeElement.querySelector('[contenteditable]');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the textarea height to a given [minHeight]', () => {
    component.minHeight = 400;
    fixture.detectChanges();

    expect(textarea.offsetHeight === component.minHeight)
      .toBe(true, 'textearea height matches [minHeight]');
  });

  it('should expand automatically when the user types in text', () => {
    textarea.textContent = populateWitheDummyData(4);
    fixture.detectChanges();

    expect(textarea.offsetHeight > component.minHeight)
      .toBe(true, 'textearea expands automatically on user input');
  });

  it('should shrink automatically when the user deletes text', () => {
    textarea.textContent = populateWitheDummyData(4);
    fixture.detectChanges();
    const textareaHeightBefore = textarea.offsetHeight;

    textarea.textContent = populateWitheDummyData(2);
    fixture.detectChanges();
    const textareaHeightAfter = textarea.offsetHeight;

    expect(textareaHeightBefore > textareaHeightAfter)
      .toBe(true, 'textearea shrinks automatically when text is deleted');
  });
});
