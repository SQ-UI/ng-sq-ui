import { TestBed } from '@angular/core/testing';

import { TagsInputComponent } from './tags-input.component';

describe('TagsInputComponent', () => {
  let component: TagsInputComponent;

  function addNewTag(tagName: string): void {
    component.newTagName.set(tagName);
    component.onUserInput({ keyCode: 32 }); // space keycode
  }

  function addTags(count: number): void {
    for (let i = 0; i < count; i++) {
      addNewTag('randomTag ' + new Date().getTime() + i);
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new TagsInputComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should insert tags correctly on Space press', () => {
    const testTag = 'randomTag';
    addNewTag(testTag);

    expect(component.value().indexOf(testTag) > -1).toBe(true);
    expect(component.newTagName()).toBe('');
  });

  it('should remove tags correctly when pressing Backspace', () => {
    const testTag = 'newRandomTag';
    addTags(3);
    addNewTag(testTag);

    const backspaceEvent = { keyCode: 8 };

    component.newTagName.set('asdf');
    component.onUserInput(backspaceEvent);

    expect(component.value().indexOf(testTag) > -1).toBe(true);

    // below 2 lines emulate an already empty field
    component.newTagName.set('');
    component.onUserInput(backspaceEvent);

    // trigger a backspace on an empty field
    component.onUserInput(backspaceEvent);

    expect(component.value().indexOf(testTag) === -1).toBe(true);

    for (let i = 0; i < component.value().length + 2; i++) {
      component.onUserInput(backspaceEvent);
    }

    expect(component.value().length === 0).toBe(true);
  });

  it('should remove tags when using the remove button', () => {
    const testTag = 'randomTag';
    addNewTag(testTag);

    component.removeTag(testTag);

    expect(component.value().indexOf(testTag) === -1).toBe(true);
  });
});
