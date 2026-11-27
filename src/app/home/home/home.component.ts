import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, InputComponent } from '@sq-ui/ng-form-elements';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';
import { componentDemos, demoVariantCount } from '../../catalog/component-catalog';

@Component({
  selector: 'sq-home',
  standalone: true,
  imports: [RouterLink, ButtonComponent, InputComponent, ProgressBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly componentCount = componentDemos.length - 1;
  readonly configurationCount = demoVariantCount;
  readonly categories = [
    { name: 'Forms & selection', icon: 'fa-sliders', description: 'Buttons, text fields, dropdowns, tags, choices and sliders.' },
    { name: 'Layout & navigation', icon: 'fa-layer-group', description: 'Cards and responsive navigation for the structure around your content.' },
    { name: 'Data display', icon: 'fa-table', description: 'Sortable tables, empty states and standalone pagination.' },
    { name: 'Date & time', icon: 'fa-calendar-days', description: 'Single dates, ranges, localized calendars and time pickers.' },
    { name: 'Feedback & overlays', icon: 'fa-window-maximize', description: 'Progress indicators, dialogs and contextual tooltips.' },
  ].map(category => ({ ...category, count: componentDemos.filter(demo => demo.category === category.name).length }));
  readonly projectName = signal('Your next idea');
  readonly saved = signal(false);

  resetPreview() {
    this.projectName.set('Your next idea');
    this.saved.set(false);
  }
}
