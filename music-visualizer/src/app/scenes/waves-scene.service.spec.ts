import { TestBed } from '@angular/core/testing';

import { WavesSceneService } from './waves-scene.service';

describe('WavesSceneService', () => {
  let service: WavesSceneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WavesSceneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
