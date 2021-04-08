import { Injectable } from '@angular/core';
import {AudioService} from '../services/audio.service';
// threejs
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  // frequency scalor range
  public lowFreqAvgScalor;
  public midFreqAvgScalor;
  public highFreqAvgScalor;
  private noise: SimplexNoise = new SimplexNoise();

  public freqSetup() {
    this.audioService.analyzer.getByteFrequencyData(this.audioService.dataArray);
    const numBins = this.audioService.analyzer.frequencyBinCount;

    // Get Frequencies
    const lowerHalfFrequncyData = this.audioService.dataArray.slice(0, (this.audioService.dataArray.length / 2) - 1);
    const lowfrequncyData = this.audioService.dataArray.slice(0, (lowerHalfFrequncyData.length / 3) - 1);
    const midfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3),
      (lowerHalfFrequncyData.length / 3) * 2 - 1);
    const highfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3) * 2, lowerHalfFrequncyData.length);

    // Average
    const lowFreqAvg = this.avg(lowfrequncyData);
    const midFreqAvg = this.avg(midfrequncyData);
    const highFreqAvg = this.avg(highfrequncyData);

    // Scale
    const lowFreqDownScaled = lowFreqAvg / lowfrequncyData.length;
    const midFreqDownScaled = midFreqAvg / midfrequncyData.length;
    const highFreqDownScaled = highFreqAvg / highfrequncyData.length;

    // Scalor
    this.lowFreqAvgScalor = this.modulate(lowFreqDownScaled, 0, 1, 0, 15);
    this.midFreqAvgScalor = this.modulate(midFreqDownScaled, 0, 1, 0, 25);
    this.highFreqAvgScalor = this.modulate(highFreqDownScaled, 0, 1, 0, 20);
  }

  wavesBuffer( waveSize, magnitude1,  magnitude2, timeScalar, plane) {

    const pos = plane.geometry.attributes.position;
    const center = new THREE.Vector3(0, 0, 0);
    const vec3 = new THREE.Vector3();

    const time = window.performance.now() * timeScalar;
    for (let i = 0, l = pos.count; i < l; i++) {

      vec3.fromBufferAttribute(pos, i);
      vec3.sub(center);

      const sampleNoise = this.noise.noise3d((vec3.x + time * 0.00001), (vec3.y + time * 0.00001), (vec3.z + time * 0.00001));
      const z = Math.sin(vec3.length() / -(waveSize) + (time)) * (magnitude1 + (sampleNoise * magnitude1 / 2.5)) - (magnitude2);
      pos.setZ(i, z);

    }
  }

  // Helper methods
  avg = (arr) => {
    const total = arr.reduce((sum, b) => sum + b);
    return (total / arr.length);
  }

  absAvg = (arr) => {
    const total = arr.reduce((sum, b) => sum + Math.abs(b));
    return (total / arr.length);
  }

  modulate(val: any, minVal: any, maxVal: any, outMin: number, outMax: number) {
    const fr = this.fractionate(val, minVal, maxVal);
    const delta = outMax - outMin;
    return outMin + (fr * delta);
  }

  fractionate(val: number, minVal: number, maxVal: number) {
    return (val - minVal) / (maxVal - minVal);
  }

  min = (arr) => arr.reduce((a, b) => Math.min(a, b));
  max = (arr) => arr.reduce((a, b) => Math.max(a, b));

  constructor(public audioService: AudioService) {}
}
