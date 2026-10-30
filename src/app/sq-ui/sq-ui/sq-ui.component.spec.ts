import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';

import { SqUiComponent } from './sq-ui.component';

describe('SqUiComponent', () => {
  let component: SqUiComponent;
  let fixture: ComponentFixture<SqUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SqUiComponent],
      providers: [provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SqUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
