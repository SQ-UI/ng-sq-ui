import { TestBed, inject } from '@angular/core/testing';

import { CustomEventBroadcasterService } from './custom-event-broadcaster.service';

describe('CustomEventBroadcasterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomEventBroadcasterService]
    });
  });

  it('should be created', inject([CustomEventBroadcasterService], (service: CustomEventBroadcasterService) => {
    expect(service).toBeTruthy();
  }));
});
