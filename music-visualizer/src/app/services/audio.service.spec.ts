import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
// import {firebaseConfig} from "../firebase";
import {NotifierModule} from "angular-notifier";

describe('AudioService', () => {
  let service: AudioService;
  let mockAudio;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        // BrowserModule,
        // AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        NotifierModule
      ],
    });
    service = TestBed.inject(AudioService);
    jasmine.clock().uninstall();
    jasmine.clock().install();
    mockAudio = new Audio('../../../assets/music/tripleT.mp3');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test playOrPause(), play(), pause(), paused()', () => {
    service.loadSong(mockAudio);

    service.playOrPause();
    jasmine.clock().tick(2000);
    expect(service.paused()).toBe(false);

    service.playOrPause();
    jasmine.clock().tick(2000);
    expect(service.paused()).toBe(true);
  });

  it('test setFFT()', () => {
    service.loadSong(mockAudio);
    service.setFFT(32);
    expect((service as any).fftSize).toBe(32);
    expect((service as any).analyzer.fftSize).toBe(32);
  });

  it('test setSC()', () => {
    service.loadSong(mockAudio);
    service.setSC(0);
    expect((service as any).smoothConstant).toBe(0);
    expect((service as any).analyzer.smoothingTimeConstant).toBe(0);
  });

  it('test setGain()', () => {
    service.loadSong(mockAudio);
    service.setGain(3);
    expect((service as any).gainNode.gain.value).toBe(3);
  });

  it('test setPan()', () => {
    service.loadSong(mockAudio);
    service.setPan(1);
    expect((service as any).panNode.pan.value).toBe(1);
  });

  it('test setTime()', () => {
    service.loadSong(mockAudio);
    service.setTime(5);
    expect((service as any).element.currentTime).toBe(5);
  });

  it('test getTime()', () => {
    expect(service.getTime()).toBe(0);
    service.loadSong(mockAudio);
    service.setTime(5);
    expect(service.getTime()).toBe(5);
  });

  it('test getDuration()', () => {
    expect(service.getDuration()).toBe(0);
    service.loadSong(mockAudio);
    expect(service.getDuration()).toBe((service as any).element.duration);
  });

  it('test isOver()', () => {
    expect(service.isOver()).toBe(false);

    service.loadSong(mockAudio);
    service.setTime(service.getDuration() + 1);
    expect(service.isOver()).toBe(true);

  });

  it('test stopMic()', () => {
    expect(true).toBe(false);
  });

  it('test stopFile()', () => {
    expect(true).toBe(false);
  });

  it('test hardStop()', () => {
    expect(true).toBe(false);
  });

  it('test loadMic()', () => {
    expect(false).toBe(true);
  });

  it('test loadSong()', () => {
    service.loadSong(mockAudio);
    expect(service.analyzer).toBeTruthy();
  });

});
