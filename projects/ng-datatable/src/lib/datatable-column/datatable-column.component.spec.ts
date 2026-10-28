import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableColumnComponent } from './datatable-column.component';

describe('DatatableColumnComponent', () => {
  let component: DatatableColumnComponent;
  let fixture: ComponentFixture<DatatableColumnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DatatableColumnComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit information that the parent should sort by column name', async () => {
    fixture.componentRef.setInput('name', 'columnName');
    fixture.componentRef.setInput('isSortable', true);
    fixture.detectChanges();

    await fixture.whenRenderingDone();

    const sortingBtn = fixture.nativeElement.querySelector('button');
    sortingBtn.click();
    fixture.detectChanges();
    expect(component.isSortedByAscending)
      .toEqual(true);
    sortingBtn.click();
    fixture.detectChanges();
    expect(component.isSortedByAscending)
      .toEqual(false);
  });
});
