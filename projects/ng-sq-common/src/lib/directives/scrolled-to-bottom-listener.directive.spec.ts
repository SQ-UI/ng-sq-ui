import { ScrolledToBottomListenerDirective } from './scrolled-to-bottom-listener.directive';
import { Component, ViewChild } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

@Component({
  standalone: true,
  imports: [ScrolledToBottomListenerDirective],
  template: `<div sqScrolledToBottomListener (scrolledToBottom)="onScrolledToBottom()" style="height:100px;overflow:auto;"></div>`
})
class TestHostComponent {
  @ViewChild(ScrolledToBottomListenerDirective) directive!: ScrolledToBottomListenerDirective;
  onScrolledToBottom = vi.fn();
}

describe('ScrolledToBottomListenerDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component.directive).toBeTruthy();
  });

  it('should emit an event when the user has scrolled to the bottom of the container', () => {
    const directive = component.directive;
    const mockHtmlEl = {
      scrollTop: 1400,
      scrollHeight: 2400,
      clientHeight: 1000
    };

    vi.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(directive.scrolledToBottom.emit).toHaveBeenCalled();
  });

  it('should not emit an event when the user has not scrolled to the bottom of the container', () => {
    const directive = component.directive;
    const mockHtmlEl = {
      scrollTop: 1400,
      scrollHeight: 1500,
      clientHeight: 1000
    };

    vi.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(directive.scrolledToBottom.emit).not.toHaveBeenCalled();
  });

  it('should not emit an event when the user remains at the bottom of the container', () => {
    const directive = component.directive;
    const mockHtmlEl = {
      scrollTop: 0,
      scrollHeight: 1500,
      clientHeight: 1000
    };

    vi.spyOn(directive.scrolledToBottom, 'emit');
    directive.checkIfHasScrolledToBottom(mockHtmlEl as HTMLElement);

    expect(directive.scrolledToBottom.emit).not.toHaveBeenCalled();
  });
});
