import { ElementRef, OnInit, ViewChild, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioServiceService {

  // @ViewChild('audioFile', {static: true})
  // public audioFile!: ElementRef<HTMLMediaElement>;

  public AudioContext = window.AudioContext; // || window.webkitAudioContext;
  public audioCtx;
  public audioElement;// = this.audioFile.nativeElement;
  public track;
  public analyzer;
  public bufferLength;
  public dataArray;
  public gainNode: GainNode;

  //const playButton = document.getElementById("play_button");

  public playing:boolean = false;

  async play(){
    console.log(this.playing);
    if (this.audioCtx.state === 'suspended'){
      await this.audioCtx.resume();
    }
    if(this.playing === false){
      await this.audioElement.play();
      this.playing = true;

    }else if (this.playing === true) {
      await this.audioElement.pause();
      this.playing = false;
    }
    //const state = this.getAttribute('aria-checked') === "true";
    //this.setAttribute('aria-checked', state ? "false" : "true");

  }

  loadSong = (song: HTMLMediaElement) => {
    this.audioElement = song;
    this.audioCtx = new AudioContext();
    this.track = this.audioCtx.createMediaElementSource(song);

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 1;
    //  volumeControl = document.getElementById("volume_button");
    // gainNode.gain.value =
    // volumeControl.addEventListener('input', () => {
    //   gainNode.gain.value = volumeControl.;
    // }, false);
    this.track.connect(this.gainNode);

    this.analyzer = this.audioCtx.createAnalyser();
    this.gainNode.connect(this.analyzer);

    this.analyzer.connect(this.audioCtx.destination);

    this.analyzer.fftSize = 512;
    this.bufferLength = this.analyzer.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    //console.log(this.dataArray);
  }

  constructor() {
  }
}
