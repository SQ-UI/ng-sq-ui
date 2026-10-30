import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseContentComponent } from './collapse-content.component';

@Component({
  standalone: true,
  imports: [CollapseContentComponent],
  template: `
    <sq-collapse-content title="Section title">
      <div sq-collapse-body>
        <input id="probe" type="text">
      </div>
    </sq-collapse-content>
  `,
})
class TestHostComponent { }

describe('CollapseContentComponent', () => {
  let component: CollapseContentComponent;
  let fixture: ComponentFixture<CollapseContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapseContentComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapseContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start expanded and flip its state when toggled', () => {
    expect(component.isCollapsed()).toBe(false);
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(true);
    component.toggleCollapse();
    expect(component.isCollapsed()).toBe(false);
  });

  it('should hide the projected body while collapsed without destroying it', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const host = hostFixture.nativeElement as HTMLElement;
    const body = host.querySelector('.collapsed-content') as HTMLElement;
    const probe = host.querySelector('#probe') as HTMLInputElement;

    expect(body.hidden).toBe(false);
    expect(probe).toBeTruthy();

    probe.value = 'typed by the user';
    (host.querySelector('.btn-collapse') as HTMLButtonElement).click();
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(body.hidden).toBe(true);
    // The node is still in the DOM, so the user's input is preserved.
    expect((host.querySelector('#probe') as HTMLInputElement).value).toBe('typed by the user');
  });
});
