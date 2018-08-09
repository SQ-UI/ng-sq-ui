import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadComponent } from './typeahead.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OutsideClickListenerDirective } from '../../shared/directives/outside-click-listener.directive';

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  const testSearchResults = [{
      displayName: 'option1',
      value: {hey: 'woop'}
    },
    {
      displayName: 'option2',
      value: {hey: 'woop2'}
    },
    {
      displayName: 'option3',
      value: {id: '1234', hey: 'woop3'}
    }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TypeaheadComponent,
        OutsideClickListenerDirective
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#should populate with search results on end of user input', () => {
    component.searchResults = testSearchResults;

    expect(component.searchResults.length > 0).toBe(true, 'search results are properly populated');
  });

  it('#should choose one item when [multiple] = false', () => {
    component.searchResults = testSearchResults;
    const firstChosenItem = component.searchResults[2];

    component.multiple = false;

    component.selectSearchResult(firstChosenItem);
    component.selectSearchResult(component.searchResults[0]);
    component.selectSearchResult(component.searchResults[1]);

    // the typeahead should return a new array with the copied search items
    expect(component.value.length === 1 &&
          !Object.is(component.selectedItems.get(0).value, component.value[0].value) &&
          component.value[0].value.id === component.selectedItems.get(0).value.id)
      .toBe(true, 'single choice is correctly populated');
  });

  it('#should be able to choose more than one result when [multiple] = true', () => {
    component.searchResults = testSearchResults;
    component.multiple = true;

    for (let i = 0; i < component.searchResults.length; i++) {
      component.selectSearchResult(component.searchResults[i]);
    }

    expect(component.value.length === testSearchResults.length &&
          !Object.is(component.selectedItems, component.value))
      .toBe(true, 'multiple choice is correctly populated');
  });

  it('#should remove selected item by using the remove button', () => {
    component.searchResults = testSearchResults;
    component.multiple = false;

    component.selectSearchResult(testSearchResults[0]);

    component.removeSearchResult(component.selectedItems.size - 1);

    expect(component.value.length === 0)
      .toBe(true, 'selected item successfully removed');
  });

  it('#should be able to populate correctly with a pre-defined SearchResult[] when [multiple] = true', () => {
    component.multiple = true;
    component.value = testSearchResults;
    expect(component.selectedItems.toArray())
      .toEqual(component.value, 'component value and immutable list have the same items and length');
  });

  it('#should be able to populate correctly with a pre-defined SearchResult[] when [multiple] = false', () => {
    component.multiple = false;
    component.value = testSearchResults;
    const itemsToArray = component.selectedItems.toArray();
    expect(itemsToArray.length === 1)
      .toBe(true, 'immutable list has only one item');

    expect(Object.is(itemsToArray[0], component.value[0]))
      .toBe(true, 'the only item is the first one from the value array');
  });


});
