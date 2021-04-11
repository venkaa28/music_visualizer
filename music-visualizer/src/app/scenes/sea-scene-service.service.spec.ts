import { TestBed } from '@angular/core/testing';

import { SeaSceneService } from './sea-scene-service.service';
import {ElementRef, ViewChild} from "@angular/core";


describe('SeaSceneService', () => {
  let service: SeaSceneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeaSceneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test createScene()', () => {
    expect(true).toBe(false);
  });
});
