import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsInputComponent } from './tags-input.component';

describe('TagsInputComponent', () => {
  let component: TagsInputComponent;
  let fixture: ComponentFixture<TagsInputComponent>;

  function keyEvent(key: string) {
    return { key, preventDefault: () => { /* noop */ } } as unknown as KeyboardEvent;
  }

  function addNewTag(tagName: string) {
    component.newTagName = tagName;
    component.onUserInput(keyEvent(' '));
  }

  function addTags(count: number) {
    for (let i = 0; i < count; i++) {
      addNewTag('randomTag ' + new Date().getTime());
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsInputComponent]
    })
      .compileComponents();
  });

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

    const backspaceEvent = keyEvent('Backspace');

    component.newTagName = 'asdf';
    component.onUserInput(backspaceEvent);

    expect(component.value().indexOf(testTag) > -1)
      .toBe(true);

    // below 2 lines emulate an already empty field
    component.newTagName = '';
    component.onUserInput(backspaceEvent);

    // trigger a backspace on an empty field
    component.onUserInput(backspaceEvent);

    expect(component.value().indexOf(testTag) === -1)
      .toBe(true);

    for (let i = 0; i < component.value().length + 2; i++) {
      component.onUserInput(backspaceEvent);
    }

    expect(component.value().length === 0)
      .toBe(true);
  });

  it('should commit a tag on Enter and on comma as well as on Space', () => {
    component.newTagName = 'enterTag';
    component.onUserInput(keyEvent('Enter'));

    component.newTagName = 'commaTag';
    component.onUserInput(keyEvent(','));

    expect(component.value()).toEqual(['enterTag', 'commaTag']);
    expect(component.newTagName).toBe('');
  });

  it('should remove tags when using the remove button', () => {
    const testTag = 'randomTag';
    addNewTag(testTag);

    component.removeTag(testTag);
    expect(component.value().indexOf(testTag) === -1).toBe(true);
  });

});
