import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadComponent } from './typeahead.component';

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  const testSearchResults = [
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TypeaheadComponent],
    }).compileComponents();
  }));

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

  it('should choose one item when [multiple] = false', () => {
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.componentRef.setInput('multiple', false);
    fixture.detectChanges();

    const firstChosenItem = component.searchResults()[2];

    component.selectSearchResult(firstChosenItem);
    component.selectSearchResult(component.searchResults()[0]);
    component.selectSearchResult(component.searchResults()[1]);

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
      component.selectSearchResult(results[i]);
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

    component.selectSearchResult(component.searchResults()[0]);
    component.selectSearchResult(component.searchResults()[component.searchResults().length - 1]);

    expect(component.selectedItems()).toEqual(
      component.value(),
    );
  });

  it('should be able to populate correctly with a pre-defined result item when [multiple] = false', () => {
    fixture.componentRef.setInput('multiple', false);
    fixture.componentRef.setInput('searchResults', testSearchResults);
    fixture.detectChanges();

    component.selectSearchResult(component.searchResults()[0]);
    component.selectSearchResult(component.searchResults()[component.searchResults().length - 1]);

    const items = component.selectedItems();
    expect(items.length === 1).toBe(true);
    expect(Object.is(items[0], component.value()[0])).toBe(true);
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
});
