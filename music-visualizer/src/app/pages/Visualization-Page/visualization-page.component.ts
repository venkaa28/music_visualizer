import {AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import {DemoSceneServiceService} from '../../scenes/demo-scene-service.service';
import {AudioServiceService} from "../../services/audio-service.service";

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



  async logout() {
    await this.authService.logOutUser();
    await this.router.navigate(['../']);
  }

  constructor(private authService: AuthService, private router: Router, public audioService: AudioServiceService, public demoScene: DemoSceneServiceService) { }

  ngAfterViewInit(): void {
    // this.engServ.createScene(this.rendererCanvas);
    //     this.engServ.animate();
    this.audioService.loadSong(this.audioFile.nativeElement);
    this.demoScene.createScene(this.rendererCanvas);
    this.demoScene.animate();


  }


}
