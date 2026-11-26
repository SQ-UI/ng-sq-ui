import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { componentDemos } from './component-catalog';
import { exampleCode } from './example-code';
import { DemoExampleComponent } from './demo-example.component';

@Component({
  selector: 'sq-component-detail',
  imports: [RouterLink, DemoExampleComponent],
  templateUrl: './component-detail.component.html',
  styleUrls: ['./component-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly demo = computed(() => componentDemos.find(demo => demo.id === this.params().get('component')));
  readonly config = computed(() => {
    const demo = this.demo();
    return demo?.variants.find(config => config.id === this.query().get('variant')) ?? demo?.variants[0];
  });
  readonly backQuery = computed(() => ({ q: this.query().get('q'), category: this.query().get('category') }));
  readonly code = computed(() => {
    const demo = this.demo();
    const config = this.config();
    return demo && config ? exampleCode(demo, config) : { setup: '', template: '' };
  });
  readonly settings = computed(() => Object.entries(this.config()?.inputs ?? {}).map(([name, value]) => ({ name, value: JSON.stringify(value) })));
  readonly related = computed(() => componentDemos.filter(demo => demo.category === this.demo()?.category && demo.id !== this.demo()?.id));
  readonly resetCount = signal(0);
  readonly copyStatus = signal('');
  readonly exampleKey = computed(() => `${this.demo()?.id}/${this.config()?.id}/${this.resetCount()}`);
  readonly examples = computed(() => [{ key: this.exampleKey() }]);

  async copyCode(): Promise<void> {
    try {
      const clipboard = this.document.defaultView?.navigator.clipboard;
      if (!clipboard) throw new Error('Clipboard unavailable');
      const code = this.code();
      await clipboard.writeText(code.setup + '\n\n// Template\n' + code.template);
      this.copyStatus.set('Example copied.');
    } catch {
      this.copyStatus.set('Copy is unavailable in this browser. Select the code below to copy it.');
    }
  }
}
