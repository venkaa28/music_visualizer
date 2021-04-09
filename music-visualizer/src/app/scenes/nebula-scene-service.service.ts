import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
// import Rate from 'three-nebula/src/initializer/Rate.js'
// import {DEFAULT_EMITTER_RATE} from 'three-nebula/src/emitter/constants.js';
import System from 'three-nebula';
import * as THREE from 'three';
import { Vector3, setY } from 'three';
import Nebula, { SpriteRenderer, Alpha, Rate} from 'three-nebula';
import {ToolsService} from '../services/tools.service'
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import {SpotifyService} from '../services/spotify.service';
import {SpotifyPlaybackSdkService} from '../services/spotify-playback-sdk.service';
import scene3 from './rainbow.json';
import { range } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';
import { max, min } from 'rxjs/operators';

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
  private lastProgress = 0; // saved last progress so we only update when the segment changes
  private dropFrames = 0;


  private vectors: Array<Vector3>; // vector for positions of all 6 orbs

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
      this.vectors = new Array<Vector3>(12);

      // Set up the vectors for the scene
      for (let i = 0; i < 12; i++) {
        this.vectors[i] = this.nebula.emitters[i].position;
      }
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
    this.camera.position.set(0, 80, 50);
    // set the camera to look at the center of the scene
    this.camera.lookAt(this.scene.position);
    // adds the camera to the scene
    this.scene.add(this.camera);

    // rotates the camera
    this.camera.rotation.y += 0.01;

    

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
      if (typeof this.spotifyService.analysis !== 'undefined' && typeof this.spotifyService.feature !== 'undefined' && this.vectors[1] !== 'undefined') {
        //const pitchAvg = this.tool.absAvg(currSegment.pitches);
        
        if (this.lastProgress !== this.trackProgress) {
          this.lastProgress = this.trackProgress;
          const curPitches = this.spotifyService.getSegment(this.trackProgress-800).pitches;

          let sortedPitches = [...curPitches];
          sortedPitches.sort((a, b) => a - b);
         // console.log(sortedPitches);
          //console.log(curPitches);

          let keptPitches = [];
          for (let i = 11; i > 8; i--) {
            keptPitches.push(sortedPitches[i]);
          }
          //console.log(keptPitches);

          let keptIndices = [];
          for (let i = 0; i < 3; i++) {
            keptIndices.push(curPitches.indexOf(keptPitches[i]));
          }
          //console.log(keptIndices);

          for (let i = 0; i < 12; i++) {
            //let loopVal = curPitches[2 * i] + curPitches[2 * i + 1]; // go by 2's because it's close enough
            let loopVal = curPitches[i];
            //if (loopVal > 0.99) {
            //  const json = {
            //    particlesMin: 1,
            //    particlesMax: 1,
            //    perSecondMin: 1,
            //    perSecondMax: 1,
            //  };
              //this.vectors[i].setY(0);
            //  this.nebula.emitters[i].setRate(Rate.fromJSON(json));
            //} else {
              //this.vectors[i].setY((1 - curPitches[i]) * 20);

            // keep framerate from dropping too much with too many particles, 
            let perSecond = 1;

            if (keptIndices.includes(i) || (loopVal > 0.9)) {
              perSecond = Math.max(((1 - loopVal) ** 4) / 2, 0.04);
              //perSecond = 0.06;
            }
            const json = {
              particlesMin: 1,
              particlesMax: 1,
              perSecondMin: perSecond,
              perSecondMax: perSecond,
            };
            this.nebula.emitters[i].setRate(Rate.fromJSON(json));
            
            //}
            //this.nebula.emitters[i].setPosition(this.vectors[i]);
          }
        }
      }
    }
    this.nebula.update();
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
