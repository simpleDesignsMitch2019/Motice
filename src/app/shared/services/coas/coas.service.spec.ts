import { TestBed } from '@angular/core/testing';

import { CoasService } from './coas.service';

describe('CoasService', () => {
  let service: CoasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
