import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VisualizationPageComponent } from './visualization-page.component';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule} from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { firebaseConfig } from '../../../environments/environment';
import { NotifierService, NotifierModule } from 'angular-notifier';
import {ReactiveFormsModule} from "@angular/forms";
import {ElementRef, ViewChild} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import * as THREE from 'three';

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
    jasmine.clock().uninstall();
    jasmine.clock().install();
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

  // test demo-scene
  it('test createScene()', () => {
    let renderer = new THREE.WebGLRenderer({
      canvas: component.rendererCanvas.nativeElement,
      alpha: true,
      antialias: true
    });
    // component.nebulaScene.createScene(component.rendererCanvas);
    // component.planeScene.createScene(component.rendererCanvas);
    component.demoScene.createScene(component.rendererCanvas, renderer);
    expect((component.demoScene as any).scene).toBeTruthy();
  });

  it('test animate()', () => {
    let renderer = new THREE.WebGLRenderer({
      canvas: component.rendererCanvas.nativeElement,
      alpha: true,
      antialias: true
    });
    // component.nebulaScene.createScene(component.rendererCanvas);
    // component.planeScene.createScene(component.rendererCanvas);
    component.demoScene.createScene(component.rendererCanvas, renderer);
    jasmine.clock().tick(3000);

    let value_old = (component.demoScene as any).group.rotation.x;
    component.demoScene.animate();

    jasmine.clock().tick(3000);
    let value_new = (component.demoScene as any).group.rotation.x;
    expect(value_new - value_old).toBe(0.001);
  });



  // test nebula-scene
  it('test createScene()', () => {
    let renderer = new THREE.WebGLRenderer({
      canvas: component.rendererCanvas.nativeElement,
      alpha: true,
      antialias: true
    });
    // component.nebulaScene.createScene(component.rendererCanvas);
    // component.planeScene.createScene(component.rendererCanvas);
    component.nebulaScene.createScene(component.rendererCanvas, renderer);
    expect((component.nebulaScene as any).scene).toBeTruthy();
  });

  // test partical-scene
  it('test createScene()', () => {
    let renderer = new THREE.WebGLRenderer({
      canvas: component.rendererCanvas.nativeElement,
      alpha: true,
      antialias: true
    });
    // component.nebulaScene.createScene(component.rendererCanvas);
    // component.planeScene.createScene(component.rendererCanvas);
    component.testParticles.createScene(component.rendererCanvas, renderer);
    expect((component.testParticles as any).scene).toBeTruthy();
  });

  // test plane-scene
  it('test createScene()', () => {
    let renderer = new THREE.WebGLRenderer({
      canvas: component.rendererCanvas.nativeElement,
      alpha: true,
      antialias: true
    });
    // component.nebulaScene.createScene(component.rendererCanvas);
    // component.planeScene.createScene(component.rendererCanvas);
    component.planeScene.createScene(component.rendererCanvas, renderer);
    expect((component.planeScene as any).scene).toBeTruthy();
  });

  // test sea-scene
  it('test createScene()', () => {
    let renderer = new THREE.WebGLRenderer({
      canvas: component.rendererCanvas.nativeElement,
      alpha: true,
      antialias: true
    });
    // component.nebulaScene.createScene(component.rendererCanvas);
    // component.planeScene.createScene(component.rendererCanvas);
    component.seaScene.createScene(component.rendererCanvas, renderer);
    expect((component.seaScene as any).scene).toBeTruthy();
  });

  // test wave-scene
  it('test createScene()', () => {
    let renderer = new THREE.WebGLRenderer({
      canvas: component.rendererCanvas.nativeElement,
      alpha: true,
      antialias: true
    });
    // component.nebulaScene.createScene(component.rendererCanvas);
    // component.planeScene.createScene(component.rendererCanvas);
    component.waveScene.createScene(component.rendererCanvas, renderer);
    expect((component.waveScene as any).scene).toBeTruthy();
  });


  it('test animate()', () => {
    //component.nebulaScene.animate();
    expect(true).toBe(false);
  });

});
