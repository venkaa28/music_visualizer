// angular
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
  public current: Music; // music object
  public readonly scenesAvailable = [this.planeScene, this.testParticles, this.demoScene]; // current scene being used
  public micUsed: boolean;
  
  private scene: any; // current scene to use
  private menuTimeout: number; // timeout in ms of menu
  private timeout: number; // id of current timeout

  constructor(private authService: AuthService, private router: Router, public audioService: AudioService, public demoScene: DemoSceneServiceService,
    public testParticles: TestParticlesService, public planeScene: PlaneSceneServiceService, private readonly notifierService: NotifierService) {
    // initialize variables
    this.current = new Music();
    this.micUsed = false;
    this.scene = this.scenesAvailable[0];
    this.menuTimeout = 3000;

    // TODO: upload menu appear animation
    // TODO: scroll text on hover
    // TODO: get svg icons
    // TODO: upload menu icon fix up
    // TODO: Show menu when paused
  }

  ngAfterViewInit(): void {
    this.audio = this.audioFile.nativeElement; // grab audio element from html
    
    this.scene.createScene(this.rendererCanvas);

    setInterval(() => {
      if (!this.micUsed) {
        this.progress();
      }
    }, 10);
  }

  // listen to keyboard events, perform actions if certain keys are pressed
  keyListener(event){
    event = event || window.event; //capture the event, and ensure we have an event
    
    switch (event.key) {
      case ' ': // play/pause
        this.togglePlay();
        break;

      case 'd': // fast forward
        this.nextSong();
        break;

      case 'a': // rewind
        this.rewindSong();
        break;
    }

  }


  /**************************************Loading functions**************************************/

  // load song from local file
  loadFilePath(event: any) {
    var element = event as HTMLInputElement; // get filelist from html
    var file = element.files[0];

    if (typeof file === 'undefined') {
      return;
    }

    this.current = new Music(); // init new music
    this.current.filepath = URL.createObjectURL(file); // get filepath from html input
    this.current.name = file.name; // user uploaded one mp3 files, so access first file in list
    this.current.source = 'local'; // set source
    this.current.artist = 'Local File';

    this.audio.src = this.current.filepath; // set source to be the file in the html
    this.audioService.loadSong(this.audio);
    this.micUsed = false;

    this.scene.animate();
    this.toggleSongMenu();
    this.audioService.play();
  }

  async loadMic() {
    this.current = new Music(); // init new music
    this.current.source = 'local'; // set source
    this.audioService.pause();

    await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
      this.audioService.loadMic(stream); // load the audio into the audio context
    });

    this.micUsed = true;

    this.scene.animate();
  }

  /**************************************Audio controls**************************************/

  // handle play or pause
  async togglePlay() {
    await this.audioService.playOrPause();
  }

  // load next song from firebase
  async nextSong() {
    if (this.audioService.getTime() + 10 > this.audioService.getDuration()) {
      this.audioService.setTime(this.audioService.getDuration());
    } else {
      this.audioService.setTime(this.audioService.getTime() + 10);
    }
  }

  // load previous song from firebase
  async rewindSong() {
    if (this.audioService.getTime() - 10 < 0) {
      this.audioService.setTime(0);
    } else {
      this.audioService.setTime(this.audioService.getTime() - 10);
    }
  }

  // change the current visualization scene
  changeScene(event: any) {
    this.scene = this.scenesAvailable[event.value];
    this.scene.createScene(this.rendererCanvas);
    this.scene.animate();
  }

  // change fft value based on slider input
  changeFFT(event: any) {
    this.audioService.setFFT(Math.pow(2, event.value));
  }

  // change the smoothing constant
  changeSC(event: any) {
    this.audioService.setSC(event.value);
  }

  // change volume based on slider input
  changeVolume(event: any) {
    this.audioService.setGain(event.value);
  }

  // change pan based on slider input
  changePan(event: any) {
    this.audioService.setPan(event.value);
  }

  // get the duration of the current song
  duration() {
    return Math.floor(this.audioService.getDuration());
  }

  // get the current time in the song, and update progress bar
  progress() {
    // get the progress bar div on the html page
    var progress = document.getElementById("progress-bar");
    // set width as percent song complete
    progress.style.width = Math.floor(this.audioService.getTime() / this.audioService.getDuration() * 100) + '%';

    // check if song is done
    if (this.audioService.isOver()) {
      // notify
      this.notifierService.notify('warning', 'The current song has ended. Please open a new upload mp3 file to continue the visualization.');
      // stop playback
      this.audioService.pause();
      // reset song
      this.audioService.setTime(0);
    }

    return Math.floor(this.audioService.getTime());
  }

  setTime(event: any) {
    this.audioService.setTime(event.value);
  }


  /**************************************Visuals**************************************/

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

  // convert time in seconds to a formatted output string mm:ss
  timeString(time: number) {
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

  toggleSongMenu() {
    var songBox = document.getElementById('upload-menu');
    var canvas = document.getElementById('renderCanvas');

    if (songBox.style.width === '0%') {
      songBox.style.width = '80%';
      canvas.style.filter = "blur(4px)";
      songBox.style.opacity = '1';
    } else if (songBox.style.width === '80%'){
      canvas.style.filter = "blur(0)";
      songBox.style.width = '0%';
      songBox.style.opacity = '0';
    }
  }

  toggleEditMenu() {
    var editBox = document.getElementById('edit-menu');
    
    if (editBox.style.opacity === '0') {
      editBox.style.opacity = '1';
    } else if (editBox.style.opacity === '1'){
      editBox.style.opacity = '0';
    }
  }
}
