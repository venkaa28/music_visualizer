import { TestBed } from '@angular/core/testing';

import { TestParticlesService } from './test-particles.service';

describe('TestParticlesService', () => {
  let service: TestParticlesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestParticlesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
