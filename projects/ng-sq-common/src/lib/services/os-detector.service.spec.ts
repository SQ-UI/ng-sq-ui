import { TestBed, inject } from '@angular/core/testing';

import { OSDetectorService } from './os-detector.service';

describe('OsDetectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OSDetectorService]
    });
  });

  it('should be created', inject([OSDetectorService], (service: OSDetectorService) => {
    expect(service).toBeTruthy();
  }));
});
