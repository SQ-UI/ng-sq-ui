import { TestBed } from '@angular/core/testing';

import { OSDetectorService } from './os-detector.service';

describe('OSDetectorService', () => {
  let service: OSDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OSDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
