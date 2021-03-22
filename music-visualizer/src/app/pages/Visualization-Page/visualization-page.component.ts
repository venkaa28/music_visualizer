import {AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {DemoSceneServiceService} from '../../scenes/demo-scene-service.service';
import {AudioServiceService} from '../../services/audio-service.service';
import {TestParticlesService} from '../../scenes/test-particles.service';
import {Music} from '../../classes/music'
import { Firebase } from 'src/app/classes/firebase';
import { FirebaseApp } from '@angular/fire';
import { fileURLToPath } from 'url';

type Dict = {[key: string]: any};

@Component({
  selector: 'app-visualization-page',
  templateUrl: './visualization-page.component.html',
  styleUrls: ['./visualization-page.component.css']
})
export class VisualizationPageComponent implements AfterViewInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('audioFile', {read: ElementRef})
  public audioFile!: ElementRef<HTMLMediaElement>;

  public audio: HTMLAudioElement;

  private currentSong: string = '16162754104549215';
  public current: Music = new Music();
  private songList: Dict;

  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }

  async upload(event: any) {
    var file = event as HTMLInputElement;
    this.audioService.upload(file.files[0]);
  }

  async loadList() {
    this.songList = await this.audioService.getSongList();
    console.log(this.songList);
  }

  async loadSong(): Promise<string> {
    this.current = await this.audioService.getRemoteSong(this.currentSong);
    this.audio.src = this.current.filepath;
    this.audio.crossOrigin = 'anonymous';
    this.audioService.loadSong(this.audio);
    this.changeVolume({'value': 0.5});
    return this.current.filepath;
  }

  loadFilePath(event: any) {
    var file = event as HTMLInputElement;

    this.current = new Music();
    this.current.filepath = URL.createObjectURL(file.files[0]);;
    this.current.isPublic = true;
    this.current.name = 'test';
    this.current.source = 'local';
    this.current.uploadEmail = this.authService.getUser().email;

    this.audio.src = this.current.filepath;
    this.audioService.gainNode.gain.value = 0;
    this.audioService.loadSong(this.audio);
    return this.current.filepath;
  }

  async nextSong() {
    const keys = Object.keys(this.songList);
    const values = Object.values(this.songList);

    let nextIndex = values.indexOf(this.currentSong) + 1;

    if (nextIndex === keys.length) {
      nextIndex = 0;
    }

    this.currentSong = this.songList[keys[nextIndex]];
    await this.loadSong().then(() => this.audioService.play());
  }

  async rewindSong() {
    const keys = Object.keys(this.songList);
    const values = Object.values(this.songList);

    let nextIndex = values.indexOf(this.currentSong) - 1;

    if (nextIndex === -1) {
      nextIndex = keys.length - 1;
    }

    this.currentSong = this.songList[keys[nextIndex]];
    await this.loadSong().then(() => this.audioService.play());
  }

  playPauseIcon() {
    if (typeof this.audio === 'undefined') {
      return 'fa fa-play';;
    }

    if (this.audio.paused) {
      return 'fa fa-play';
    }

    return 'fa fa-pause';
  }

  changeVolume(input) {
    console.log(input.value);
    this.audioService.gainNode.gain.value = input.value;
  }

  changeSmooth(input) {
    var time = this.audioService.audioElement.currentTime;
    this.audioService.smoothConstant = input.value;
    this.audioService.reloadSong();
    this.audioService.audioElement.currentTime = time;
  }

  changeFFT(input) {
    var time = this.audioService.audioElement.currentTime;
    this.audioService.fftSize = Math.pow(2, input.value);
    this.audioService.reloadSong();
    this.audioService.audioElement.currentTime = time;
  }

  constructor(private authService: AuthService, private router: Router, public audioService: AudioServiceService, public demoScene: DemoSceneServiceService,
              public testParticles: TestParticlesService) {
    this.loadList();
    this.loadSong();
  }

  duration() {
    if (typeof this.audioService.audioElement === "undefined") {
      return 0;
    }

    return Math.floor(this.audioService.audioElement.duration);
  }

  progress() {
    if (typeof this.audioService.audioElement === "undefined") {
      return 0;
    }

    return Math.floor(this.audioService.audioElement.currentTime);
  }

  timeString(time: number) {
    if (typeof this.audioService.audioElement === "undefined") {
      return 'NaN';
    }

    var secondsTotal = time;
    var outputTime: string = "";
    
    if (secondsTotal > 60) {
      outputTime += Math.floor(secondsTotal/60);
      secondsTotal = secondsTotal % 60;
    } else {
      outputTime += '0';
    }

    outputTime += ':';
    
    if (secondsTotal < 10) {
      outputTime += '0';
    }
    
    outputTime += secondsTotal;

    return outputTime;
  }

  changeTime(input) {
    this.audioService.audioElement.currentTime = input.value;
    console.log("Fire");
  }

  ngAfterViewInit(): void {
    this.audio = this.audioFile.nativeElement;
    //this.audio.src = 'music-visualizer/src/assets/music/juice.mp3';
    // this.engServ.createScene(this.rendererCanvas);
    //     this.engServ.animate();

    this.audioService.loadSong(this.audio);
    this.demoScene.createScene(this.rendererCanvas);
    this.demoScene.animate();
    // this.testParticles.createScene(this.rendererCanvas);
    // this.testParticles.animate();


  }
}
