import { TestBed } from '@angular/core/testing';

import { DemoSceneServiceService } from './demo-scene-service.service';

describe('DemoSceneServiceService', () => {
  let service: DemoSceneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
