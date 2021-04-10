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
    //service.freqSetup();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('wavesBuffer should set correct plane values', () => {
    var waveSize = null;
    var magnitude1 = null;
    var magnitude2 = null;
    var timeScalar = null;
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 100, 100), 
    new THREE.MeshLambertMaterial({
      color: 0x25E0EC,
      side: THREE.DoubleSide,
      wireframe: true
    }));
    service.wavesBuffer(waveSize, magnitude1, magnitude2, timeScalar, plane);
    //expect(plane).toBe(?);
  });
  
  // Test Helper Methods
  it('should be correct avg', () => {
    var arr = [1, 2, 3, 4, 5];
    expect(service.avg(arr)).toBe(3);
  });

  it('should be correct absAvg', () => {
    var arr = [-1, -2, -3, -4, -5];
    expect(service.absAvg(arr)).toBe(2.6);
  });

  it('should be correct fractionate', () => {
    var val = 9;
    var maxVal = 9999;
    var minVal = 1;
    expect(service.fractionate(val, minVal, maxVal)).toBeCloseTo(0.0008001600320064013);
  });
});
