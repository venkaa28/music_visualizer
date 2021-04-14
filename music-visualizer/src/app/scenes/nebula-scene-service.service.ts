import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
// import Rate from 'three-nebula/src/initializer/Rate.js'
// import {DEFAULT_EMITTER_RATE} from 'three-nebula/src/emitter/constants.js';
import System from 'three-nebula';
import * as THREE from 'three';
import { Vector3 } from 'three';
import Nebula, { SpriteRenderer } from 'three-nebula';
import {ToolsService} from '../services/tools.service'
import {AudioService} from '../services/audio.service';
import {SpotifyService} from '../services/spotify.service';
import {SpotifyPlaybackSdkService} from '../services/spotify-playback-sdk.service';
import scene3 from './rainbow.json';

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
  private nebula!: any;
  private frameId: number = null;
  public frame = 0;
  public spotifyBool: boolean;
  public trackProgress = 0;
  private lastProgress = 0; // saved last progress so we only update when the segment changes

  private vectors: Array<Vector3>; // vector for positions of all 6 orbs

  private targetPool: any;
  //public DEFAULT_EMITTER_RATE = new Rate(1, 0.1);

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public cancelAnimation(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public async createScene(canvas: ElementRef<HTMLCanvasElement>, renderer: THREE.WebGLRenderer): Promise<void> {
    this.scene = new THREE.Scene();
    this.canvas = canvas.nativeElement;
    this.renderer = renderer;
    /*
    PP effect that I didn't get to work
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(this.camera, new BloomEffect()));
    */

    await Nebula.fromJSONAsync(scene3, THREE).then(loaded => {
      const nebulaRenderer = new SpriteRenderer(this.scene, THREE);
      this.nebula = loaded.addRenderer(nebulaRenderer);
      this.vectors = new Array<Vector3>(12);

      // Set up the vectors for the scene
      for (let i = 0; i < 12; i++) {
        this.vectors[i] = this.nebula.emitters[i].position;
      }
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

      // set emitter position based on low/mid/high frequency scalor

      this.nebula.emitters[0].setPosition(new THREE.Vector3(this.vectors[0].x, -this.tool.lowFreqAvgScalor/2, this.vectors[0].z));
      this.nebula.emitters[6].setPosition(new THREE.Vector3(this.vectors[6].x, -this.tool.lowFreqAvgScalor/2, this.vectors[6].z));
      this.nebula.emitters[3].setPosition(new THREE.Vector3(this.vectors[3].x, -this.tool.lowFreqAvgScalor/2, this.vectors[3].z));
      this.nebula.emitters[9].setPosition(new THREE.Vector3(this.vectors[9].x, -this.tool.lowFreqAvgScalor/2, this.vectors[9].z));

      this.nebula.emitters[1].setPosition(new THREE.Vector3(this.vectors[1].x, this.tool.midFreqAvgScalor/2, this.vectors[1].z));
      this.nebula.emitters[7].setPosition(new THREE.Vector3(this.vectors[7].x, this.tool.midFreqAvgScalor/2, this.vectors[7].z));
      this.nebula.emitters[4].setPosition(new THREE.Vector3(this.vectors[4].x, this.tool.midFreqAvgScalor/2, this.vectors[4].z));
      this.nebula.emitters[10].setPosition(new THREE.Vector3(this.vectors[10].x, this.tool.midFreqAvgScalor/2, this.vectors[10].z));
      // nobody likes high's
    } else {
      if (typeof this.spotifyService.analysis !== 'undefined' && typeof this.spotifyService.feature !== 'undefined' && typeof this.vectors[1] !== 'undefined') {

        if (this.lastProgress !== this.trackProgress) {
          this.lastProgress = this.trackProgress;
          const curPitches = this.spotifyService.getSegment(this.trackProgress-800).pitches;

          let keptIndices = this.tool.getIndicesOfMax(curPitches, 4);

          for (let i = 0; i < 12; i++) {
            let loopVal = curPitches[i];
            let perSecond = 1;

            if (keptIndices.includes(i) || (loopVal > 0.9)) {
              perSecond = Math.max(((1 - loopVal) ** 4) / 2, 0.04);
            }
            this.tool.setRate(this.nebula.emitters[i], perSecond);
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
