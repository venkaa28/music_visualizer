import { ElementRef, OnInit, ViewChild, Injectable} from '@angular/core';

import firebase from 'firebase';
import { firebaseConfig } from '../firebase';

import {AuthService} from './auth.service';
import {Music} from '../classes/music';

type Dict = {[key: string]: any};

@Injectable({
  providedIn: 'root'
})
export class AudioServiceService {

  // @ViewChild('audioFile', {static: true})
  // public audioFile!: ElementRef<HTMLMediaElement>;

  public AudioContext = window.AudioContext; // || window.webkitAudioContext;
  public audioCtx: AudioContext;
  public audioElement: HTMLAudioElement;// = this.audioFile.nativeElement;
  public track: MediaElementAudioSourceNode;
  public analyzer: AnalyserNode;
  public bufferLength: number;
  public dataArray: Uint8Array;
  public gainNode: GainNode;
  public smoothConstant = 0.55;
  public fftSize = 512;

  constructor(private authService: AuthService) {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  async upload(file: File): Promise<void> {
    var date: string = new Date().getTime().toString();
    var rand: string = Math.floor(Math.random() * 9999).toString();

    while (rand.length < 4) {
      rand = '0' + rand;
    }

    var uid: string = date + rand;

    console.log(file.name);

    //upload file to storage
    firebase.storage().ref().child(uid + '.mp3').put(file).then((snapshot) =>{
      console.log('Upload successful!');
    }).catch((error) => {
      console.log(error);
      throw error;
    });

    var dict: Dict = {
      'name': file.name,
      'uploadEmail': this.authService.getUser().email,
      'public': true
    };

    return new Promise(async (resolve, reject) => {
      await firebase.database().ref('music').child(uid).set(dict);
      resolve();
    });
  }

  async getRemoteSong(uid: string): Promise<Music> {
    var music: Music = new Music();

    await firebase.database().ref('music').child(uid).on('value', async (snapshot) => {
      if (snapshot.exists()) {
        music.name = snapshot.val().name;
        music.source = 'firebase';
        music.uploadEmail = snapshot.val().uploadEmail;
      } else {
        throw new Error('A song with that id does not exist on the database');
      }
    });

    await firebase.storage().ref(uid + '.mp3').getDownloadURL().then((url) => {
      music.filepath = url;
      console.log(url);
    });

    this.gainNode.gain.value = 0;

    return music;
  }

  async getSongList(): Promise<Dict> {
    var dict: Dict = {};

    await firebase.database().ref('music').on('value', (snapshot) => {
      if (snapshot.exists()) {
        for (var obj in snapshot.val()) {
          dict[snapshot.val()[obj].name] = obj;
        }
      }
    });

    console.log(dict);
    return dict;
  }

  async playOrPause(){
    if(this.audioElement.paused === true){
      this.play();
    } else {
      this.pause();
    }
  }

  async play(){
    if (this.audioCtx.state === 'suspended'){
      await this.audioCtx.resume();
    }

    await this.audioElement.play();
  }

  async pause(){
    await this.audioElement.pause();
  }

  async rewind(){
    this.audioElement.currentTime = 0;
  }

  reloadSong() {
    this.analyzer = this.audioCtx.createAnalyser();
    this.analyzer.smoothingTimeConstant = this.smoothConstant;
    this.analyzer.fftSize = this.fftSize;
    this.track.connect(this.analyzer);
  }

  loadSong = (song: HTMLMediaElement) => {
    this.audioElement = song;
    this.audioCtx = new AudioContext();


    this.track = this.audioCtx.createMediaElementSource(song);

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0; //this.gainValue;
    this.track.connect(this.gainNode);

    this.analyzer = this.audioCtx.createAnalyser();
    this.gainNode.connect(this.analyzer);

    this.analyzer.connect(this.audioCtx.destination);
    this.analyzer.smoothingTimeConstant = this.smoothConstant;

    this.analyzer.fftSize = this.fftSize;
    this.bufferLength = this.analyzer.frequencyBinCount;
    console.log(this.bufferLength);
    this.dataArray = new Uint8Array(this.bufferLength);

    // pan
    const pannerOptions = {pan: 0};
    const panner = new StereoPannerNode(this.audioCtx, pannerOptions);

    const pannerControl = document.querySelector('[data-action="panner"]');
    pannerControl.addEventListener('input', function() {
      panner.pan.value = this.value;
    }, false);

    // connect each component
    this.track.connect(this.gainNode).connect(panner).connect(this.audioCtx.destination);
  }
}
