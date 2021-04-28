import { TestBed } from '@angular/core/testing';

import { AudioService } from './audio.service';
import {RouterTestingModule} from "@angular/router/testing";
import {ReactiveFormsModule} from "@angular/forms";
import {AngularFireModule} from "@angular/fire";
import { firebaseConfig } from '../../environments/environment';
import {NotifierModule} from "angular-notifier";
import {ElementRef} from "@angular/core";

describe('AudioService', () => {
  let service: AudioService;
  let mockAudio;

  let mockStream = navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        // BrowserModule,
        AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        NotifierModule
      ],
    });
    service = TestBed.inject(AudioService);
    jasmine.clock().uninstall();
    jasmine.clock().install();
    mockAudio = new Audio('../../../assets/music/juice.mp3');
    // audio = audioFile.nativeElement;
    // audio.src = URL.createObjectURL('../../../assets/music/juice.mp3');
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

  // it('test getDuration()', () => {
  //   expect(service.getDuration()).toBe(0);
  //
  //   service.loadSong(audio);
  //
  //   expect(service.getDuration()).toBe((service as any).element.duration);
  // });

  it('test isOver()', () => {
    expect(service.isOver()).toBe(false);

    service.loadSong(mockAudio);
    service.setTime(service.getDuration() + 1);
    expect(service.isOver()).toBe(true);

  });

  it('test stopMic()', async() => {
    service.loadMic(await mockStream);
    //expect((service as any).stream.active).toBe(true);
    service.stopMic();
    expect((service as any).micTrack).toBe(null);
  });

  it('test stopFile()', async() => {
    service.loadMic(await mockStream);
    service.stopFile();
    expect((service as any).fileTrack).toBe(null);
  });

  it('test hardStop()', async () => {
    service.loadMic(await mockStream);
    service.hardStop();
    expect((service as any).micTrack).toBe(null);
  });

  it('test loadMic()', async () => {
    service.loadMic(await mockStream);
    expect((service as any).micStream.active).toBe(true);
  });

  it('test loadSong()', async () => {
    service.loadSong(await mockAudio);
    expect(service.analyzer).toBeTruthy();
  });

});
