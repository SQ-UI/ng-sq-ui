import { TestBed } from '@angular/core/testing';
import { Temporal } from '@js-temporal/polyfill';

import { TimeUnit } from '../enums/time-unit.enum';
import { TimePickerComponent } from './time-picker.component';

type StubbableInput = 'hourStep' | 'minuteStep' | 'isMeridiem' | 'isEditable' | 'hours' | 'minutes';

function stubInput<T>(component: TimePickerComponent, name: StubbableInput, value: T): void {
  Object.defineProperty(component, name, { value: () => value, configurable: true });
}

function build(overrides?: Partial<Record<StubbableInput, unknown>>): TimePickerComponent {
  TestBed.configureTestingModule({});
  const component = TestBed.runInInjectionContext(() => new TimePickerComponent());
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      stubInput(component, key as StubbableInput, value);
    }
  }
  return component;
}

describe('TimePickerComponent', () => {
  it('should create', () => {
    const component = build();
    expect(component).toBeTruthy();
  });

  it('initialises value to the current PlainTime (rounded to seconds)', () => {
    const component = build();
    const value = component.value();
    expect(value).toBeInstanceOf(Temporal.PlainTime);
  });

  it('increment/decrement operate on hours and minutes with configured step', () => {
    const component = build({ hourStep: 2, minuteStep: 15 });
    component.value.set(new Temporal.PlainTime(10, 30));

    component.increment(TimeUnit.Hours);
    expect(component.value()?.hour).toBe(12);

    component.decrement(TimeUnit.Minutes);
    expect(component.value()?.minute).toBe(15);
  });

  it('increment wraps hours across midnight via PlainTime.add', () => {
    const component = build({ hourStep: 1 });
    component.value.set(new Temporal.PlainTime(23, 45));
    component.increment(TimeUnit.Hours);
    expect(component.value()?.hour).toBe(0);
  });

  it('renders 24h format when isMeridiem=false', () => {
    const component = build();
    component.value.set(new Temporal.PlainTime(14, 5));
    // Access protected signal via bracket lookup for test purposes.
    expect((component as unknown as { hoursText: () => string }).hoursText()).toBe('14');
    expect((component as unknown as { minutesText: () => string }).minutesText()).toBe('05');
  });

  it('renders 12h format when isMeridiem=true', () => {
    const component = build({ isMeridiem: true });
    component.value.set(new Temporal.PlainTime(14, 30));
    expect((component as unknown as { hoursText: () => string }).hoursText()).toBe('02');
    expect((component as unknown as { noonRelativity: () => string }).noonRelativity()).toBe('pm');

    component.value.set(new Temporal.PlainTime(0, 0));
    expect((component as unknown as { hoursText: () => string }).hoursText()).toBe('12');
    expect((component as unknown as { noonRelativity: () => string }).noonRelativity()).toBe('am');
  });

  it('changeNoonRelativity toggles AM ↔ PM and adjusts the underlying value', () => {
    const component = build({ isMeridiem: true });
    component.value.set(new Temporal.PlainTime(9, 15));

    expect((component as unknown as { noonRelativity: () => string }).noonRelativity()).toBe('am');
    component.changeNoonRelativity();

    expect(component.value()?.hour).toBe(21);
    expect((component as unknown as { noonRelativity: () => string }).noonRelativity()).toBe('pm');

    component.changeNoonRelativity();
    expect(component.value()?.hour).toBe(9);
  });

  it('validateInput clamps values above the max in 12h mode', () => {
    const component = build({ isMeridiem: true });
    component.value.set(new Temporal.PlainTime(1, 0));

    component.validateInput(TimeUnit.Hours, '22');
    expect((component as unknown as { hoursText: () => string }).hoursText()).toBe('12');

    component.validateInput(TimeUnit.Minutes, '90');
    expect((component as unknown as { minutesText: () => string }).minutesText()).toBe('59');
  });

  it('validateInput wraps 24 → 00 in 24h mode', () => {
    const component = build();
    component.validateInput(TimeUnit.Hours, '24');
    expect((component as unknown as { hoursText: () => string }).hoursText()).toBe('00');
    expect(component.value()?.hour).toBe(0);
  });

  it('validateInput clamps negatives to the minimum value', () => {
    const component = build();
    component.validateInput(TimeUnit.Hours, '-5');
    component.validateInput(TimeUnit.Minutes, '-5');
    expect(component.value()?.hour).toBe(0);
    expect(component.value()?.minute).toBe(0);
  });

  it('emits hoursChange/minutesChange on user increments', () => {
    const component = build({ hourStep: 1, minuteStep: 1 });
    component.value.set(new Temporal.PlainTime(10, 30));

    let hoursEmitted: number | null = null;
    let minutesEmitted: number | null = null;
    component.hoursChange.subscribe((h) => (hoursEmitted = h));
    component.minutesChange.subscribe((m) => (minutesEmitted = m));

    component.increment(TimeUnit.Hours);
    component.increment(TimeUnit.Minutes);

    expect(hoursEmitted).toBe(11);
    expect(minutesEmitted).toBe(31);
  });
});
