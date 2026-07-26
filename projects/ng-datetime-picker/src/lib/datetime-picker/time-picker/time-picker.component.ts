import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  model,
  output,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Temporal } from '@js-temporal/polyfill';
import { SqInputCore } from '@sq-ui/ng-sq-common';

import { TimeUnit } from '../enums/time-unit.enum';

type NoonRelativity = 'am' | 'pm';

/**
 * Signal Forms-compatible time picker.
 *
 * Canonical `value` is a {@link Temporal.PlainTime}. Display state is derived
 * from `value` + `isMeridiem` via `linkedSignal`, which resets automatically on
 * upstream changes but stays writable while the user is typing.
 *
 * The optional `hours` / `minutes` inputs let parents seed initial numeric
 * values; matching change outputs fire whenever the user increments, decrements,
 * or validates a field.
 */
@Component({
  selector: 'sq-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TimePickerComponent extends SqInputCore implements FormValueControl<Temporal.PlainTime | null> {
  readonly value = model<Temporal.PlainTime | null>(Temporal.Now.plainTimeISO());

  readonly hourStep = input(1);
  readonly minuteStep = input(1);
  readonly isMeridiem = input(false);
  readonly isEditable = input(true);
  readonly hours = input<number | null>(null);
  readonly minutes = input<number | null>(null);

  readonly hoursChange = output<number>();
  readonly minutesChange = output<number>();

  readonly timeUnit = TimeUnit;

  protected readonly limits = computed(() => {
    if (this.isMeridiem()) {
      return { hours: { min: 1, max: 12 }, minutes: { min: 0, max: 59 } };
    }
    return { hours: { min: 0, max: 23 }, minutes: { min: 0, max: 59 } };
  });

  /**
   * Derived-but-writable text mirrors of the current {@link value}. Typing into
   * the inputs writes here directly; when `value`/`isMeridiem` change upstream
   * the display resets to the freshly-formatted representation.
   */
  protected readonly hoursText = linkedSignal<{ hour: number; meridiem: boolean }, string>({
    source: () => ({ hour: this.value()?.hour ?? 0, meridiem: this.isMeridiem() }),
    computation: ({ hour, meridiem }) =>
      meridiem ? this.to12HourDisplay(hour) : this.pad2(hour),
  });

  protected readonly minutesText = linkedSignal<number, string>({
    source: () => this.value()?.minute ?? 0,
    computation: (minute) => this.pad2(minute),
  });

  protected readonly noonRelativity = linkedSignal<number, NoonRelativity>({
    source: () => this.value()?.hour ?? 0,
    computation: (hour) => (hour >= 12 ? 'pm' : 'am'),
  });

  constructor() {
    super();

    // One-way `hours` input — seed hour without touching the minute.
    effect(() => {
      const h = this.hours();
      if (h == null) {
        return;
      }
      untracked(() => {
        const currentValue = this.value() ?? new Temporal.PlainTime(0, 0);
        const nextHour = this.clampHour24(h);
        if (currentValue.hour === nextHour) {
          return;
        }
        this.value.set(new Temporal.PlainTime(nextHour, currentValue.minute));
      });
    });

    // One-way `minutes` input — seed minute without touching the hour.
    effect(() => {
      const m = this.minutes();
      if (m == null) {
        return;
      }
      untracked(() => {
        const currentValue = this.value() ?? new Temporal.PlainTime(0, 0);
        const nextMinute = this.clampMinute(m);
        if (currentValue.minute === nextMinute) {
          return;
        }
        this.value.set(new Temporal.PlainTime(currentValue.hour, nextMinute));
      });
    });
  }

  increment(unit: TimeUnit): void {
    const step = unit === TimeUnit.Hours ? this.hourStep() : this.minuteStep();
    this.shift(unit, step);
    this.emitPart(unit);
  }

  decrement(unit: TimeUnit): void {
    const step = unit === TimeUnit.Hours ? this.hourStep() : this.minuteStep();
    this.shift(unit, -step);
    this.emitPart(unit);
  }

  changeNoonRelativity(): void {
    const nextRelativity: NoonRelativity = this.noonRelativity() === 'am' ? 'pm' : 'am';
    this.noonRelativity.set(nextRelativity);
    this.recomputeValueFromDisplay();
  }

  onHoursInput(raw: string): void {
    this.hoursText.set(raw);
  }

  onMinutesInput(raw: string): void {
    this.minutesText.set(raw);
  }

  validateInput(unit: TimeUnit, raw?: string): void {
    const source = raw ?? (unit === TimeUnit.Hours ? this.hoursText() : this.minutesText());
    const normalised = this.normalizeTimeInput(source, unit);
    if (unit === TimeUnit.Hours) {
      this.hoursText.set(normalised);
    } else {
      this.minutesText.set(normalised);
    }
    this.recomputeValueFromDisplay();
    this.emitPart(unit);
  }

  private shift(unit: TimeUnit, delta: number): void {
    const current = this.value() ?? new Temporal.PlainTime(0, 0);
    const next =
      unit === TimeUnit.Hours
        ? current.add({ hours: delta })
        : current.add({ minutes: delta });
    this.value.set(next);
  }

  private recomputeValueFromDisplay(): void {
    const hour24 = this.clamp24(this.parseHourFromDisplay(), this.isMeridiem(), this.noonRelativity());
    const minute = this.clampMinute(this.parseMinuteFromDisplay());
    this.value.set(new Temporal.PlainTime(hour24, minute));
  }

  private emitPart(unit: TimeUnit): void {
    const v = this.value();
    if (!v) {
      return;
    }
    if (unit === TimeUnit.Hours) {
      this.hoursChange.emit(v.hour);
    } else {
      this.minutesChange.emit(v.minute);
    }
  }

  private to12HourDisplay(hour24: number): string {
    const twelve = hour24 % 12;
    return this.pad2(twelve === 0 ? 12 : twelve);
  }

  private clamp24(hour: number, meridiem: boolean, relativity: NoonRelativity): number {
    if (!Number.isFinite(hour)) {
      return 0;
    }

    if (meridiem) {
      let h = Math.max(1, Math.min(12, Math.trunc(hour)));
      // Map 12 AM → 0h, 1..11 AM → 1..11, 12 PM → 12, 1..11 PM → 13..23.
      if (relativity === 'am') {
        h = h === 12 ? 0 : h;
      } else if (h !== 12) {
        h += 12;
      }
      return h;
    }

    return this.clampHour24(hour);
  }

  private clampHour24(hour: number): number {
    if (!Number.isFinite(hour)) {
      return 0;
    }
    return Math.max(0, Math.min(23, Math.trunc(hour)));
  }

  private clampMinute(minute: number): number {
    if (!Number.isFinite(minute)) {
      return 0;
    }
    return Math.max(0, Math.min(59, Math.trunc(minute)));
  }

  private parseHourFromDisplay(): number {
    const raw = parseInt(this.hoursText(), 10);
    return Number.isNaN(raw) ? 0 : raw;
  }

  private parseMinuteFromDisplay(): number {
    const raw = parseInt(this.minutesText(), 10);
    return Number.isNaN(raw) ? 0 : raw;
  }

  private pad2(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private normalizeTimeInput(raw: string, unit: TimeUnit): string {
    const limits = this.limits();
    const trimmed = (raw ?? '').trim();
    let numeric = parseInt(trimmed || '0', 10);
    if (Number.isNaN(numeric)) {
      numeric = 0;
    }

    if (numeric >= limits[unit].max) {
      if (unit === TimeUnit.Hours && !this.isMeridiem()) {
        // 24h mode wraps 24 → 00; keeps parity with the moment-based picker.
        numeric = numeric >= 24 ? 0 : limits[unit].max;
      } else {
        numeric = limits[unit].max;
      }
    }

    if (numeric < limits[unit].min) {
      numeric = limits[unit].min;
    }

    return this.pad2(numeric);
  }
}
