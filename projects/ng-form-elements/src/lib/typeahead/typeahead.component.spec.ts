import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import type { LabelValuePair } from '@sq-ui/ng-sq-common';

import { TypeaheadComponent, type TypeaheadOption } from './typeahead.component';

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  /**
   * `[searchResults]` is `readonly unknown[]` by design; the fixture knows what it supplied, so the
   * tests read the raw results back with the pair type they provided.
   */
  const resultAt = (index: number): LabelValuePair => component.searchResults()[index] as LabelValuePair;

  const testSearchResults: LabelValuePair[] = [
    {
      label: 'option1',
      value: { key: 1 },
    },
    {
      label: 'option2',
      value: { key: 2 },
    },
    {
      label: 'option3',
      value: { id: '1234', key: 3 },
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeaheadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate with search results on end of user input', () => {
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.detectChanges();

    expect(component.searchResults().length > 0).toBe(true);
  });

  it('should stop the loader when the debounced query is empty', () => {
    vi.useFakeTimers();
    try {
      fixture.componentRef.setInput('delay', 100);
      const emitted: string[] = [];
      component.onUserInputEnd.subscribe(query => emitted.push(query));

      component.onSearchInput({ target: { value: 'ab' } } as unknown as Event);
      component.onSearchInput({ target: { value: '' } } as unknown as Event);
      expect(component.isLoading()).toBe(true);

      vi.advanceTimersByTime(100);

      expect(emitted).toEqual(['']);
      expect(component.isLoading()).toBe(false);
      expect(component.hideResults()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should choose one item when [multiple] = false', () => {
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.componentRef.setInput('multiple', false);
    fixture.detectChanges();

    const firstChosenItem = resultAt(2);

    component.selectSearchResult(firstChosenItem);
    component.selectSearchResult(resultAt(0));
    component.selectSearchResult(resultAt(1));

    // the typeahead should return a new array with the copied search items
    expect(
      component.value().length === 1 &&
      Object.is(component.selectedItems()[0], component.value()[0]),
    ).toBe(true);
  });

  it('should be able to choose more than one result when [multiple] = true', () => {
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    const results = component.searchResults();
    for (let i = 0; i < results.length; i++) {
      component.selectSearchResult(resultAt(i));
    }

    expect(
      component.value().length === testSearchResults.length &&
      !Object.is(component.selectedItems(), component.value()),
    ).toBe(true);
  });

  it('should remove selected item by using the remove button', () => {
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.componentRef.setInput('multiple', false);
    fixture.detectChanges();

    component.selectSearchResult(testSearchResults[0]);
    component.removeSearchResult(testSearchResults[0]);

    expect(component.value().length === 0).toBe(true);
  });

  it('should be able to populate correctly with a pre-defined result item when [multiple] = true', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.detectChanges();

    component.selectSearchResult(resultAt(0));
    component.selectSearchResult(resultAt(component.searchResults().length - 1));

    expect(component.selectedItems()).toEqual(
      component.value(),
    );
  });

  it('should be able to populate correctly with a pre-defined result item when [multiple] = false', () => {
    fixture.componentRef.setInput('multiple', false);
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.detectChanges();

    component.selectSearchResult(resultAt(0));
    component.selectSearchResult(resultAt(component.searchResults().length - 1));

    const items = component.selectedItems();
    expect(items.length === 1).toBe(true);
    expect(Object.is(items[0], component.value()[0])).toBe(true);
  });

  it('should focus the input without clearing the bound value', () => {
    const preselected = [testSearchResults[0]];
    fixture.componentRef.setInput('value', preselected);
    fixture.detectChanges();

    expect(component.selectedItems().length).toBe(1);

    component.turnClickOutsideListenerOn();
    fixture.detectChanges();

    expect(component.listenForOutsideClick()).toBe(true);
    expect(component.value()).toEqual(preselected);
    expect(component.selectedItems()).toEqual(preselected);
  });

  it('should mirror a programmatically assigned value into the chip list', () => {
    fixture.componentRef.setInput('value', [testSearchResults[1], testSearchResults[2]]);
    fixture.detectChanges();

    expect(component.selectedItems().length).toBe(2);
    expect(component.selectedItems()[0]).toBe(testSearchResults[1]);

    fixture.componentRef.setInput('value', []);
    fixture.detectChanges();

    expect(component.selectedItems().length).toBe(0);
  });

  it('should be working with plain strings', () => {
    fixture.componentRef.setInput('displayProp', '');
    fixture.componentRef.setInput('multiple', false);
    fixture.detectChanges();

    component.selectSearchResult(testSearchResults[0]);
    component.selectSearchResult(testSearchResults[1]);

    const items = component.selectedItems();
    expect(items.length === 1).toBe(true);
    expect(items[0] === component.value()[0]).toBe(true);
  });

  it('toggles a multiselect choice by value after results are refreshed', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    component.selectSearchResult({ label: 'Design', value: 'design' });
    component.selectSearchResult({ label: 'Design refreshed', value: 'design' });
    expect(component.value()).toEqual([]);
    component.selectSearchResult({ label: 'Design', value: 'design' });
    component.selectSearchResult({ label: 'Development', value: 'development' });
    expect(component.value().map(item => item.value)).toEqual(['design', 'development']);
  });

  it('keeps disabled options and disabled controls from changing selection', () => {
    const disabled: TypeaheadOption = { label: 'Unavailable', value: 'disabled', disabled: true };
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    component.selectSearchResult(disabled);
    expect(component.value()).toEqual([]);
    component.selectSearchResult(testSearchResults[0]);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.removeSearchResult(testSearchResults[0]);
    component.selectSearchResult(testSearchResults[1]);
    expect(component.value()).toEqual([testSearchResults[0]]);
  });

  it('opens supplied options and skips disabled rows from the keyboard', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('searchResults', [
      { label: 'Unavailable', value: 0, disabled: true }, { label: 'Design', value: 1 },
    ]);
    fixture.detectChanges();
    component.onClickOutsideComponent();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    fixture.detectChanges();
    expect(component.hideResults()).toBe(false);
    expect(component.activeIndex()).toBe(1);
    const rows: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('[role="option"]');
    expect(input.getAttribute('aria-activedescendant')).toBe(rows[1].id);
    expect(rows[0].getAttribute('aria-disabled')).toBe('true');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    fixture.detectChanges();
    expect(component.value().map(item => item.value)).toEqual([1]);
    expect(rows[1].getAttribute('aria-selected')).toBe('true');
    expect(component.hideResults()).toBe(false);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    fixture.detectChanges();
    expect(component.value()).toEqual([]);
  });

  it('handles all-disabled results and Escape/Tab without selecting anything', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('searchResults', [{ label: 'Unavailable', value: 0, disabled: true }]);
    fixture.detectChanges();
    component.toggleResults();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    expect(component.activeIndex()).toBe(-1);
    expect(component.value()).toEqual([]);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    expect(component.hideResults()).toBe(true);
    component.toggleResults();
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(component.hideResults()).toBe(true);
  });

  it('preserves displayProp result shape and carries explicit disabled flags', () => {
    fixture.componentRef.setInput('displayProp', 'name');
    fixture.componentRef.setInput('searchResults', [
      { name: 'Design', id: 'design' }, { name: 'Unavailable', id: 'disabled', disabled: true },
    ]);
    fixture.detectChanges();
    expect(component.options()[0]).toEqual({ label: 'Design', value: { name: 'Design', id: 'design' } });
    expect(component.options()[1].disabled).toBe(true);
    component.selectSearchResult(component.options()[1]);
    expect(component.value()).toEqual([]);
    component.selectSearchResult(component.options()[0]);
    expect(component.value()).toEqual([{ label: 'Design', value: { name: 'Design', id: 'design' } }]);
  });
});
