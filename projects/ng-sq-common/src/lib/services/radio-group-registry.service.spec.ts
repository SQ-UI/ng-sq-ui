import { TestBed } from '@angular/core/testing';

import { RadioGroupRegistry } from './radio-group-registry.service';

describe('RadioGroupRegistry', () => {
  let service: RadioGroupRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RadioGroupRegistry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the same signal for repeated lookups of the same group', () => {
    const first = service.group('gender');
    const second = service.group('gender');

    expect(first).toBe(second);
  });

  it('should return independent signals for different groups', () => {
    const gender = service.group('gender');
    const size = service.group('size');

    expect(gender).not.toBe(size);
  });

  it('should default a group value to null', () => {
    expect(service.group('gender')()).toBeNull();
  });

  it('should update the group value when selecting', () => {
    service.select('gender', 'male');

    expect(service.group('gender')()).toBe('male');
  });

  it('should reflect the selected value to every consumer of the same group', () => {
    const groupSignal = service.group('gender');

    service.select('gender', 'female');

    expect(groupSignal()).toBe('female');
  });
});
