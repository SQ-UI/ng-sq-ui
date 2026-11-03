import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeUnit } from '../enums/time-unit.enum';
import { Temporal } from '@sq-ui/ng-datetime-picker/temporal';
import { TimePickerComponent } from './time-picker.component';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePickerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current time', () => {
    expect(component.hours()).toBeTruthy();
    expect(component.minutes()).toBeTruthy();
    expect(component.hours().length).toBe(2);
    expect(component.minutes().length).toBe(2);
  });

  it('should increment hours', () => {
    // Set a known time state
    component.hours.set('10');
    component.minutes.set('30');
    component.validateInput(TimeUnit.Hours);
    component.validateInput(TimeUnit.Minutes);

    const initialHour = parseInt(component.hours(), 10);
    component.increment(TimeUnit.Hours);
    fixture.detectChanges();

    const newHour = parseInt(component.hours(), 10);
    // After incrementing by 1 (default step), hour should change
    expect(newHour).not.toBe(initialHour);
  });

  it('should decrement hours', () => {
    component.hours.set('10');
    component.minutes.set('30');
    component.validateInput(TimeUnit.Hours);
    component.validateInput(TimeUnit.Minutes);

    const initialHour = parseInt(component.hours(), 10);
    component.decrement(TimeUnit.Hours);
    fixture.detectChanges();

    const newHour = parseInt(component.hours(), 10);
    expect(newHour).not.toBe(initialHour);
  });

  it('should increment minutes', () => {
    component.hours.set('10');
    component.minutes.set('30');
    component.validateInput(TimeUnit.Hours);
    component.validateInput(TimeUnit.Minutes);

    component.increment(TimeUnit.Minutes);
    fixture.detectChanges();

    expect(component.minutes()).toBe('31');
  });

  it('should decrement minutes', () => {
    component.hours.set('10');
    component.minutes.set('30');
    component.validateInput(TimeUnit.Hours);
    component.validateInput(TimeUnit.Minutes);

    component.decrement(TimeUnit.Minutes);
    fixture.detectChanges();

    expect(component.minutes()).toBe('29');
  });

  it('should change noon relativity when isMeridiem is active', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('isMeridiem', true);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const initialRelativity = component.noonRelativity();
    component.changeNoonRelativity();
    fixture.detectChanges();

    expect(component.noonRelativity()).not.toBe(initialRelativity);
  });

  it('should normalize invalid hour input', () => {
    component.hours.set('99');
    component.validateInput(TimeUnit.Hours);
    fixture.detectChanges();

    // In 24h mode, max is 24 but wraps to 00
    expect(component.hours()).toBe('00');
  });

  it('should normalize invalid minute input', () => {
    component.minutes.set('75');
    component.validateInput(TimeUnit.Minutes);
    fixture.detectChanges();

    expect(component.minutes()).toBe('59');
  });

  it('should normalize empty hour input to 00', () => {
    component.hours.set('');
    component.validateInput(TimeUnit.Hours);
    fixture.detectChanges();

    expect(component.hours()).toBe('00');
  });

  it('should output string value by default', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('timeObjectType', 'string');
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(typeof component.value()).toBe('string');
  });

  it('should output PlainTime value when timeObjectType is plaintime', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('timeObjectType', 'plaintime');
    component = fixture.componentInstance;
    fixture.detectChanges();

    const val = component.value();
    // Check duck-type for Temporal.PlainTime properties
    expect(val).toBeTruthy();
    expect(val instanceof Temporal.PlainTime).toBe(true);

    const plainTime = val as Temporal.PlainTime;
    expect(typeof plainTime.hour).toBe('number');
    expect(typeof plainTime.minute).toBe('number');
  });

  it('should use meridiem format limits when isMeridiem is true', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('isMeridiem', true);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const limits = component.limits();
    expect(limits.hours.min).toBe(1);
    expect(limits.hours.max).toBe(12);
  });

  it('should include AM/PM in string value when isMeridiem is true', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('isMeridiem', true);
    fixture.componentRef.setInput('timeObjectType', 'string');
    component = fixture.componentInstance;
    fixture.detectChanges();

    const val = component.value() as string;
    expect(val).toMatch(/(AM|PM)$/);
  });

  it('should not throw on non-numeric hour or minute input', () => {
    component.hours.set('ab');
    expect(() => component.validateInput(TimeUnit.Hours)).not.toThrow();
    expect(component.hours()).toBe('00');

    component.minutes.set('x');
    expect(() => component.validateInput(TimeUnit.Minutes)).not.toThrow();
    expect(component.minutes()).toBe('00');
  });

  it('should keep the tracked hour when another field is blurred with unparsed text', () => {
    component.hours.set('14');
    component.minutes.set('30');
    component.validateInput(TimeUnit.Hours);

    component.hours.set('zz');
    component.minutes.set('45');
    expect(() => component.validateInput(TimeUnit.Minutes)).not.toThrow();
    expect(component.value()).toBe('zz:45');
  });

  it('should show a time written to the value model', () => {
    component.value.set('09:05');
    fixture.detectChanges();

    expect(component.hours()).toBe('09');
    expect(component.minutes()).toBe('05');
  });

  it('should seed the display from a bound PlainTime value', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('timeObjectType', 'plaintime');
    fixture.componentRef.setInput('value', Temporal.PlainTime.from({ hour: 7, minute: 15 }));
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.hours()).toBe('07');
    expect(component.minutes()).toBe('15');
    expect(String(component.value())).toBe('07:15:00');
  });

  it('should parse a meridiem string into the 24-hour time it represents', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('timeObjectType', 'plaintime');
    fixture.componentRef.setInput('value', '02:30 PM');
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(String(component.value())).toBe('14:30:00');
  });

  it('should replace a null value with the time on display', () => {
    fixture = TestBed.createComponent(TimePickerComponent);
    fixture.componentRef.setInput('value', null);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.value()).toBe(`${component.hours()}:${component.minutes()}`);
  });
});
