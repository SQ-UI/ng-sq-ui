import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {SimpleChange} from '@angular/core';
import { TimeUnit } from '../enums/time-unit.enum';
import { TimePickerComponent } from './time-picker.component';
import { FormsModule } from '@angular/forms';
import * as momentNs from 'moment';
const moment = momentNs;

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimePickerComponent ],
      imports: [ FormsModule ]
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

  it('#should convert given hours and minutes when [isMeridiem]=true', () => {
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
    const expectedMoment = moment().hours(component.inputHours).minutes(component.inputMinutes);

    const isValueCorrect = component.value.isSame(expectedMoment, 'hour') &&
      component.value.isSame(expectedMoment, 'minutes');

    expect(noonRelativityToggle.textContent)
      .toContain('PM', 'correctly displays meridiem');
    expect(component.hours === '10' && component.minutes === component.inputMinutes.toString())
      .toBe(true, 'correctly outputs hours and minutes');
    expect(isValueCorrect).toBe(true, 'component value has correct hours and minutes');
  });

  it('#should retain given hours and minutes when [isMeridiem]=false', () => {
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
    const expectedMoment = moment().hours(component.inputHours).minutes(component.inputMinutes);

    const isValueCorrect = component.value.isSame(expectedMoment, 'hour') &&
      component.value.isSame(expectedMoment, 'minutes');

    expect(noonRelativityToggle).not.toBeTruthy();
    expect(component.hours === component.inputHours.toString() &&
          component.minutes === component.inputMinutes.toString())
      .toBe(true, 'correctly outputs hours and minutes');
    expect(isValueCorrect).toBe(true, 'component value has correct hours and minutes');
  });

  it('#should increment hours and minutes with a given [hourStep] and [minuteStep]', () => {
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

    component.increment(TimeUnit.Hours);
    component.increment(TimeUnit.Minutes);
    fixture.detectChanges();

    const isValueCorrect = component.value.format(timeFormat) === `${momentIncrementHours}:${momentIncrementMinutes}`;

    expect(component.hours === momentIncrementHours)
      .toBe(true, 'the hours are incremented correctly');
    expect(component.minutes === momentIncrementMinutes)
      .toBe(true, 'the minutes are incremented correctly');
    expect(isValueCorrect).toBe(true, 'component value has correct hours and minutes');
  });

  it('#should decrement hours and minutes with a given [hourStep] and [minuteStep]', () => {
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

    component.decrement(TimeUnit.Hours);
    component.decrement(TimeUnit.Minutes);
    fixture.detectChanges();

    const isValueCorrect = component.value.format(timeFormat) === `${momentDecrementHours}:${momentDecrementMinutes}`;

    expect(component.hours === momentDecrementHours)
      .toBe(true, 'the hours are decremented correctly');
    expect(component.minutes === momentDecrementMinutes)
      .toBe(true, 'the minutes are decremented correctly');
    expect(isValueCorrect).toBe(true, 'component value has correct hours and minutes');
  });

});
