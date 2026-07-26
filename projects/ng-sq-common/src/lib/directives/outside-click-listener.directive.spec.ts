import { OutsideClickListenerDirective } from './outside-click-listener.directive';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

@Component({
  standalone: true,
  imports: [OutsideClickListenerDirective],
  template: `<div sqOutsideClickListener [listenForOutsideClick]="true" (clickOutside)="onClickOutside()"></div>`
})
class TestHostComponent {
  onClickOutside = vi.fn();
}

describe('OutsideClickListenerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
