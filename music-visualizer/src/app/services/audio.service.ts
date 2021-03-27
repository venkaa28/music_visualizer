// angular
import { ElementRef, OnInit, ViewChild, Injectable} from '@angular/core';

// firebase
import firebase from 'firebase';
import { firebaseConfig } from '../firebase';

// local libs
import {AuthService} from './auth.service';
import {Music} from '../classes/music';

// typedef dict
type Dict = {[key: string]: any};

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  public AudioContext: AudioContext = new AudioContext(); // The audio context
  public audioElement: HTMLAudioElement; // The html audio element
  public analyzer: AnalyserNode; // The analyser
  public track: MediaElementAudioSourceNode; // Set audio source
  public bufferLength: number; // buffer length
  public dataArray: Uint8Array; // array of frequencies
  public gainNode: GainNode; // volume control
  public panNode: StereoPannerNode; // pan control
  public smoothConstant = 0.74; // smoothing constant for analyser
  public fftSize = 512; // fourier frequency transform

  constructor(private authService: AuthService) {
    // make sure firebase is initialized
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  // upload mp3 to firebase
  async upload(file: File): Promise<void> {
    var date: string = new Date().getTime().toString(); // get current date
    var rand: string = Math.floor(Math.random() * 9999).toString(); // add random int to avoid collisions

    // add zeros to the random int
    while (rand.length < 4) {
      rand = '0' + rand;
    }

    var uid: string = date + rand; // set string uid for storaged in firebase

    //upload file to storage
    firebase.storage().ref().child(uid + '.mp3').put(file).then((snapshot) =>{
      console.log('Upload successful!');
    }).catch((error) => {
      console.log(error);
      throw error;
    });

    // set data for music in rtdb
    var dict: Dict = {
      'name': file.name, 
      'uploadEmail': this.authService.getUser().email,
      'public': true
    };

    return new Promise(async (resolve, reject) => {
      // store music data in rtdb
      await firebase.database().ref('music').child(uid).set(dict);
      resolve();
    });
  }

  // get song from firebase storage
  async getRemoteSong(uid: string): Promise<Music> {
    var music: Music = new Music(); // store the music in a music object

    // get music data from rtdb
    await firebase.database().ref('music').child(uid).on('value', async (snapshot) => {
      if (snapshot.exists()) {
        music.name = snapshot.val().name; // get music name
        music.source = 'firebase'; // set source
        music.uploadEmail = snapshot.val().uploadEmail; // get upload email
      } else {
        // music not on rtdb
        throw new Error('A song with that id does not exist on the database');
      }
    });

    // get music file from firebase storage
    await firebase.storage().ref(uid + '.mp3').getDownloadURL().then((url) => {
      music.filepath = url; // get the firebase url for the song
      console.log(url);
    });

    return music;
  }

  // get a list of all songs from rtdb to reduce firebase calls
  async getSongList(): Promise<Dict> {
    var dict: Dict = {}; // key value of songs and their uid's

    await firebase.database().ref('music').on('value', (snapshot) => {
      if (snapshot.exists()) {
        for (var obj in snapshot.val()) {
          dict[snapshot.val()[obj].name] = obj; // set key as name, value as uid
        }
      }
    });

    console.log(dict);
    return dict;
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

  // not currently used, but for updating visualizer settings without reloading the whole app
  reloadSong() {
    this.analyzer.smoothingTimeConstant = this.smoothConstant;
    this.analyzer.fftSize = this.fftSize;
  }

  // load a song into the audio context
  loadSong(song: HTMLMediaElement) {
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
