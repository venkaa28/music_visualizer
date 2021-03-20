import {AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {DemoSceneServiceService} from '../../scenes/demo-scene-service.service';
import {AudioServiceService} from '../../services/audio-service.service';
import {TestParticlesService} from '../../scenes/test-particles.service';
import {Music} from '../../classes/music'

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

  private currentSong: string = '16162673685204487';
  public current: Music = new Music();

  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }

  async upload(event: any) {
    var file = event as HTMLInputElement;
    this.audioService.upload(file.files[0]);
  }

  async loadSong(): Promise<string> {
    this.current = await this.audioService.getSong(this.currentSong);
    return this.current.filepath;
  }

  reset() {
    this.audioService.loadSong(this.audioFile.nativeElement);
    this.testParticles.animate();
  }

  constructor(private authService: AuthService, private router: Router, public audioService: AudioServiceService, public demoScene: DemoSceneServiceService,
              public testParticles: TestParticlesService) {
  }

  ngAfterViewInit(): void {
    // this.engServ.createScene(this.rendererCanvas);
    //     this.engServ.animate();
    this.audioService.loadSong(this.audioFile.nativeElement);
   // this.demoScene.createScene(this.rendererCanvas);
   //  this.demoScene.animate();
    this.testParticles.createScene(this.rendererCanvas);
    this.testParticles.animate();


  }
}
