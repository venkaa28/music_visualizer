import { TestBed } from '@angular/core/testing';

import { TemplateSceneServiceService } from './template-scene-service.service';

describe('TemplateSceneServiceService', () => {
  let service: TemplateSceneServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateSceneServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
