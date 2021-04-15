// angular
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';

// firebase
// general libs
// local lib
import { AuthService } from '../../services/auth.service';
import {AudioService} from '../../services/audio.service';

// THREE
import * as THREE from 'three';
// scenes
import {PlaneSceneServiceService} from '../../scenes/plane-scene-service.service';
import {SpotifyPlaybackSdkService} from '../../services/spotify-playback-sdk.service';
import {TestParticlesService} from '../../scenes/test-particles.service';
import {DemoSceneServiceService} from '../../scenes/demo-scene-service.service';
import {NebulaSceneServiceService} from '../../scenes/nebula-scene-service.service';
import { SeaSceneService } from 'src/app/scenes/sea-scene-service.service';
import { WavesSceneService } from 'src/app/scenes/waves-scene.service';
import { SpotifyService } from 'src/app/services/spotify.service';


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
  public readonly scenesAvailable = [this.planeScene, this.seaScene, this.waveScene, this.nebulaScene, this.testParticles, this.demoScene]; // current scene being used
  public scene: any; // current scene to use

  private menuTimeout: number; // timeout in ms of menu
  private timeout: number; // id of current timeout
  private micStream: MediaStream; // user's microphone data
  private renderer: THREE.WebGLRenderer;
  private canvas!: HTMLCanvasElement;

  constructor(private authService: AuthService, private router: Router, public audioService: AudioService, public demoScene: DemoSceneServiceService,

              public testParticles: TestParticlesService, public planeScene: PlaneSceneServiceService, private readonly notifierService: NotifierService,
              private spotifySDK: SpotifyPlaybackSdkService, public nebulaScene: NebulaSceneServiceService, public seaScene: SeaSceneService,
              public waveScene: WavesSceneService, private spotifyAPI: SpotifyService) {
    // initialize variables
    this.menuTimeout = 2000;

    // TODO: scroll text on hover
  }

  async ngAfterViewInit(): Promise<void> {
    this.scene = this.scenesAvailable[0];
    this.audio = this.audioFile.nativeElement;// grab audio element from html
    this.canvas = this.rendererCanvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, // grabs the canvas element
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });

    this.scenesAvailable.forEach((scene) => {
      scene.spotifyBool = false;
    });

    await this.scene.createScene(this.canvas, this.renderer);

    setInterval(() => {
      this.progress();
    }, 100);
  }

  // listen to keyboard events, perform actions if certain keys are pressed
  async keyListener(event) {
    event = event || window.event; // capture the event, and ensure we have an event

    switch (event.key) {
      case ' ': // play/pause
        await this.togglePlay();
        break;

      case 'd': // fast forward
        await this.nextSong();
        break;

      case 'a': // rewind
        await this.rewindSong();
        break;
    }

  }


  /**************************************Loading functions**************************************/

  // load song from local file
  async loadFilePath(event: any) {
    let element = event as HTMLInputElement; // get filelist from html
    let file = element.files[0];

    if (typeof file === 'undefined') {
      return;
    }

    if (this.scene.spotifyBool) {
      this.spotifySDK.player.pause().then(() => {
        this.scenesAvailable.forEach((scene) => {
          scene.spotifyBool = false;
        });
      });

      await this.spotifySDK.player.removeListener('player_state_changed');
      await this.spotifySDK.player.removeListener('ready');
      this.spotifySDK.player.disconnect();
    }

    this.audio.src = URL.createObjectURL(file); // set source to be the file in the html
    this.audioService.loadSong(this.audio);

    document.getElementById('song-title').textContent = file.name;
    document.getElementById('song-subtitle').textContent = 'Local File';
    let htmlAlbum = (document.getElementById('album') as HTMLMediaElement);
    htmlAlbum.src = '../../../assets/icons/disc.svg';

    this.scene.animate();
    this.toggleUploadMenu();
    await this.audioService.play();
  }

  async loadMic() {
    await this.audioService.pause();

    if (this.scene.spotifyBool) {
      this.spotifySDK.player.pause().then(() => {
        this.scenesAvailable.forEach((scene) => {
          scene.spotifyBool = false;
        });
      });

      await this.spotifySDK.player.removeListener('player_state_changed');
      await this.spotifySDK.player.removeListener('ready');
      this.spotifySDK.player.disconnect();
    }

    if (typeof this.micStream === 'undefined') {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        this.audioService.loadMic(stream); // load the audio into the audio context
      });
    }

    document.getElementById('song-title').textContent = 'Microphone';
    document.getElementById('song-subtitle').textContent = 'You';

    this.scene.animate();
    this.toggleUploadMenu();
  }

  async loadSpotify() {
    // TODO: error handle not token cookie
    await this.audioService.pause();
    if (this.authService.getUser().spotifyAPIKey == null) {
      await this.router.navigate(['../ProfilePage']);
    }

    this.audioService.stopMic();

    await this.spotifySDK.addSpotifyPlaybackSdk(this.scene).then(() => {
      this.scenesAvailable.forEach((scene) => {
        scene.spotifyBool = true;
      });
      }
    );

    this.scene.animate();
    this.toggleUploadMenu();
  }

  // change the current visualization scene
  async changeScene(event: any) {
    this.scene.ngOnDestroy();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, // grabs the canvas element
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });

    this.scene = this.scenesAvailable[event.value];
    await this.scene.createScene(this.canvas, this.renderer);
    this.scene.animate();
  }

  /**************************************Audio controls**************************************/

  // handle play or pause
  async togglePlay() {
    if (this.scene.spotifyBool) {
      await this.spotifySDK.player.togglePlay();
    } else {
      await this.audioService.playOrPause();
    }

    this.toggleMenu();
  }

  // load next song from firebase
  async nextSong() {
    if (this.scene.spotifyBool) {
      await this.spotifySDK.player.nextTrack();
    } else {
      if (this.audioService.getTime() + 10 > this.audioService.getDuration()) {
        this.audioService.setTime(this.audioService.getDuration());
      } else {
        this.audioService.setTime(this.audioService.getTime() + 10);
      }
    }
  }

  // load previous song from firebase
  async rewindSong() {
    if (this.scene.spotifyBool) {
      await this.spotifySDK.player.previousTrack();
    } else {
      if (this.audioService.getTime() - 10 < 0) {
        this.audioService.setTime(0);
      } else {
        this.audioService.setTime(this.audioService.getTime() - 10);
      }
    }
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
    if (this.scene?.spotifyBool) {
      this.spotifySDK.player.setVolume(event.value);
    }

    this.audioService.setGain(event.value);
  }

  // change pan based on slider input
  changePan(event: any) {
    this.audioService.setPan(event.value);
  }

  // get the duration of the current song
  duration() {
    return (this.scene?.spotifyBool) ? Math.floor(this.spotifyAPI.trackDuration / 1000) : Math.floor(this.audioService.getDuration());
  }

  // get the current time in the song, and update progress bar
  progress() {
    // get the progress bar div on the html page
    let progress = document.getElementById('progress-bar');

    if (this.scene?.spotifyBool) {
      try {
        progress.style.width = Math.floor(this.scene.trackProgress / this.spotifyAPI.trackDuration * 100) + '%';
      } catch (error) {
        progress.style.width = '0';
      }

      return Math.floor(this.scene.trackProgress/1000);
    }

    try {
      // set width as percent song complete
      progress.style.width = Math.floor(this.audioService.getTime() / this.audioService.getDuration() * 100) + '%';
    } catch (error) {
      progress.style.width = '0';
    }

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
    let playElement = (document.getElementById('play') as HTMLMediaElement);
    let playIcon = '../../../assets/icons/play.svg';
    let pauseIcon = '../../../assets/icons/pause.svg';

    if (this.scene?.spotifyBool) {
      return null;
    }

    // audio uninitialized
    if (typeof this.audio === 'undefined') {
      playElement.src = playIcon;
      return null;
    }

    // paused music, show play icon
    if (this.audio.paused) {
      playElement.src = playIcon;
      return null;
    }

    // playing music, show pause icon
    playElement.src = pauseIcon;
    return null;
  }

  // convert time in seconds to a formatted output string mm:ss
  timeString(time: number) {
    let secondsTotal = time; // raw seconds of current place in song
    let outputTime = ''; // string used for output

    // convert minutes to string
    if (secondsTotal > 60) {
      outputTime += Math.floor(secondsTotal / 60);
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

  toggleMenu() {
    let menu = document.getElementById('menu');

    menu.style.opacity = '1';

    if (typeof this.timeout !== 'undefined') {
      window.clearTimeout(this.timeout);
    }

    this.timeout = window.setTimeout(() => {
      menu.style.opacity = '0';
    }, this.menuTimeout);
  }

  // display or hide control instruction menu
  toggleInfo() {
    let infoBox = document.getElementById('info-menu'); // info box element on html

    // hide or show by changing width and opacity
    if (infoBox.style.width === '0%') {
      infoBox.style.width = '20%';
      infoBox.style.opacity = '1';
    } else if (infoBox.style.width === '20%'){
      infoBox.style.width = '0%';
      infoBox.style.opacity = '0';
    }
  }



  toggleUploadMenu() {
    let songBox = document.getElementById('upload-menu');
    let canvas = document.getElementById('renderCanvas');

    if (songBox.style.width === '0%') {
      songBox.style.width = '60%';
      songBox.style.opacity = '1';
    } else if (songBox.style.width === '60%'){
      songBox.style.width = '0%';
      songBox.style.opacity = '0';
    }
  }

  toggleEditMenu() {
    const editBox = document.getElementById('edit-menu');

    if (editBox.style.opacity === '0') {
      editBox.style.width = '15%';
      editBox.style.opacity = '1';
    } else if (editBox.style.opacity === '1'){
      editBox.style.width = '0%';
      editBox.style.opacity = '0';
    }
  }
}
