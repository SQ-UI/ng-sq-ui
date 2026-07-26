import {
  Component, ViewEncapsulation, ChangeDetectionStrategy,
  input, model, signal, output, effect
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { generateFormFieldId } from '@sq-ui/ng-sq-common';
import { TimeUnit } from '../enums/time-unit.enum';
import { TimeObject } from '../enums/time-object-type.enum';
import { Temporal } from '@js-temporal/polyfill';

@Component({
  selector: 'sq-time-picker',
  standalone: true,
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class TimePickerComponent {
  // FormFieldConfig signal inputs
  readonly name = input<string>(generateFormFieldId());
  readonly controlId = input<string>(generateFormFieldId());
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<string>('');
  readonly disabled = input<boolean>(false);

  // Two-way binding value
  readonly value = model<any>(null);

  // Component-specific signal inputs
  readonly hourStep = input<number>(1);
  readonly minuteStep = input<number>(1);
  readonly isMeridiem = input<boolean>(false);
  readonly isEditable = input<boolean>(true);
  readonly inputHours = input<number | undefined>(undefined, { alias: 'hours' });
  readonly inputMinutes = input<number | undefined>(undefined, { alias: 'minutes' });
  readonly timeObjectType = input<string>(TimeObject.String);

  // Signal outputs replacing EventEmitter
  readonly inputHoursChange = output<number>({ alias: 'hoursChange' });
  readonly inputMinutesChange = output<number>({ alias: 'minutesChange' });

  // Internal signal state
  readonly hours = signal<string>('');
  readonly minutes = signal<string>('');
  readonly noonRelativity = signal<string>('am');
  readonly timeUnit = TimeUnit;

  // Internal Temporal.PlainTime tracking current time state
  private currentTime = signal<Temporal.PlainTime>(Temporal.Now.plainTimeISO());

  readonly limits = signal({
    hours: { min: 0, max: 24 },
    minutes: { min: 0, max: 59 },
  });

  constructor() {
    // Initialize display from current time
    const now = this.currentTime();
    this.hours.set(now.hour.toString().padStart(2, '0'));
    this.minutes.set(now.minute.toString().padStart(2, '0'));

    // React to isMeridiem changes
    effect(() => {
      const meridiem = this.isMeridiem();
      const time = this.currentTime();

      if (meridiem) {
        this.limits.set({
          hours: { min: 1, max: 12 },
          minutes: { min: 0, max: 59 },
        });
        this.hours.set(this.formatMeridiemHour(time.hour));
        this.noonRelativity.set(time.hour >= 12 ? 'pm' : 'am');
      } else {
        this.limits.set({
          hours: { min: 0, max: 24 },
          minutes: { min: 0, max: 59 },
        });
        this.hours.set(time.hour.toString().padStart(2, '0'));
      }
      this.setValueResult();
    });

    // React to timeObjectType changes
    effect(() => {
      // Read the signal to subscribe to its changes
      this.timeObjectType();
      this.setValueResult();
    });

    // React to inputHours changes
    effect(() => {
      const h = this.inputHours();
      if (h !== null && h !== undefined && h > -1) {
        const time = this.currentTime();
        const newTime = Temporal.PlainTime.from({ hour: h, minute: time.minute });
        this.currentTime.set(newTime);
        if (this.isMeridiem()) {
          this.hours.set(this.formatMeridiemHour(h));
          this.noonRelativity.set(h >= 12 ? 'pm' : 'am');
        } else {
          this.hours.set(h.toString().padStart(2, '0'));
        }
        this.setValueResult();
      }
    });

    // React to inputMinutes changes
    effect(() => {
      const m = this.inputMinutes();
      if (m !== null && m !== undefined && m > -1) {
        const time = this.currentTime();
        const newTime = Temporal.PlainTime.from({ hour: time.hour, minute: m });
        this.currentTime.set(newTime);
        this.minutes.set(m.toString().padStart(2, '0'));
        this.setValueResult();
      }
    });

    // Set initial value
    this.setValueResult();
  }

  increment(unit: TimeUnit) {
    const time = this.currentTime();
    switch (unit) {
      case TimeUnit.Hours: {
        const newTime = time.add({ hours: this.hourStep() });
        this.currentTime.set(newTime);
        this.updateHoursDisplay(newTime);
        this.inputHoursChange.emit(newTime.hour);
        break;
      }
      case TimeUnit.Minutes: {
        const newTime = time.add({ minutes: this.minuteStep() });
        this.currentTime.set(newTime);
        this.minutes.set(newTime.minute.toString().padStart(2, '0'));
        this.inputMinutesChange.emit(newTime.minute);
        break;
      }
    }
    this.setValueResult();
  }

  decrement(unit: TimeUnit) {
    const time = this.currentTime();
    switch (unit) {
      case TimeUnit.Hours: {
        const newTime = time.subtract({ hours: this.hourStep() });
        this.currentTime.set(newTime);
        this.updateHoursDisplay(newTime);
        this.inputHoursChange.emit(newTime.hour);
        break;
      }
      case TimeUnit.Minutes: {
        const newTime = time.subtract({ minutes: this.minuteStep() });
        this.currentTime.set(newTime);
        this.minutes.set(newTime.minute.toString().padStart(2, '0'));
        this.inputMinutesChange.emit(newTime.minute);
        break;
      }
    }
    this.setValueResult();
  }

  changeNoonRelativity() {
    this.noonRelativity.set(this.noonRelativity() === 'am' ? 'pm' : 'am');
    // Also update the underlying time to reflect the AM/PM flip
    const time = this.currentTime();
    const hour = time.hour;
    let newHour: number;
    if (this.noonRelativity() === 'pm' && hour < 12) {
      newHour = hour + 12;
    } else if (this.noonRelativity() === 'am' && hour >= 12) {
      newHour = hour - 12;
    } else {
      newHour = hour;
    }
    this.currentTime.set(Temporal.PlainTime.from({ hour: newHour, minute: time.minute }));
    this.setValueResult();
  }

  validateInput(unit: TimeUnit) {
    const currentLimits = this.limits();
    switch (unit) {
      case TimeUnit.Hours:
        this.hours.set(this.normalizeTimeInput(this.hours(), TimeUnit.Hours, currentLimits));
        break;
      case TimeUnit.Minutes:
        this.minutes.set(this.normalizeTimeInput(this.minutes(), TimeUnit.Minutes, currentLimits));
        break;
    }
    // Sync currentTime from the display values
    this.syncCurrentTimeFromDisplay();
    this.setValueResult();
  }

  private normalizeTimeInput(
    value: string,
    unit: TimeUnit,
    currentLimits: { hours: { min: number; max: number }; minutes: { min: number; max: number } }
  ): string {
    if (!value) {
      value = '00';
    }

    const unitLimits = unit === TimeUnit.Hours ? currentLimits.hours : currentLimits.minutes;

    if (parseInt(value, 10) >= unitLimits.max) {
      value = unitLimits.max.toString();

      if (unit === TimeUnit.Hours && !this.isMeridiem()) {
        value = '00';
      }
    }

    if (parseInt(value, 10) < unitLimits.min) {
      value = unitLimits.min.toString();
    }

    return value;
  }

  private updateHoursDisplay(time: Temporal.PlainTime) {
    if (this.isMeridiem()) {
      this.hours.set(this.formatMeridiemHour(time.hour));
      this.noonRelativity.set(time.hour >= 12 ? 'pm' : 'am');
    } else {
      this.hours.set(time.hour.toString().padStart(2, '0'));
    }
  }

  private formatMeridiemHour(hour24: number): string {
    let h = hour24 % 12;
    if (h === 0) h = 12;
    return h.toString().padStart(2, '0');
  }

  private syncCurrentTimeFromDisplay() {
    let hour = parseInt(this.hours(), 10);
    const minute = parseInt(this.minutes(), 10);

    if (this.isMeridiem()) {
      // Convert 12-hour display to 24-hour for internal tracking
      if (this.noonRelativity() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (this.noonRelativity() === 'am' && hour === 12) {
        hour = 0;
      }
    }

    // Clamp to valid PlainTime range
    hour = Math.max(0, Math.min(23, hour));
    const clampedMinute = Math.max(0, Math.min(59, minute));

    this.currentTime.set(Temporal.PlainTime.from({ hour, minute: clampedMinute }));
  }

  private setValueResult() {
    const hoursStr = this.hours();
    const minutesStr = this.minutes();
    let timeString = `${hoursStr}:${minutesStr}`;
    timeString = this.isMeridiem() ? `${timeString} ${this.noonRelativity().toUpperCase()}` : timeString;

    if (this.timeObjectType() === TimeObject.PlainTime || this.timeObjectType() === TimeObject.Moment) {
      // Return a Temporal.PlainTime instead of moment
      const time = this.currentTime();
      this.value.set(Temporal.PlainTime.from({ hour: time.hour, minute: time.minute }));
    } else {
      this.value.set(timeString);
    }
  }
}
