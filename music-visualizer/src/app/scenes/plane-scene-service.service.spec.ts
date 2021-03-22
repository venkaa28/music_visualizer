import { TestBed } from '@angular/core/testing';

import { PlaneSceneServiceService } from './plane-scene-service.service';

describe('PlaneSceneServiceService', () => {
  let service: PlaneSceneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaneSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
