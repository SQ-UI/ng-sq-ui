import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

import { DatatableColumnComponent } from './datatable-column.component';
import { NgSqCommonModule } from '../../../../ng-sq-common/src/lib/ng-sq-common.module';

describe('DatatableColumnComponent', () => {
  let component: DatatableColumnComponent;
  let fixture: ComponentFixture<DatatableColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableColumnComponent ],
      imports: [
        NgSqCommonModule
      ]
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

  it('#should emit information that the parent should sort by column name', (done: DoneFn) => {
    component.name = 'columnName';
    component.isSortable = true;

    component.ngOnChanges({
      name: new SimpleChange(null, component.name, true),
      isSortable: new SimpleChange(null, component.isSortable , true)
    });

    fixture.detectChanges();

    fixture.whenRenderingDone().then(() => {
      const sortingBtn = fixture.nativeElement.querySelector('button');
      sortingBtn.click();
      fixture.detectChanges();
      expect(component.isSortedByAscending)
        .toEqual(true, 'first time clicking triggers sort by asc');
      sortingBtn.click();
      fixture.detectChanges();
      expect(component.isSortedByAscending)
        .toEqual(false, 'second time clicking triggers sort by desc');
      done();
    });
  });
});
