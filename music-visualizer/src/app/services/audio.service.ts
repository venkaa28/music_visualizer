// angular
import { Injectable} from '@angular/core';

// typedef dict
type Dict = {[key: string]: any};

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  // Audio elements
  private context: AudioContext; // The audio context
  private element: HTMLAudioElement; // The html audio element
  private micStream: MediaStream; // the media stream of the mic
  private fileTrack: MediaStreamTrackAudioSourceNode; // Set audio source
  private micTrack: MediaStreamAudioSourceNode; // Set mic source

  // Audio nodes
  private gainNode: GainNode; // volume control
  private panNode: StereoPannerNode; // pan control
  public analyzer: AnalyserNode; // The analyser

  // Analyser settings
  public dataArray: Uint8Array; // array of frequencies
  private bufferLength: number; // buffer length
  private smoothConstant: number; // smoothing constant for analyser
  private fftSize: number; // fourier frequency transform

  constructor() {
    this.context = new AudioContext();
    this.fileTrack = null;
    this.micTrack = null;
    this.smoothConstant = 0.74;
    this.fftSize = 512;

  }

  // toggle playing state of current audio
  async playOrPause(){
    if(this.element.paused === true){
      this.play();
    } else {
      this.pause();
    }
  }

  // play the current audio
  async play(){
    // check if song was already started
    if (this.context.state === 'suspended'){
      // play from where it was left off
      await this.context.resume();
    }

    // play from the start
    await this.element.play();
  }

  // pause the song
  async pause(){
    if (typeof this.element !== "undefined") {
      await this.element.pause();
    }
  }

  // return whether song is playing or not
  paused() {
    return (this.element.paused);
  }

  // set the fft value of the analyser
  setFFT(level: number): void {
    this.fftSize = level;
    this.analyzer.fftSize = level;

    console.log(level);
  }

  // set the smoothing constant of the analyser
  setSC(level: number): void {
    this.smoothConstant = level;
    this.analyzer.smoothingTimeConstant = level;
  }

  // set the gain level
  setGain(level: number): void {
    if (typeof this.gainNode !== 'undefined') {
      this.gainNode.gain.value = level;
    }
  }

  // set the pan level
  setPan(level: number): void {
    if (typeof this.panNode !== 'undefined') {
      this.panNode.pan.value = level;
    }
  }

  // set the time in the song
  setTime(time: number): void {
    if (typeof this.element !== 'undefined'){
      this.element.currentTime = time;
    }
  }

  // return the current time in the song
  getTime(): number {
    if (typeof this.element !== 'undefined') {
      return this.element.currentTime;
    }

    return 0;
  }

  // return how long the song is
  getDuration(): number {
    if (typeof this.element !== 'undefined') {
      return this.element.duration
    }

    return 0;
  }

  // return whether or not the song is over
  isOver(): boolean {
    if (typeof this.element !== 'undefined') {
      return (this.element.currentTime === 0) ? false : (this.element.currentTime >= this.element.duration)
    }

    return false;
  }

  // stop the mic stream
  stopMic() {
    if (this.micTrack !== null) {
      this.micTrack.disconnect();
    }
  }
  
  // stop the file stream
  stopFile() {
    if (this.fileTrack !== null) {
      this.fileTrack.disconnect();
    }
  }

  // reset the audio context
  hardStop() {
    this.stopMic();
    this.stopFile();
    this.context.close();
    this.context = new AudioContext();
    this.fileTrack = null;
    this.micTrack = null;
  }

  // load the mic as the audio context
  loadMic(stream: MediaStream) {

    // initialize the track if it doesn't exist
    if (this.micTrack === null) {
      this.micTrack = this.context.createMediaStreamSource(stream);
    } else {
      this.stopMic();
    }

    this.stopFile();
    this.micStream = stream;

    // set nodes here
    this.gainNode = this.context.createGain(); // reset volume
    this.panNode = this.context.createStereoPanner(); // reset pan
    this.analyzer = this.context.createAnalyser(); // reset analyser
    
    // connect nodes to the track
    this.micTrack
    .connect(this.gainNode)
    .connect(this.panNode)
    .connect(this.analyzer)

    this.analyzer.smoothingTimeConstant = this.smoothConstant; // set smoothing time constant
    this.analyzer.fftSize = this.fftSize; // set fft
    this.bufferLength = this.analyzer.frequencyBinCount; // set buffer count
    this.dataArray = new Uint8Array(this.bufferLength); // set data array
  }

  

  // load a song into the audio context
  loadSong(song: HTMLMediaElement = this.element) {
    this.element = song; // set the audio as the song

    // initialize the track if it doesn't exist
    if (this.fileTrack === null) {
      this.fileTrack = this.context.createMediaElementSource(song);
    } else {
      this.stopFile();
    }

    this.stopMic();
    
    // set nodes here
    this.gainNode = this.context.createGain(); // reset volume
    this.panNode = this.context.createStereoPanner(); // reset pan
    this.analyzer = this.context.createAnalyser(); // reset analyser
    
    // connect nodes to the track
    this.fileTrack
    .connect(this.gainNode)
    .connect(this.panNode)
    .connect(this.analyzer)
    .connect(this.context.destination);

    this.analyzer.smoothingTimeConstant = this.smoothConstant; // set smoothing time constant
    this.analyzer.fftSize = this.fftSize; // set fft
    this.bufferLength = this.analyzer.frequencyBinCount; // set buffer count
    this.dataArray = new Uint8Array(this.bufferLength); // set data array
  }
}
