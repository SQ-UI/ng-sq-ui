import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { parseTemplate } from '@angular/compiler';
import { componentDemos } from './component-catalog';
import { DemoExampleComponent } from './demo-example.component';
import { exampleCode } from './example-code';

describe('Catalog live configurations', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [DemoExampleComponent], providers: [provideRouter([])] }));

  for (const demo of componentDemos) {
    for (const config of demo.variants) {
      it(`renders ${demo.id}/${config.id} and supplies valid Angular template syntax`, async () => {
        const fixture = TestBed.createComponent(DemoExampleComponent);
        fixture.componentRef.setInput('demo', demo);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const selector = demo.id === 'tooltip' || demo.id === 'modal' ? 'button' : demo.selector;
        expect(fixture.nativeElement.querySelector(selector)).not.toBeNull();
        const code = exampleCode(demo, config);
        expect(parseTemplate(code.template, `${demo.id}/${config.id}`).errors).toBeNull();
        expect(code.setup).toContain(demo.exportName);
      });
    }
  }

  it('updates a radio group value when choosing the other option', () => {
    const demo = componentDemos.find(demo => demo.id === 'radiobutton')!;
    const fixture = TestBed.createComponent(DemoExampleComponent);
    fixture.componentRef.setInput('demo', demo);
    fixture.componentRef.setInput('config', demo.variants[0]);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('input')[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('output').textContent).toContain('express');
  });
});
