// angular
import { Injectable} from '@angular/core';

// firebase
// local libs
import {AuthService} from './auth.service';

// typedef dict
type Dict = {[key: string]: any};

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  // Audio elements
  private AudioContext: AudioContext = new AudioContext(); // The audio context
  private audioElement: HTMLAudioElement; // The html audio element
  private track: MediaElementAudioSourceNode; // Set audio source

  // Audio nodes
  private gainNode: GainNode; // volume control
  private panNode: StereoPannerNode; // pan control
  public analyzer: AnalyserNode; // The analyser

  // Analyser settings
  public dataArray: Uint8Array; // array of frequencies
  private bufferLength: number; // buffer length
  private smoothConstant = 0.74; // smoothing constant for analyser
  private fftSize = 512; // fourier frequency transform

  constructor(private authService: AuthService) {
  }

  // toggle playing state of current audio
  async playOrPause(){
    if(this.audioElement.paused === true){
      this.play();
    } else {
      this.pause();
    }
  }

  // play the current audio
  async play(){
    // check if song was already started
    if (this.AudioContext.state === 'suspended'){
      // play from where it was left off
      await this.AudioContext.resume();
    }

    // play from the start
    await this.audioElement.play();
  }

  // pause the song
  async pause(){
    await this.audioElement.pause();
  }

  // return whether song is playing or not
  paused() {
    return (this.audioElement.paused);
  }

  // set the fft value of the analyser
  setFFT(level: number) {
    this.fftSize = level;
    this.analyzer.fftSize = level;

    console.log(level);
  }

  // set the smoothing constant of the analyser
  setSC(level: number) {
    this.smoothConstant = level;
    this.analyzer.smoothingTimeConstant = level;
  }

  // set the gain level
  setGain(level: number) {
    if (typeof this.gainNode !== 'undefined') {
      this.gainNode.gain.value = level;
    }
  }

  // set the pan level
  setPan(level: number) {
    if (typeof this.panNode !== 'undefined') {
      this.panNode.pan.value = level;
    }
  }

  // set the time in the song
  setTime(time: number) {
    if (typeof this.audioElement !== 'undefined'){
      this.audioElement.currentTime = time;
    }
  }

  // return the current time in the song
  getTime() {
    if (typeof this.audioElement !== 'undefined') {
      return this.audioElement.currentTime;
    }

    return 0;
  }

  // return how long the song is
  getDuration() {
    if (typeof this.audioElement !== 'undefined') {
      return this.audioElement.duration
    }

    return 0;
  }

  // return whether or not the song is over
  isOver() {
    if (typeof this.audioElement !== 'undefined') {
      return (this.audioElement.currentTime === 0) ? false : (this.audioElement.currentTime >= this.audioElement.duration)
    }

    return false;
  }

  // load a song into the audio context
  loadSong(song: HTMLMediaElement = this.audioElement) {
    this.audioElement = song; // set the audio as the song

    // initialize the track if it doesn't exist
    if (typeof this.track === 'undefined') {
      this.track = this.AudioContext.createMediaElementSource(song);
    } else {
      this.track.disconnect();
    }

    // set nodes here
    this.gainNode = this.AudioContext.createGain(); // reset volume
    this.panNode = this.AudioContext.createStereoPanner(); // reset pan
    this.analyzer = this.AudioContext.createAnalyser(); // reset analyser
    
    // connect nodes to the track
    this.track
    .connect(this.gainNode)
    .connect(this.panNode)
    .connect(this.analyzer)
    .connect(this.AudioContext.destination);

    this.analyzer.smoothingTimeConstant = this.smoothConstant; // set smoothing time constant
    this.analyzer.fftSize = this.fftSize; // set fft
    this.bufferLength = this.analyzer.frequencyBinCount; // set buffer count
    this.dataArray = new Uint8Array(this.bufferLength); // set data array
  }
}
