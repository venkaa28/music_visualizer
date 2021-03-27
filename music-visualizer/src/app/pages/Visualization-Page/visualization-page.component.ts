// angular
import {AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';

// firebase
// general libs
// local lib
import { AuthService } from '../../services/auth.service';
import {AudioService} from '../../services/audio.service';
import {Music} from '../../classes/music'

// scenes
import {PlaneSceneServiceService} from "../../scenes/plane-scene-service.service";
import {TestParticlesService} from '../../scenes/test-particles.service';
import {DemoSceneServiceService} from '../../scenes/demo-scene-service.service';


type Dict = {[key: string]: any};

@Component({
  selector: 'app-visualization-page',
  templateUrl: './visualization-page.component.html',
  styleUrls: [
    './visualization-page.component.css', 
    '../../../assets/bootstrap/css/bootstrap.min.css',
    '../../../assets/fonts/font-awesome.min.css',
  ],
  host: {
    '(document:keypress)': 'keyListener($event)'
  }
})
export class VisualizationPageComponent implements AfterViewInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('audioFile', {read: ElementRef})
  public audioFile!: ElementRef<HTMLMediaElement>;

  public audio: HTMLAudioElement; // audio element of window
  private currentSong: string = ''; // path/uid to current song
  public current: Music = new Music(); // music object
  private songList: Dict; // list of songs on firebase
  private scene: string = 'plane'; // current scene being used

  // upload mp3 file to firebase
  async upload(event: any) {
    var file = event as HTMLInputElement;
    this.audioService.upload(file.files[0]);
  }

  // load list of songs from firebase
  async loadList() {
    this.songList = await this.audioService.getSongList();
    console.log(this.songList);
  }

  // load song from firebase
  async loadSong(): Promise<string> {
    this.current = await this.audioService.getRemoteSong(this.currentSong); // load song from firebase
    this.audio.src = this.current.filepath; // firebase url
    this.audio.crossOrigin = 'anonymous'; // set cors policy
    this.audioService.loadSong(this.audio); // load song into audio context to play
    return this.current.filepath;
  }

  // load song from local file
  loadFilePath(event: any) {
    var file = event as HTMLInputElement; // get filelist from html

    this.current = new Music(); // init new music
    this.current.filepath = URL.createObjectURL(file.files[0]); // get filepath from html input
    this.current.isPublic = true; // TODO: currently setting all files as public
    this.current.name = file.files[0].name; // user uploaded one mp3 files, so access first file in list
    this.current.source = 'local'; // set source
    this.current.uploadEmail = this.authService.getUser().email; // keep track of who uploaded the file

    this.audio.src = this.current.filepath; // set source to be the file in the html
    this.audioService.loadSong(this.audio); // load the audio into the audio context

    // choose what scene to animate
    switch (this.scene) {
      case 'plane':
        this.planeScene.animate();
        break;

      case 'demo':
        this.demoScene.animate();
        break;

      case 'particle':
        this.testParticles.animate();
        break;
    }

    return this.current.filepath;
  }

  // load song from youtube url
  loadYoutube() {
    this.current = new Music();
    this.current.filepath = 'https://www.youtube.com/get_video_info?video_id=Iu37OXZ6cHk';
    this.current.isPublic = true;
    this.current.name = 'test';
    this.current.source = 'youtube';
    this.audio.crossOrigin = 'anonymous';
    this.current.uploadEmail = this.authService.getUser().email;

    this.audio.src = this.current.filepath;
    this.audioService.loadSong(this.audio);

    return this.current.filepath;
  }

  // load next song from firebase
  async nextSong() {
    const keys = Object.keys(this.songList); // song names
    const values = Object.values(this.songList); // song uids

    // cycle forwards through songs
    let nextIndex = (values.indexOf(this.currentSong) + 1) % keys.length;

    // load next song as current song
    this.currentSong = this.songList[keys[nextIndex]];
    await this.loadSong().then(() => this.audioService.play());
  }

  // load previous song from firebase
  async rewindSong() {
    const keys = Object.keys(this.songList); // song names
    const values = Object.values(this.songList); // song uids

    // cycle backwards through songs
    let nextIndex = ((values.indexOf(this.currentSong) - 1) + keys.length) % keys.length;

    // load prev song as current song
    this.currentSong = this.songList[keys[nextIndex]];
    await this.loadSong().then(() => this.audioService.play());
  }

  // displays appropiate play or pause icon based on the state of the audio
  playPauseIcon() {
    // audio uninitialized
    if (typeof this.audio === 'undefined') {
      return '../../../assets/icons/play.svg';
    }

    // paused music, show play icon
    if (this.audio.paused) {
      return '../../../assets/icons/play.svg';
    }

    // playing music, show pause icon
    return '../../../assets/icons/pause.svg';
  }

  // change volume based on slider input
  changeVolume(input) {
    this.audioService.gainNode.gain.value = input.value;
  }

  // change pan based on slider input
  changePan(input) {
    this.audioService.panNode.pan.value = input.value;
  }

  // get the duration of the current song
  duration() {
    // check if audio element is undefined
    if (typeof this.audioService.audioElement === "undefined") {
      return 0;
    }

    return Math.floor(this.audioService.audioElement.duration);
  }

  // get the current time in the song, and update progress bar
  progress() {
    // check if audio element is undefined
    if (typeof this.audioService.audioElement === "undefined") {
      return 0;
    }

    // get the progress bar div on the html page
    var progress = document.getElementById("progress-bar");
    // set width as percent song complete
    progress.style.width = Math.floor(this.audioService.audioElement.currentTime / this.audioService.audioElement.duration * 100) + '%';

    // check if song is done
    if (this.audioService.audioElement.currentTime >= this.audioService.audioElement.duration) {
      // notify
      this.notifierService.notify('warning', 'The current song has ended. Please open a new upload mp3 file to continue the visualization.');
      // stop playback
      this.audioService.pause();
      // reset song
      this.audioService.audioElement.currentTime = 0;
    }

    return Math.floor(this.audioService.audioElement.currentTime);
  }

  // convert time in seconds to a formatted output string mm:ss
  timeString(time: number) {
    // check if audio element is undefined
    if (typeof this.audioService.audioElement === "undefined") {
      return 'NaN';
    }

    var secondsTotal = time; // raw seconds of current place in song
    var outputTime: string = ""; // string used for output

    // convert minutes to string
    if (secondsTotal > 60) {
      outputTime += Math.floor(secondsTotal/60);
      secondsTotal = secondsTotal % 60;
    } else {
      outputTime += '0';
    }

    // add seperator
    outputTime += ':';

    // add leading 0 if needed
    if (secondsTotal < 10) {
      outputTime += '0';
    }

    // add formatted seconds to output
    outputTime += secondsTotal;

    return outputTime;
  }

  // change the time in the song
  // depreciated: div's don't have input
  changeTime(input) {
    this.audioService.audioElement.currentTime = input.value;
  }

  // display or hide menu
  toggleMenu() {
    var overlay = document.getElementById('menu'); // menu element on html

    // change width to display or hide
    if (overlay.style.width === '0%') {
      overlay.style.width = '100%';
    } else if (overlay.style.width === '100%'){
      overlay.style.width = '0%';
    }
  }

  // display or hide control instruction menu
  toggleInfo() {
    var infoBox = document.getElementById('info-menu'); // info box element on html

    // hide or show by changing width and opacity
    if (infoBox.style.width === '0%') {
      infoBox.style.width = '20%';
      infoBox.style.opacity = '1';
    } else if (infoBox.style.width === '20%'){
      infoBox.style.width = '0%';
      infoBox.style.opacity = '0';
    }
  }

  // listen to keyboard events, perform actions if certain keys are pressed
  keyListener(event){
    event = event || window.event; //capture the event, and ensure we have an event
    
    switch (event.key) {
      case 'm': // menu
        this.toggleMenu();
        break;
      
      case ' ': // play/pause
        this.audioService.playOrPause();
        break;

      case 'd': // fast forward
        this.nextSong();
        break;

      case 'a': // rewind
        this.rewindSong();
        break;
    }

  }

  constructor(private authService: AuthService, private router: Router, public audioService: AudioService, public demoScene: DemoSceneServiceService,
      public testParticles: TestParticlesService, public planeScene: PlaneSceneServiceService, private readonly notifierService: NotifierService) {
    // this.loadList(); // get list of songs from firebase
  }

  ngAfterViewInit(): void {
    this.audio = this.audioFile.nativeElement; // grab audio element from html
    
    // generate scene
    switch (this.scene) {
      case 'plane':
        this.planeScene.createScene(this.rendererCanvas);
        break;

      case 'demo':
        this.demoScene.createScene(this.rendererCanvas);
        break;

      case 'particle':
        this.testParticles.createScene(this.rendererCanvas);
        break;
    }
  }
}
