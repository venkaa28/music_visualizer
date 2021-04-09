import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
// import Rate from 'three-nebula/src/initializer/Rate.js'
// import {DEFAULT_EMITTER_RATE} from 'three-nebula/src/emitter/constants.js';
import System from 'three-nebula';
import * as THREE from 'three';
import Nebula, { SpriteRenderer, Alpha } from 'three-nebula';
import {ToolsService} from '../services/tools.service'
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import {SpotifyService} from '../services/spotify.service';
import {SpotifyPlaybackSdkService} from '../services/spotify-playback-sdk.service';
import scene3 from './rainbow.json';
import { range } from 'rxjs';

//class Rate {
//  constructor(number1: number, number2: number) {

//  }

//}

@Injectable({
  providedIn: 'root'
})
export class NebulaSceneServiceService {

  constructor(private ngZone: NgZone, public audioService: AudioService, private tool: ToolsService, 
    private spotifyService: SpotifyService, private spotifyPlayer: SpotifyPlaybackSdkService) { }

  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private ambLight!: THREE.AmbientLight;
  private noise = new SimplexNoise();
  private nebula!: any;
  private frameId: number = null;
  public frame = 0;
  public spotifyBool: boolean;
  public trackProgress = 0;

  private targetPool: any;
  //public DEFAULT_EMITTER_RATE = new Rate(1, 0.1);

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.canvas = canvas.nativeElement;

    /*
    PP effect that I didn't get to work
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(this.camera, new BloomEffect()));
    */

    Nebula.fromJSONAsync(scene3, THREE).then(loaded => {
      console.log(loaded);
      const nebulaRenderer = new SpriteRenderer(this.scene, THREE);
      this.nebula = loaded.addRenderer(nebulaRenderer);
    });

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, // grabs the canvas element
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });


    // const nebulaRenderer = new SpriteRenderer(this.scene, THREE);

    // sets the background color to black
    this.renderer.setClearColor(0x111111);

    // sets the size of the canvas
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // sets a perspective camera
    this.camera = new THREE.PerspectiveCamera(65, (window.innerWidth) / (window.innerHeight), 0.1, 1000);
    // lets the camera at position x, y, z
    this.camera.position.set(0, 50, 100);
    // set the camera to look at the center of the scene
    this.camera.lookAt(this.scene.position);
    // adds the camera to the scene
    this.scene.add(this.camera);

    // rotates the camera
    this.camera.rotation.y += 0.01;


    // 

  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render(this.nebula);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render(this.nebula);
        });
      }
      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(nebula): void {
    this.frameId = requestAnimationFrame(() => {
      this.render(nebula);
    });

    if(this.spotifyBool === true) {
      this.spotifyPlayer.player.getCurrentState().then(state => {
        if (!state) {
          // console.error('User is not playing music through the Web Playback SDK');
          // return;
        } else {
          this.trackProgress = state.position;
          this.sceneAnimation();
          this.renderer.render(this.scene, this.camera);
        }
      });
    }else {
      this.sceneAnimation();
      this.renderer.render(this.scene, this.camera);
    }
  }

  sceneAnimation = () => {

    if (!this.spotifyBool){
      this.tool.freqSetup();

      // the one particle furthest left
      this.nebula.emitters[2].setPosition(new THREE.Vector3(-60 , this.tool.lowFreqAvgScalor , this.tool.midFreqAvgScalor));
      //this.nebula.emitters[2].setRotation(new THREE.Vector3(Math.sin(90) , midFreqDownScaled , highFreqDownScaled));

      // the particle in the middle
      this.nebula.emitters[1].setPosition(new THREE.Vector3(0, this.tool.midFreqAvgScalor, this.tool.highFreqAvgScalor));
      //this.nebula.emitters[1].setRotation(new THREE.Vector3(Math.sin(90) , midFreqDownScaled , highFreqDownScaled));

      // the particle furthest right
      this.nebula.emitters[0].setPosition(new THREE.Vector3(60 , this.tool.highFreqAvgScalor , this.tool.lowFreqAvgScalor));
      //this.nebula.emitters[0].setRotation(new THREE.Vector3(Math.sin(90) , midFreqDownScaled , highFreqDownScaled));

    } else {
      if (typeof this.spotifyService.analysis !== 'undefined' && typeof this.spotifyService.feature !== 'undefined') {

        //const pitchAvg = this.tool.absAvg(currSegment.pitches);
        
        const curPitches = this.spotifyService.getSegment(this.trackProgress).pitches;

        //this.nebula.emitters[2].setPosition(new THREE.Vector3(-60, segmentLoudness*100, 0));
        //console.log(this.nebula.emitters[2]);
        //const segmentLoudness = this.spotifyService.getSegmentLoudness(this.trackProgress);
        //this.nebula.emitters[0].alpha = curPitches[1];
        //this.nebula.emitters[0].behaviours[0].alphaA.a = curPitches[1];
        //this.nebula.emitters[0].behaviours[0].alphaA.b = curPitches[1];

        for (let i = 0; i < 12; i++) {
          let oldPos = this.nebula.emitters[i].position;
          if (curPitches[i] < 0.2) {
            this.nebula.emitters[i].setPosition(new THREE.Vector3(oldPos.x, 0, oldPos.z));
          } else {
            this.nebula.emitters[i].setPosition(new THREE.Vector3(oldPos.x, (1-curPitches[i])*40, oldPos.z));
          }
        }
      }
    }
    // console.log(this.nebula);
    // console.log(this.nebula.emitters[0]);

    /* messing with number of particles emitted as another dynamic change to the scene
    this.particleEmission(this.nebula.emitters[0], lowFreqDownScaled);
    this.particleEmission(this.nebula.emitters[1], midFreqDownScaled);
    this.particleEmission(this.nebula.emitters[2], highFreqDownScaled);
    */

    

    this.nebula.update();
  }

  particleEmission(emitter, scale) {
    // emitter.emit(scale, 1);
    // emitter.setRate(DEFAULT_EMITTER_RATE * scale);
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
