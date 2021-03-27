import { ElementRef, OnInit, ViewChild, Injectable} from '@angular/core';

import firebase from 'firebase';
import { firebaseConfig } from '../firebase';

import {AuthService} from './auth.service';
import {Music} from '../classes/music';

type Dict = {[key: string]: any};

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  public AudioContext: AudioContext = new AudioContext();
  public audioElement: HTMLAudioElement;
  public analyzer: AnalyserNode;
  public track: MediaElementAudioSourceNode;
  public bufferLength: number;
  public dataArray: Uint8Array;
  public gainNode: GainNode;
  public panNode: StereoPannerNode;
  public smoothConstant = 0.74;
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
    if (this.AudioContext.state === 'suspended'){
      await this.AudioContext.resume();
    }

    await this.audioElement.play();
  }

  async pause(){
    await this.audioElement.pause();
  }

  reloadSong() {
    this.analyzer.smoothingTimeConstant = this.smoothConstant;
    this.analyzer.fftSize = this.fftSize;
  }

  loadSong(song: HTMLMediaElement) {
    this.audioElement = song;

    if (typeof this.track === 'undefined') {
      this.track = this.AudioContext.createMediaElementSource(song);
    } else {
      this.track.disconnect();
    }

    this.gainNode = this.AudioContext.createGain();
    this.panNode = this.AudioContext.createStereoPanner();
    this.analyzer = this.AudioContext.createAnalyser();
    
    this.track
    .connect(this.gainNode)
    .connect(this.panNode)
    .connect(this.analyzer)
    .connect(this.AudioContext.destination);

    this.analyzer.smoothingTimeConstant = this.smoothConstant;
    this.analyzer.fftSize = this.fftSize;
    this.bufferLength = this.analyzer.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }
}
