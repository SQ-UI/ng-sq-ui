import { TestBed } from '@angular/core/testing';

import { OSDetectorService } from './os-detector.service';

describe('OsDetectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OSDetectorService]
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(OSDetectorService);
    expect(service).toBeTruthy();
  });
});
