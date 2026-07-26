import { TestBed } from '@angular/core/testing';

import { TypeaheadComponent } from './typeahead.component';

function stubInput<T>(component: TypeaheadComponent, name: 'searchResults' | 'multiple' | 'displayProp', value: T): void {
  Object.defineProperty(component, name, { value: () => value, configurable: true });
}

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;

  const testSearchResults = [
    { label: 'option1', value: { key: 1 } },
    { label: 'option2', value: { key: 2 } },
    { label: 'option3', value: { id: '1234', key: 3 } },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new TypeaheadComponent());
    stubInput(component, 'displayProp', '');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate options from search results', () => {
    stubInput(component, 'searchResults', testSearchResults);
    component['syncOptionsFromSearchResults']();

    expect(component.options().length).toBe(testSearchResults.length);
    expect(component.isLoading()).toBe(false);
    expect(component.hideResults()).toBe(false);
  });

  it('should choose one item when [multiple] = false', () => {
    stubInput(component, 'multiple', false);

    component.selectSearchResult(testSearchResults[2]);
    component.selectSearchResult(testSearchResults[0]);
    component.selectSearchResult(testSearchResults[1]);

    expect(component.value().length).toBe(1);
    expect(Object.is(component.selectedItems()[0], component.value()[0])).toBe(true);
  });

  it('should be able to choose more than one result when [multiple] = true', () => {
    stubInput(component, 'multiple', true);

    for (const result of testSearchResults) {
      component.selectSearchResult(result);
    }

    expect(component.value().length).toBe(testSearchResults.length);
    expect(component.selectedItems()).not.toBe(component.value());
  });

  it('should remove selected item by using the remove button', () => {
    stubInput(component, 'multiple', false);

    component.selectSearchResult(testSearchResults[0]);
    component.removeSearchResult(testSearchResults[0]);

    expect(component.value().length).toBe(0);
  });

  it('should be able to populate correctly with a pre-defined result item when [multiple] = true', () => {
    stubInput(component, 'multiple', true);

    component.selectSearchResult(testSearchResults[0]);
    component.selectSearchResult(testSearchResults[testSearchResults.length - 1]);

    expect(component.selectedItems()).toEqual(component.value());
  });

  it('should be able to populate correctly with a pre-defined result item when [multiple] = false', () => {
    stubInput(component, 'multiple', false);

    component.selectSearchResult(testSearchResults[0]);
    component.selectSearchResult(testSearchResults[testSearchResults.length - 1]);

    expect(component.selectedItems().length).toBe(1);
    expect(component.selectedItems()[0]).toBe(component.value()[0]);
  });

  it('should be working with plain strings', () => {
    stubInput(component, 'displayProp', '');
    stubInput(component, 'multiple', false);

    component.selectSearchResult(testSearchResults[0]);
    component.selectSearchResult(testSearchResults[1]);

    expect(component.selectedItems().length).toBe(1);
    expect(component.selectedItems()[0]).toBe(component.value()[0]);
  });

  it('should hydrate selectedItems from an initial value on init', () => {
    component.value.set(['option1', 'option2']);
    component.ngOnInit();

    expect(component.selectedItems().length).toBe(2);
    expect(component.selectedItems()[0]).toEqual({ label: 'option1', value: 'option1' });
  });
});
