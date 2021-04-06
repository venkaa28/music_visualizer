import { Injectable } from '@angular/core';
import {AudioService} from '../services/audio.service';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  // frequency scalor range
  public lowFreqAvgScalor;
  public midFreqAvgScalor;
  public highFreqAvgScalor;

  public freqSetup() {
    this.audioService.analyzer.getByteFrequencyData(this.audioService.dataArray);
    const numBins = this.audioService.analyzer.frequencyBinCount;

    const lowerHalfFrequncyData = this.audioService.dataArray.slice(0, (this.audioService.dataArray.length / 2) - 1);
    const lowfrequncyData = this.audioService.dataArray.slice(0, (lowerHalfFrequncyData.length / 3) - 1);
    const midfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3),
      (lowerHalfFrequncyData.length / 3) * 2 - 1);
    const highfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3) * 2, lowerHalfFrequncyData.length);

    const lowFreqAvg = this.avg(lowfrequncyData);
    const midFreqAvg = this.avg(midfrequncyData);
    const highFreqAvg = this.avg(highfrequncyData);

    const lowFreqDownScaled = lowFreqAvg / lowfrequncyData.length;
    const midFreqDownScaled = midFreqAvg / midfrequncyData.length;
    const highFreqDownScaled = highFreqAvg / highfrequncyData.length;


    this.lowFreqAvgScalor = this.modulate(lowFreqDownScaled, 0, 1, 0, 15);
    this.midFreqAvgScalor = this.modulate(midFreqDownScaled, 0, 1, 0, 25);
    this.highFreqAvgScalor = this.modulate(highFreqDownScaled, 0, 1, 0, 20);
  }

  // Helper methods
  avg = (arr) => {
    const total = arr.reduce((sum, b) => sum + b);
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

  constructor(public audioService: AudioService) {}
}
