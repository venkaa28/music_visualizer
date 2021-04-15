import {Injectable} from '@angular/core';
import {AudioService} from '../services/audio.service';
// threejs
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import Nebula, { Rate } from 'three-nebula';


@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  // frequency scalor range
  public lowFreqAvgScalor;
  public midFreqAvgScalor;
  public highFreqAvgScalor;
  public lowerMaxFr;
  public upperAvgFr;
  public lowFreqDownScaled;
  public midFreqDownScaled;
  public highFreqDownScaled;
  private noise: SimplexNoise = new SimplexNoise();

  public freqSetup() {
    this.audioService.analyzer.getByteFrequencyData(this.audioService.dataArray);
    const numBins = this.audioService.analyzer.frequencyBinCount;

    // Get Frequencies
    const lowerHalfFrequncyData = this.audioService.dataArray.slice(0, (this.audioService.dataArray.length / 2) - 1);
    const upperHalfFrequncyData = this.audioService.dataArray.slice((this.audioService.dataArray.length / 2), this.audioService.dataArray.length - 1);
    const lowfrequncyData = this.audioService.dataArray.slice(0, (lowerHalfFrequncyData.length / 3) - 1);
    const midfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3),
      (lowerHalfFrequncyData.length / 3) * 2 - 1);
    const highfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3) * 2, lowerHalfFrequncyData.length);

    // Average
    const lowFreqAvg = this.avg(lowfrequncyData);
    const midFreqAvg = this.avg(midfrequncyData);
    const highFreqAvg = this.avg(highfrequncyData);

    // Scale
    this.lowFreqDownScaled = lowFreqAvg / lowfrequncyData.length;
    this.midFreqDownScaled = midFreqAvg / midfrequncyData.length;
    this.highFreqDownScaled = highFreqAvg / highfrequncyData.length;

    // Scalor
    this.lowFreqAvgScalor = this.modulate(this.lowFreqDownScaled, 0, 1, 0, 15);
    this.midFreqAvgScalor = this.modulate(this.midFreqDownScaled, 0, 1, 0, 25);
    this.highFreqAvgScalor = this.modulate(this.highFreqDownScaled, 0, 1, 0, 20);

    const lowerMax = this.max(lowerHalfFrequncyData);
    const upperAvg = this.avg(upperHalfFrequncyData);

    this.lowerMaxFr = lowerMax / lowerHalfFrequncyData.length;
    this.upperAvgFr = upperAvg / upperHalfFrequncyData.length;
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



  makeRoughBall(ball, low, mid, high, radius){
    const position = ball.geometry.attributes.position;
    const vector = new THREE.Vector3();
    const time = window.performance.now() / 5;
    for (let i = 0, l = position.count; i < l; i++) {
      vector.fromBufferAttribute(position, i);
      const offset = radius;
      const amp = mid;
      vector.normalize();
      const rf = 0.1;
      const distance = (offset + low) + this.noise.noise3d((vector.x + rf * 50 * Math.sin((i + time) / l * Math.PI * 2)), (vector.y + rf * 5),
        (vector.z + rf * 5)) * amp * high;

      vector.multiplyScalar(distance);
      position.setX(i, vector.x);
      position.setY(i, vector.y);
      position.setZ(i, vector.z);
    }
    ball.geometry.attributes.position.needsUpdate = true;
    ball.geometry.computeVertexNormals();
    ball.geometry.computeFaceNormals();
    ball.updateMatrix();
  };

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

  // given original array and number of indices to find, get the indices
  // for 'length' number of indices
  // expects array to contain more than one element and length to be shorter than array
  public getIndicesOfMax(origArray: Array<number>, length) {
    let sortedPitches = [...origArray];
    sortedPitches.sort((a, b) => a - b);

    let keptPitches = [];
    for (let i = origArray.length - 1; i > origArray.length - length - 1; i--) {
      keptPitches.push(sortedPitches[i]);
    }

    let keptIndices = [];
    for (let i = 0; i < length; i++) {
      keptIndices.push(origArray.indexOf(keptPitches[i]));
    }
    return keptIndices;
  }

  // set particle rate of given emitter
  public setRateHelper(emitter, perSecond) {
    const json = {
      particlesMin: 1,
      particlesMax: 1,
      perSecondMin: perSecond,
      perSecondMax: perSecond,
    };
    emitter.setRate(Rate.fromJSON(json));
  }




}
