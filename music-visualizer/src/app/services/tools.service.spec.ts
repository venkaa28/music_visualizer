import { TestBed } from '@angular/core/testing';

import { ToolsService } from './tools.service';
// threejs
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';

describe('ToolsService', () => {
  let service: ToolsService;
  //let 
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsService);
    // intialize frequencies (getting audio source?)
    service.freqSetup();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('wavesBuffer should set correct plane values', () => {
    var waveSize = null;
    var magnitude1 = null;
    var magnitude2 = null;
    var timeScalar = null;
    var plane = null;
    service.wavesBuffer(waveSize, magnitude1, magnitude2, timeScalar, plane);
    //expect(plane).toBe(?);
  });
  
  // Test Helper Methods
  it('should be correct avg', () => {
    // TODO: make and expect arr value
    var arr = [1, 2, 3, 4, 5];
    expect(service.avg(arr)).toBe(3);
  });

  it('should be correct absAvg', () => {
    // TODO: make and expect arr value
    var arr = [-1, -2, -3, -4, -5];
    expect(service.absAvg(arr)).toBe(2.6);
  });

  it('should be correct fractionate', () => {
    // TODO: make and expect arr value
    var val = null;
    var minVal = null;
    var maxVal = null;
    expect(service.fractionate(val, minVal, maxVal)).toBe(null);
  });
});
