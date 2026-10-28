import { TestBed } from '@angular/core/testing';

import { CustomEventBroadcasterService } from './custom-event-broadcaster.service';

describe('CustomEventBroadcasterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomEventBroadcasterService]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(CustomEventBroadcasterService);
    expect(service).toBeTruthy();
  });
});
