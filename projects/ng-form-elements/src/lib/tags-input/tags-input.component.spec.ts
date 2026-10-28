import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsInputComponent } from './tags-input.component';

describe('TagsInputComponent', () => {
  let component: TagsInputComponent;
  let fixture: ComponentFixture<TagsInputComponent>;

  function addNewTag(tagName: string) {
    const mockEventObject = {
      keyCode: 32 // space keycode
    } as unknown as KeyboardEvent;

    component.newTagName = tagName;
    component.onUserInput(mockEventObject);
  }

  function addTags(count: number) {
    for (let i = 0; i < count; i++) {
      addNewTag('randomTag ' + new Date().getTime());
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TagsInputComponent]
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

    expect(component.value().indexOf(testTag) > -1).toBe(true);
  });

  it('should remove tags correctly when pressing Backspace', () => {
    const testTag = 'newRandomTag';
    addTags(3);
    addNewTag(testTag);

    const mockEventObject = {
      keyCode: 8 // backspace keycode
    } as unknown as KeyboardEvent;

    component.newTagName = 'asdf';
    component.onUserInput(mockEventObject);

    expect(component.value().indexOf(testTag) > -1)
      .toBe(true);

    // below 2 lines emulate an already empty field
    component.newTagName = '';
    component.onUserInput(mockEventObject);

    // trigger a backspace on an empty field
    component.onUserInput(mockEventObject);

    expect(component.value().indexOf(testTag) === -1)
      .toBe(true);

    for (let i = 0; i < component.value().length + 2; i++) {
      component.onUserInput(mockEventObject);
    }

    expect(component.value().length === 0)
      .toBe(true);
  });

  it('should remove tags when using the remove button', () => {
    const testTag = 'randomTag';
    addNewTag(testTag);

    component.removeTag(testTag);
    expect(component.value().indexOf(testTag) === -1).toBe(true);
  });

});
