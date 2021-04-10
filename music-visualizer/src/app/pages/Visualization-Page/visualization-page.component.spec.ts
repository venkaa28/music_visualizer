import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VisualizationPageComponent } from './visualization-page.component';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { firebaseConfig } from '../../firebase';
import { NotifierService, NotifierModule } from 'angular-notifier';
import {ReactiveFormsModule} from "@angular/forms";
import {ElementRef, ViewChild} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";

describe('VisualizationPageComponent', () => {
  let component: VisualizationPageComponent;
  let fixture: ComponentFixture<VisualizationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        // BrowserModule,
        AngularFireModule.initializeApp(firebaseConfig),
        // AngularFireDatabaseModule,
        // AngularFireAuthModule,
        // AngularFirestoreModule,
        HttpClientModule,
        NotifierModule
      ],
      declarations: [ VisualizationPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('testing ngAfterViewInit()', () => {
  //   // expect(component).toBeTruthy();
  //   component.audio = component.audioFile.nativeElement;
  //   //this.audio.src = 'music-visualizer/src/assets/music/juice.mp3';
  //   // this.engServ.createScene(this.rendererCanvas);
  //   //     this.engServ.animate();
  //
  //   component.audioService.loadSong(component.audio);
  //   // this.demoScene.createScene(this.rendererCanvas);
  //   // this.demoScene.animate();
  //   // this.testParticles.createScene(this.rendererCanvas);
  //   // this.testParticles.animate();
  //   component.planeScene.createScene(component.rendererCanvas);
  //   component.planeScene.animate();
  // });

  it('test nebular', () => {
    component.nebulaScene.createScene(component.rendererCanvas);
    expect(component.nebulaScene).toBeTruthy();
  });

  it('test sea', () => {
    component.seaScene.createScene(component.rendererCanvas);
    expect(component.seaScene).toBeTruthy();
  });

  // it('test waves', () => {
  //   component.wavesScene.createScene(component.rendererCanvas);
  //   expect(component.wavesScene).toBeTruthy();
  // });

  it('test demo', () => {
    component.demoScene.createScene(component.rendererCanvas);
    expect(component.demoScene).toBeTruthy();
  });

  it('test partical', () => {
    component.testParticles.createScene(component.rendererCanvas);
    expect(component.testParticles).toBeTruthy();
  });

  it('test nebular', () => {
    component.planeScene.createScene(component.rendererCanvas);
    expect(component.planeScene).toBeTruthy();
  });



});
