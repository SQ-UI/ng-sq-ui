import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { TimeUnit } from '../enums/time-unit.enum';
import { TimePickerComponent } from './time-picker.component';
import { FormsModule } from '@angular/forms';
import moment from 'moment';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TimePickerComponent],
      imports: [FormsModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    component.timeObjectType = 'moment';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert given hours and minutes when [isMeridiem]=true', () => {
    component.inputHours = 22;
    component.inputMinutes = 30;
    component.isMeridiem = true;

    component.ngOnChanges({
      inputHours: new SimpleChange(null, component.inputHours, true),
      inputMinutes: new SimpleChange(null, component.inputMinutes, true),
      isMeridiem: new SimpleChange(null, component.isMeridiem, true)
    });
    fixture.detectChanges();

    const noonRelativityToggle: HTMLElement = fixture.nativeElement.querySelector('.time-unit .meridiem');
    const timeFormat = 'hh:mm A';
    const expectedMoment = moment().hours(component.inputHours).minutes(component.inputMinutes);

    const isValueCorrect = component.value.format(timeFormat) === expectedMoment.format(timeFormat);

    expect(noonRelativityToggle.textContent)
      .toContain('PM');
    expect(component.hours === '10' && component.minutes === component.inputMinutes.toString())
      .toBe(true);
    expect(isValueCorrect).toBe(true);
  });

  it('should retain given hours and minutes when [isMeridiem]=false', () => {
    component.inputHours = 22;
    component.inputMinutes = 30;
    component.isMeridiem = false;

    component.ngOnChanges({
      inputHours: new SimpleChange(null, component.inputHours, true),
      inputMinutes: new SimpleChange(null, component.inputMinutes, true),
      isMeridiem: new SimpleChange(null, component.isMeridiem, true)
    });
    fixture.detectChanges();

    const noonRelativityToggle: HTMLElement = fixture.nativeElement.querySelector('.time-unit .meridiem');
    const timeFormat = 'HH:mm';
    const expectedMoment = moment().hours(component.inputHours).minutes(component.inputMinutes);

    const isValueCorrect = component.value.format(timeFormat) === expectedMoment.format(timeFormat);

    expect(noonRelativityToggle).not.toBeTruthy();
    expect(component.hours === component.inputHours.toString() &&
      component.minutes === component.inputMinutes.toString())
      .toBe(true);
    expect(isValueCorrect).toBe(true);
  });

  it('should increment hours and minutes with a given [hourStep] and [minuteStep]', () => {
    component.inputHours = 10;
    component.inputMinutes = 50;
    component.hourStep = 2;
    component.minuteStep = 15;
    component.isMeridiem = false;
    const timeFormat = 'HH:mm';

    component.ngOnChanges({
      inputHours: new SimpleChange(null, component.inputHours, true),
      inputMinutes: new SimpleChange(null, component.inputMinutes, true),
      isMeridiem: new SimpleChange(null, component.isMeridiem, true),
      hourStep: new SimpleChange(null, component.hourStep, true),
      minuteStep: new SimpleChange(null, component.minuteStep, true)
    });
    fixture.detectChanges();

    const timeString = `${component.inputHours}:${component.inputMinutes}`;
    const start = moment(timeString, 'HH:mm');
    const momentIncrementHours = start.add(component.hourStep, 'hours').format('HH');
    const momentIncrementMinutes = start.add(component.minuteStep, 'minutes').format('mm');

    component.inputMinutesChange.subscribe((minutes) => {
      expect(minutes === parseInt(momentIncrementMinutes, 10))
        .toBe(true);
    });

    component.inputHoursChange.subscribe((hours) => {
      expect(hours === parseInt(momentIncrementHours, 10))
        .toBe(true);
    });

    component.increment(TimeUnit.Hours);
    component.increment(TimeUnit.Minutes);
    fixture.detectChanges();

    const isValueCorrect = component.value.format(timeFormat) === `${momentIncrementHours}:${momentIncrementMinutes}`;

    expect(component.hours === momentIncrementHours)
      .toBe(true);
    expect(component.minutes === momentIncrementMinutes)
      .toBe(true);
    expect(isValueCorrect).toBe(true);
  });

  it('should decrement hours and minutes with a given [hourStep] and [minuteStep]', () => {
    component.inputHours = 10;
    component.inputMinutes = 0;
    component.hourStep = 2;
    component.minuteStep = 15;
    component.isMeridiem = false;
    const timeFormat = 'HH:mm';

    component.ngOnChanges({
      inputHours: new SimpleChange(null, component.inputHours, true),
      inputMinutes: new SimpleChange(null, component.inputMinutes, true),
      isMeridiem: new SimpleChange(null, component.isMeridiem, true),
      hourStep: new SimpleChange(null, component.hourStep, true),
      minuteStep: new SimpleChange(null, component.minuteStep, true)
    });
    fixture.detectChanges();

    const timeString = `${component.inputHours}:${component.inputMinutes}`;
    const start = moment(timeString, 'HH:mm');
    const momentDecrementHours = start.subtract(component.hourStep, 'hours').format('HH');
    const momentDecrementMinutes = start.subtract(component.minuteStep, 'minutes').format('mm');

    component.inputMinutesChange.subscribe((minutes) => {
      expect(minutes === parseInt(momentDecrementMinutes, 10))
        .toBe(true);
    });

    component.inputHoursChange.subscribe((hours) => {
      expect(hours === parseInt(momentDecrementHours, 10))
        .toBe(true);
    });

    component.decrement(TimeUnit.Hours);
    component.decrement(TimeUnit.Minutes);
    fixture.detectChanges();

    const isValueCorrect = component.value.format(timeFormat) === `${momentDecrementHours}:${momentDecrementMinutes}`;

    expect(component.hours === momentDecrementHours)
      .toBe(true);
    expect(component.minutes === momentDecrementMinutes)
      .toBe(true);
    expect(isValueCorrect).toBe(true);
  });

  it('should change noon relativity when [isMeridiem]=true', () => {
    component.timeObjectType = 'string';
    component.isMeridiem = true;
    component.inputHours = 11;
    component.inputMinutes = 30;

    component.ngOnChanges({
      isMeridiem: new SimpleChange(null, component.isMeridiem, true),
      timeObjectType: new SimpleChange(null, component.timeObjectType, true),
      inputHours: new SimpleChange(null, component.inputHours, true),
      inputMinutes: new SimpleChange(null, component.inputMinutes, true)
    });
    fixture.detectChanges();

    component.changeNoonRelativity();
    fixture.detectChanges();

    expect(component.noonRelativity).toEqual('pm');

    const expectedTimeFormat = `${component.hours}:${component.minutes} ${component.noonRelativity.toUpperCase()}`;

    expect(component.value === expectedTimeFormat)
      .toBe(true);
  });

  it('should export the time in accordance with a TimeObjectType value', () => {
    component.timeObjectType = 'string';
    component.ngOnChanges({
      timeObjectType: new SimpleChange(null, component.timeObjectType, true)
    });
    fixture.detectChanges();
    const expectedTimeFormat = `${component.hours}:${component.minutes}`;
    expect(component.value === expectedTimeFormat)
      .toBe(true);

    component.timeObjectType = 'moment';
    component.ngOnChanges({
      timeObjectType: new SimpleChange(null, component.timeObjectType, true)
    });
    fixture.detectChanges();
    expect(moment.isMoment(component.value))
      .toBe(true);
  });

  it('should normalize user input according time limits', () => {
    component.isMeridiem = true;
    component.ngOnChanges({
      isMeridiem: new SimpleChange(null, component.isMeridiem, true)
    });

    component.hours = 22;
    component.validateInput(TimeUnit.Hours);
    fixture.detectChanges();

    component.minutes = 60;
    component.validateInput(TimeUnit.Minutes);
    fixture.detectChanges();

    expect(component.hours === component.limits.hours.max.toString() &&
      component.minutes === component.limits.minutes.max.toString())
      .toBe(true);

    component.hours = -10;
    component.validateInput(TimeUnit.Hours);
    fixture.detectChanges();

    component.minutes = -5;
    component.validateInput(TimeUnit.Minutes);
    fixture.detectChanges();

    expect(component.hours === component.limits.hours.min.toString() &&
      component.minutes === component.limits.minutes.min.toString())
      .toBe(true);
  });
});
