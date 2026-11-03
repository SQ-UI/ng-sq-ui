import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sq-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent { }
