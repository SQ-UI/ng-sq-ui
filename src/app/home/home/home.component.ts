import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, InputComponent } from '@sq-ui/ng-form-elements';
import { ProgressBarComponent } from '@sq-ui/ng-progress-bar';

@Component({
  selector: 'sq-home',
  standalone: true,
  imports: [RouterLink, ButtonComponent, InputComponent, ProgressBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly projectName = signal('Your next idea');
  readonly saved = signal(false);

  resetPreview() {
    this.projectName.set('Your next idea');
    this.saved.set(false);
  }
}
