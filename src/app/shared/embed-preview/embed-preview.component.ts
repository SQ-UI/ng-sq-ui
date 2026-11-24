import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { InputComponent, DropdownComponent, TagsInputComponent, CheckboxComponent, ButtonComponent } from '@sq-ui/ng-form-elements';
import { PaginatorComponent, type LabelValuePair } from '@sq-ui/ng-sq-common';
import { DatatableComponent } from '@sq-ui/ng-datatable';
import { DatetimePickerComponent, TimePickerComponent, type DatetimePickerValue } from '@sq-ui/ng-datetime-picker';
import { ModalComponent } from '@sq-ui/ng-modal';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';
import { NavbarPreviewComponent } from '../navbar-preview/navbar-preview.component';
import { CardPreviewComponent } from '../card-preview/card-preview.component';
import { SliderPreviewComponent } from '../slider-preview/slider-preview.component';

/** Focused, interactive examples shared by the hosted demo and Docsify iframes. */
@Component({
  selector: 'sq-embed-preview',
  standalone: true,
  imports: [InputComponent, DropdownComponent, TagsInputComponent, CheckboxComponent,
    ButtonComponent, PaginatorComponent, DatatableComponent, DatetimePickerComponent,
    TimePickerComponent, ModalComponent, ProgressBarComponent, NavbarPreviewComponent, CardPreviewComponent, SliderPreviewComponent],
  templateUrl: './embed-preview.component.html',
  styleUrls: ['./embed-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmbedPreviewComponent {
  readonly example = toSignal(inject(ActivatedRoute).paramMap.pipe(
    map(params => params.get('example')),
  ));
  readonly name = signal('Alex');
  readonly team = signal<LabelValuePair | null>(null);
  readonly tags = signal(['Angular', 'Design']);
  readonly updates = signal(true);
  readonly saved = signal('');
  readonly teams: LabelValuePair[] = [
    { label: 'Design', value: 'design' }, { label: 'Engineering', value: 'engineering' },
    { label: 'Documentation', value: 'documentation' },
  ];
  readonly rows = Array.from({ length: 18 }, (_, index) => ({
    id: index + 1, name: `Example ${index + 1}`, status: index % 2 ? 'In progress' : 'Ready',
  }));
  readonly page = signal<typeof this.rows>([]);
  readonly date = signal<DatetimePickerValue>(null);
  readonly range = signal<DatetimePickerValue>([]);
  readonly modal = signal(false);
  readonly progress = signal(25);

  save(): void {
    const team = this.team();
    this.saved.set(`Saved ${this.name().trim()}${team ? ' · ' + team.label : ''}`);
  }

  reset(): void {
    this.name.set('Alex');
    this.team.set(null);
    this.tags.set(['Angular', 'Design']);
    this.updates.set(true);
    this.saved.set('');
  }
}
