import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableColumnComponent } from './datatable-column.component';
import { SortItem } from '../shared/interfaces/sort-item';

describe('DatatableColumnComponent', () => {
  let component: DatatableColumnComponent;
  let fixture: ComponentFixture<DatatableColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatatableColumnComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableColumnComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'columnName');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cycle ascending -> descending -> original order and emit each state', async () => {
    const emitted: SortItem[] = [];
    component.onSortClicked.subscribe(item => emitted.push(item));
    fixture.componentRef.setInput('isSortable', true);
    fixture.detectChanges();

    await fixture.whenRenderingDone();

    const sortingBtn = fixture.nativeElement.querySelector('button');
    sortingBtn.click();
    fixture.detectChanges();
    expect(component.sortState()).toBe(true);

    sortingBtn.click();
    fixture.detectChanges();
    expect(component.sortState()).toBe(false);

    sortingBtn.click();
    fixture.detectChanges();
    expect(component.sortState()).toBeUndefined();

    expect(emitted.map(item => item.isSortedByAscending)).toEqual([true, false, undefined]);
    expect(emitted.every(item => item.name === 'columnName')).toBe(true);
  });

  it('should reset its sort state when another column becomes the active sort column', () => {
    fixture.componentRef.setInput('isSortable', true);
    fixture.componentRef.setInput('activeSortColumn', null);
    fixture.detectChanges();

    component.sort();
    fixture.componentRef.setInput('activeSortColumn', 'columnName');
    fixture.detectChanges();
    expect(component.sortState()).toBe(true);

    fixture.componentRef.setInput('activeSortColumn', 'otherColumn');
    fixture.detectChanges();
    expect(component.sortState()).toBeUndefined();
  });
});
