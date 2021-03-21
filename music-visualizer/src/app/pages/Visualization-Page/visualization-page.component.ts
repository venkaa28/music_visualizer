import {AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {DemoSceneServiceService} from '../../scenes/demo-scene-service.service';
import {AudioServiceService} from '../../services/audio-service.service';
import {TestParticlesService} from '../../scenes/test-particles.service';
import {Music} from '../../classes/music'
import { Firebase } from 'src/app/classes/firebase';
import { FirebaseApp } from '@angular/fire';

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
  public   audioFile!: ElementRef<HTMLMediaElement>;

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
    this.current = await this.audioService.getSong(this.currentSong);
    this.audio.src = this.current.filepath
    this.audio.crossOrigin = 'anonymous'
    this.audioService.loadSong(this.audio);
    return this.current.filepath;
  }

  async playSong() {
    this.audioService.play();
  }

  async nextSong() {
    const keys = Object.keys(this.songList);
    const values = Object.values(this.songList);

    let nextIndex = values.indexOf(this.currentSong) + 1;

    if (nextIndex === keys.length) {
      nextIndex = 0;
    }

    this.currentSong = this.songList[keys[nextIndex]];
    await this.loadSong();
    this.audioService.play();
  }

  async rewindSong() {
    this.audioService.rewind();
  }

  constructor(private authService: AuthService, private router: Router, public audioService: AudioServiceService, public demoScene: DemoSceneServiceService,
              public testParticles: TestParticlesService) {
    this.loadList();
    this.loadSong();
  }

  ngAfterViewInit(): void {
    this.audio = this.audioFile.nativeElement;
    // this.engServ.createScene(this.rendererCanvas);
    //     this.engServ.animate();

    this.audioService.loadSong(this.audio);
   // this.demoScene.createScene(this.rendererCanvas);
   //  this.demoScene.animate();
    this.testParticles.createScene(this.rendererCanvas);
    this.testParticles.animate();


  }
}
