import { TestBed } from '@angular/core/testing';

import { CalendarManagerService } from './calendar-manager.service';

describe('CalendarManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalendarManagerService = TestBed.get(CalendarManagerService);
    expect(service).toBeTruthy();
  });
});
