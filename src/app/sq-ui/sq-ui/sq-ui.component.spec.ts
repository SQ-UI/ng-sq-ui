import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqUiComponent } from './sq-ui.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSqUiModule } from '@sq-ui/ng-sq-ui';

describe('SqUiComponent', () => {
  let component: SqUiComponent;
  let fixture: ComponentFixture<SqUiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SqUiComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgSqUiModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
