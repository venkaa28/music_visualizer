import { TestBed } from '@angular/core/testing';

import { SeaSceneService } from './sea-scene-service.service';

describe('SeaSceneServiceService', () => {
  let service: SeaSceneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeaSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
