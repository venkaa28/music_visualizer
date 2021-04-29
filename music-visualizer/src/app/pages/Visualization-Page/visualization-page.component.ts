// angular
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';

// firebase
// general libs
import * as THREE from 'three';

// local lib
import { AuthService } from '../../services/auth.service';
import { AudioService } from '../../services/audio.service';

// scenes
import { PlaneSceneServiceService } from '../../scenes/plane-scene-service.service';
import { SpotifyPlaybackSdkService } from '../../services/spotify-playback-sdk.service';
import { TestParticlesService } from '../../scenes/test-particles.service';
import { DemoSceneServiceService } from '../../scenes/demo-scene-service.service';
import { NebulaSceneServiceService } from '../../scenes/nebula-scene-service.service';
import { SeaSceneService } from 'src/app/scenes/sea-scene-service.service';
import { WavesSceneService } from 'src/app/scenes/waves-scene.service';
import { SpotifyService } from 'src/app/services/spotify.service';

// typedef dictionary type
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
  } // key listener
})
export class VisualizationPageComponent implements AfterViewInit {
  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>; // html canvas to render three scene to
  @ViewChild('audioFile', {read: ElementRef})
  public audioFile!: ElementRef<HTMLMediaElement>; // html audio to playback local and mic audio

  public audio: HTMLAudioElement; // audio element of window
  public readonly scenesAvailable = [this.planeScene, this.seaScene, this.nebulaScene, this.testParticles, this.demoScene, this.waveScene]; // list of available scenes
  public scene: any; // current scene to use

  private menuTimeout: number; // timeout in ms of menu
  private timeout: number; // id of current timeout
  private micStream: MediaStream; // user's microphone data
  private renderer: THREE.WebGLRenderer; // global three renderer
  private canvas!: HTMLCanvasElement; // dereference rendererCanvas to use in the renderer

  private lastButton: number; // keep track of which button to enable
  private pageUsed: boolean; // if page used, invert color scheme

  constructor(private authService: AuthService, private router: Router, public audioService: AudioService, public demoScene: DemoSceneServiceService,
              public testParticles: TestParticlesService, public planeScene: PlaneSceneServiceService, private readonly notifierService: NotifierService,
              private spotifySDK: SpotifyPlaybackSdkService, public nebulaScene: NebulaSceneServiceService, public seaScene: SeaSceneService,
              public waveScene: WavesSceneService, private spotifyAPI: SpotifyService) {
    // initialize variables
    this.menuTimeout = 2000;
    this.lastButton = 0;
    this.pageUsed = false;
  }

  async ngAfterViewInit(): Promise<void> {
    this.scene = this.scenesAvailable[0]; // set default scene
    this.audio = this.audioFile.nativeElement; // grab audio element from html
    this.canvas = this.rendererCanvas.nativeElement; // dereference to get canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, // grabs the canvas element
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });

    // clear the spotify bool of each scene
    this.scenesAvailable.forEach((scene) => {
      scene.spotifyBool = false;
    });

    await this.scene.createScene(this.canvas, this.renderer);

    // update time text every 100 ms
    setInterval(() => {
      this.progress();
    }, 100);
  }

  // listen to keyboard events, perform actions if certain keys are pressed
  public async keyListener(event: any): Promise<void> {
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

  private async stopAllAudio(): Promise<void> {
    // stop audio playback
    await this.audioService.pause();

    // stop audio service
    this.audioService.stopFile();
    this.audioService.stopMic();

    // reset spotify bool for all scenes, and disconnect spotify
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

    // invert color if page was originally unused
    if (!this.pageUsed) {
      document.documentElement.style.setProperty('--text-color', 'white');
      document.documentElement.style.setProperty('--image-invert', 'invert(100%)');
      this.pageUsed = true;
    }
  }

  // load song from local file
  public async loadFilePath(event: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let element = event as HTMLInputElement; // get filelist from html
      let file = element.files[0];

      // don't do anything if the user cancels
      if (typeof file === 'undefined') {
        console.log('no change');
        return;
      }

      await this.stopAllAudio();

      this.audio.src = URL.createObjectURL(file); // set source to be the file in the html
      this.audioService.loadSong(this.audio);

      document.getElementById('song-title').textContent = file.name; // set song name
      document.getElementById('song-subtitle').textContent = 'Local File'; // set song artists
      let htmlAlbum = (document.getElementById('album') as HTMLMediaElement);
      htmlAlbum.src = '../../../assets/icons/disc.svg'; // set album art to default disc svg      

      this.setControls(false, true);

      await this.scene.animate(); // animate scene
      this.toggleUploadMenu(); // get rid of upload menu
      await this.audioService.play(); // play audio

      resolve();
    });
  }

  // use mic stream as audio input
  public async loadMic(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.stopAllAudio();

      // get microphone, or else already have permissions so just use stream
      if (typeof this.micStream === 'undefined') {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          this.audioService.loadMic(stream); // load the audio into the audio context
        });
      }

      // set song title and author
      document.getElementById('song-title').textContent = 'Microphone';
      document.getElementById('song-subtitle').textContent = 'You';

      let htmlAlbum = (document.getElementById('album') as HTMLMediaElement);
      htmlAlbum.src = '../../../assets/icons/disc.svg'; // set album art to default disc svg
      
      this.setControls(true, false);

      await this.scene.animate(); // animate scene
      this.toggleUploadMenu(); // get rid of menu

      resolve();
    });
  }

  public async loadSpotify(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // TODO: error handle not token cookie

      // reroute to profile page if user doesn't have spotify connected
      if (this.authService.getUser().spotifyAPIKey == null) {
        await this.profilePage();
      }

      await this.stopAllAudio();
      this.setControls(false, false);

      // open spotify device listener, and set spotify bool to true for all scenes
      await this.spotifySDK.addSpotifyPlaybackSdk().then(() => {
        this.scenesAvailable.forEach((scene) => {
          scene.spotifyBool = true;
        });
        }
      );

      await this.scene.animate(); // animate scene
      this.toggleUploadMenu(); // get rid of upload menu

      resolve();
    });
  }

  // change the current visualization scene
  public async changeScene(event: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // close scene
      this.scenesAvailable.forEach((scene) => scene.ngOnDestroy());

      // clear renderer
      this.renderer.clear();

      // reset renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas, // grabs the canvas element
        alpha: true,    // transparent background
        antialias: true // smooth edges
      });

      // disable scene button
      (document.getElementById(`otb${this.lastButton}`) as HTMLButtonElement).disabled = false;
      // enable last scene used's button 
      (document.getElementById(`otb${event}`) as HTMLButtonElement).disabled = true;
      this.lastButton = event;

      this.scene = this.scenesAvailable[event]; // set scene
      await this.scene.createScene(this.canvas, this.renderer); // setup scene
      await this.scene.animate(); // animate scene

      resolve();
    });
  }

  // stop audio instances when routing
  public async profilePage(): Promise<void> {
    // completely stop audio service
    this.audioService.hardStop();
    
    // disconnect spotify
    if (this.spotifySDK.player !== null) {
      this.spotifySDK.player.disconnect();
    }

    // route to profile page
    await this.router.navigate(['../ProfilePage']);
  }

  /**************************************Audio controls**************************************/

  // handle play or pause
  public async togglePlay(): Promise<void> {
    if (this.scene.spotifyBool) { // spotify player toggle
      await this.spotifySDK.player.togglePlay();
    } else { // audio service toggle
      await this.audioService.playOrPause();
    }

    this.toggleMenu(); // refresh menu timeout
  }

  // load next song, or skip 10 seconds if local
  public async nextSong(): Promise<void> {
    if (this.scene.spotifyBool) {
      await this.spotifySDK.player.nextTrack(); // spotify get the next song
    } else {
      // add 10 seconds with bound detection
      if (this.audioService.getTime() + 10 > this.audioService.getDuration()) {
        this.audioService.setTime(this.audioService.getDuration());
      } else {
        this.audioService.setTime(this.audioService.getTime() + 10);
      }
    }
  }

  // load previous song, or rewind 10 seconds if local
  public async rewindSong(): Promise<void> {
    if (this.scene.spotifyBool) {
      await this.spotifySDK.player.previousTrack(); // spotify get previous song
    } else {
      // subtract 10 seconds with bound detection
      if (this.audioService.getTime() - 10 < 0) {
        this.audioService.setTime(0);
      } else {
        this.audioService.setTime(this.audioService.getTime() - 10);
      }
    }
  }

  // change fft value based on slider input
  public changeFFT(event: any): void {
    this.audioService.setFFT(Math.pow(2, event.value));
  }

  // change the smoothing constant
  public changeSC(event: any): void {
    this.audioService.setSC(event.value);
  }

  // change volume based on slider input
  public changeVolume(event: any): void {
    if (this.scene?.spotifyBool) {
      this.spotifySDK.player.setVolume(event.value);
    }

    this.audioService.setGain(event.value);
  }

  // change pan based on slider input
  public changePan(event: any): void {
    this.audioService.setPan(event.value);
  }

  // get the duration of the current song
  public duration(): number {
    return (this.scene?.spotifyBool) ? Math.floor(this.spotifyAPI.trackDuration / 1000) : Math.floor(this.audioService.getDuration());
  }

  // get the current time in the song, and update progress bar
  public progress(): number {
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

  /**************************************Visuals**************************************/

  // displays appropiate play or pause icon based on the state of the audio
  public playPauseIcon(): void {
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

  private setControls(disabled: boolean, localFile: boolean): void {
    // enable audio playback control buttons
    (document.getElementById('forward-button') as HTMLButtonElement).disabled = disabled;
    (document.getElementById('play-button') as HTMLButtonElement).disabled = disabled;
    (document.getElementById('rewind-button') as HTMLButtonElement).disabled = disabled;

    const forwardIcon: string = '../../../assets/icons/forward.svg';
    const rewindIcon: string = '../../../assets/icons/rewind.svg';
    const tenForwardIcon: string = '../../../assets/icons/icons8-forward-10-48.png';
    const tenRewindIcon: string = '../../../assets/icons/icons8-replay-10-48.png';

    // set fast forward to fast forward svg and rewind to rewind svg
    (document.getElementById('forward-image') as HTMLImageElement).src = localFile ? tenForwardIcon : forwardIcon;
    (document.getElementById('rewind-image') as HTMLImageElement).src = localFile ? tenRewindIcon : rewindIcon;
  }

  // convert time in seconds to a formatted output string mm:ss
  public timeString(time: number): string {
    let secondsTotal = time; // raw seconds of current place in song
    let outputTime = ''; // string used for output

    // convert minutes to string
    if (secondsTotal >= 60) {
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

  // reset the menu timeout
  public toggleMenu(): void {
    let menu = document.getElementById('menu'); // bottom overlay: audio controls
    let menu1 = document.getElementById('menu1'); // top overlay: scene selection

    menu.style.opacity = '1';
    menu1.style.opacity = '1';

    // if there's a timeout, clear it
    if (typeof this.timeout !== 'undefined') {
      window.clearTimeout(this.timeout);
    }

    // after menuTimeout ms, hide the overlays
    this.timeout = window.setTimeout(() => {
      menu.style.opacity = '0';
      menu1.style.opacity = '0';
    }, this.menuTimeout);
  }

  // display or hide control instruction menu
  public toggleInfo(): void {
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

  // toggle display of the upload/source selection menu
  public toggleUploadMenu(): void {
    let songBox = document.getElementById('upload-menu');

    if (songBox.style.width === '0%') {
      songBox.style.width = '60%';
      songBox.style.opacity = '1';
    } else if (songBox.style.width === '60%'){
      songBox.style.width = '0%';
      songBox.style.opacity = '0';
    }
  }

  // toggle the display of the edit menu
  public toggleEditMenu(): void {
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
