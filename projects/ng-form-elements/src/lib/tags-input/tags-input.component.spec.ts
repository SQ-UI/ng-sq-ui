import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsInputComponent } from './tags-input.component';
import { FormsModule } from '@angular/forms';

describe('TagsInputComponent', () => {
  let component: TagsInputComponent;
  let fixture: ComponentFixture<TagsInputComponent>;

  function addNewTag(tagName) {
    const mockEventObject = {
      keyCode: 32 // space keycode
    };

    component.newTagName = tagName;
    component.onUserInput(mockEventObject);
  }

  function addTags(count) {
    for (let i = 0; i < count; i++) {
      addNewTag('randomTag ' + new Date().getTime());
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TagsInputComponent],
      imports: [
        FormsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should insert tags correctly on Space press', () => {
    const testTag = 'randomTag';
    addNewTag(testTag);

    expect(component.enteredItems.indexOf(testTag) > -1 &&
      !Object.is(component.enteredItems, component.value))
      .toBe(true);
  });

  it('should remove tags correctly when pressing Backspace', () => {
    const testTag = 'newRandomTag';
    addTags(3);
    addNewTag(testTag);

    const mockEventObject = {
      keyCode: 8 // backspace keycode
    };

    component.newTagName = 'asdf';
    component.onUserInput(mockEventObject);

    expect(component.enteredItems.indexOf(testTag) > - 1)
      .toBe(true);

    // below 2 lines emulate an already empty field
    component.newTagName = '';
    component.onUserInput(mockEventObject);

    // trigger a backspace on an empty field
    component.onUserInput(mockEventObject);

    expect(component.enteredItems.indexOf(testTag) === -1)
      .toBe(true);

    for (let i = 0; i < component.enteredItems.size + 2; i++) {
      component.onUserInput(mockEventObject);
    }

    expect(component.enteredItems.size === 0)
      .toBe(true);
  });

  it('should remove tags when using the remove button', () => {
    const testTag = 'randomTag';
    addNewTag(testTag);

    component.removeTag(testTag);
    expect(component.enteredItems.indexOf(testTag) === -1).toBe(true);
  });

});
