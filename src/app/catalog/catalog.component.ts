import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { componentDemos, demoCategories, demoVariantCount, matchesDemo } from './component-catalog';

@Component({
  selector: 'sq-catalog',
  imports: [RouterLink],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly query = computed(() => this.params().get('q') ?? '');
  readonly category = computed(() => {
    const category = this.params().get('category') ?? '';
    return demoCategories.includes(category) ? category : '';
  });
  readonly categories = demoCategories;
  readonly demos = componentDemos;
  readonly variantCount = demoVariantCount;
  readonly filtered = computed(() => componentDemos.filter(demo => matchesDemo(demo, this.query(), this.category())));
  readonly groups = computed(() => demoCategories.map(name => ({ name, demos: this.filtered().filter(demo => demo.category === name) })).filter(group => group.demos.length));

  search(event: Event): void {
    this.update({ q: (event.target as HTMLInputElement).value || null }, true);
  }

  selectCategory(category: string): void {
    this.update({ category: category || null });
  }

  clear(): void {
    this.update({ q: null, category: null });
  }

  private update(queryParams: Record<string, string | null>, replaceUrl = false): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl });
  }
}
