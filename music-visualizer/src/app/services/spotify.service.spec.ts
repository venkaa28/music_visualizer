import { TestBed } from '@angular/core/testing';

import { SpotifyService } from './spotify.service';
import {RouterTestingModule} from "@angular/router/testing";
import {AngularFireModule} from "@angular/fire";
import {firebaseConfig} from "../../environments/environment";
import {HttpClientModule} from "@angular/common/http";
import {NotifierModule} from "angular-notifier";
import mockAnalysisData from '../../assets/mock_test_data/mockSpotifyAnalysisData.json';

describe('SpotifyService', () => {
  let service: SpotifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AngularFireModule.initializeApp(firebaseConfig),
        HttpClientModule,
        NotifierModule
      ],
    });
    service = TestBed.inject(SpotifyService);
    service.analysis = mockAnalysisData;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test get Segment Data with valid track progress', () => {
      const segmentStub = { start: 0, duration: 0.1863, confidence: 1, loudness_start: -53.876, loudness_max_time: 0.07345, loudness_max: -29.992, loudness_end: 0, pitches: [ 0.011, 0.015, 0.012, 0.036, 0.073, 0.423, 1, 0.183, 0.08, 0.072, 0.027, 0.013 ], timbre: [ 21.614, -138.161, -72.768, -126.99, 27.821, 67.166, 19.836, -58.761, -34.976, 120.148, -27.823, 22.675 ] };
      expect(service.getSegment(0)).toEqual(segmentStub);
  });

  it('test get Section Data with valid track progress', () => {
    const sectionStub = { start: 6.64966, duration: 66.29283, confidence: 0.449, loudness: -11.973, tempo: 144.631, tempo_confidence: 0.422, key: 2, key_confidence: 0.564, mode: 1, mode_confidence: 0.662, time_signature: 3, time_signature_confidence: 0.699 };
    expect(service.getSection(0)).toEqual(sectionStub);
  });

  // it('test getAvgSegmentDuration', () => {
  //   const avgSegmentDurationStub = 0;
  //   expect(service.getAvgSegmentDuration()).toEqual(avgSegmentDurationStub);
  // });

  it('test getTimbreAvg', () => {
    const timbreAvgStub = 61.56158333333334;
    expect(service.getTimbreAvg(0)).toEqual(timbreAvgStub);
  });

  it('test getScaledAvgPitch', () => {
    const scaledAvgPitchStub = 27.49747219413549;
    expect(service.getScaledAvgPitch(0)).toEqual(scaledAvgPitchStub);
  });

  it('test getAvgPitch', () => {
    const avgPitchStub = 0.16208333333333333;
    expect(service.getAvgPitch(0)).toEqual(avgPitchStub);
  });

  it('test getSegmentLoudness', () => {
    const segmentLoudnessStub = 29.992;
    expect(service.getSegmentLoudness(0)).toEqual(segmentLoudnessStub);
  });

  it('test getTimeScalar', () => {
    const timeScalarStub = 0.008137;
    expect(service.getTimeScalar(0)).toEqual(timeScalarStub);
  });

});
