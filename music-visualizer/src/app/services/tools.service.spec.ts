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


  it('test fractionate()', () => {
    expect(service.fractionate(2, 1, 3)).toBe(0.5);
  });

  it('test modulate()', () => {
    expect(service.modulate(2, 1, 3, 4, 10)).toBe(7);
  });

  it('test avg()', () => {
    expect(service.avg([1, 2, 3, 4, 5])).toBe(3);
  });

  it('test max()', () => {
    expect(service.max([1, 2, 3, 4, 5])).toBe(5);
  });

  it('test getIndicesOfMax(): empty array', () => {
    let testArray = [];
    expect(service.getIndicesOfMax(testArray, 0)).toEqual([]);
  });

  it('test getIndicesOfMax(): two element array', () => {
    let testArray = [1, 5];
    expect(service.getIndicesOfMax(testArray, 1)).toEqual([1]);
  });

  it('test getIndicesOfMax(): three element array', () => {
    let testArray = [1, 5, 7];
    expect(service.getIndicesOfMax(testArray, 2)).toEqual([2, 1]);
  });

  it('test getIndicesOfMax(): many element array', () => {
    let testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(service.getIndicesOfMax(testArray, 4)).toEqual([9, 8, 7, 6]);
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
    expect(service.avg(arr)).toEqual(3);
  });

  it('should be correct absAvg', () => {
    var arr = [-1, -2, -3, -4, -5];
    expect(service.absAvg(arr)).toEqual(2.6);
  });

  it('should be correct fractionate', () => {
    var val = 9;
    var maxVal = 9999;
    var minVal = 1;
    expect(service.fractionate(val, minVal, maxVal)).toBeCloseTo(0.0008001600320064013);
  });

 });

