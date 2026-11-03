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

    // Backspace while the field still has text only edits the text.
    component.newTagName = 'asdf';
    component.onUserInput(backspaceEvent);

    expect(component.value().indexOf(testTag) > -1)
      .toBe(true);

    // Backspace on an empty field removes the last tag.
    component.newTagName = '';
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

  it('should not include the comma in a tag typed into the field', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'foo';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const comma = new KeyboardEvent('keydown', { key: ',', cancelable: true });
    input.dispatchEvent(comma);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toEqual(['foo']);
    expect(comma.defaultPrevented).toBe(true);
    expect(input.value).toBe('');
  });

  it('should remove tags when using the remove button', () => {
    const testTag = 'randomTag';
    addNewTag(testTag);

    component.removeTag(testTag);
    expect(component.value().indexOf(testTag) === -1).toBe(true);
  });

});
