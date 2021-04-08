import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
// import Rate from 'three-nebula/src/initializer/Rate.js'
// import {DEFAULT_EMITTER_RATE} from 'three-nebula/src/emitter/constants.js';
import System from 'three-nebula';
import * as THREE from 'three';
import Nebula, { SpriteRenderer } from 'three-nebula';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import scene3 from './selfNebula.json';
import scene4 from './selfNebula.json';

class Rate {
  constructor(number1: number, number2: number) {

  }

}

@Injectable({
  providedIn: 'root'
})
export class NebulaSceneServiceService {

  constructor(private ngZone: NgZone, public audioService: AudioService) { }

  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private ambLight!: THREE.AmbientLight;
  private noise = new SimplexNoise();
  private nebula!: any;
  private composer!: THREE.Composer;
  private frameId: number = null;
  public frame = 0;

  private targetPool: any;
  public DEFAULT_EMITTER_RATE = new Rate(1, 0.1);

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

    // add scene objects with mesh and material here

    // adding ambient lighting to the scene
    this.ambLight = new THREE.AmbientLight(0xFFFFFF);
    this.scene.add(this.ambLight);

    // adding a spotlight to the scene
    const spotLight = new THREE.SpotLight(0xff8c19);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    // spotLight.lookAt(this.ball.position);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
    this.scene.fog = new THREE.FogExp2(0x03544e, 0.01);

    this.scene.add(this.group);

    // rotates the particles

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

    this.sceneAnimation();

    this.renderer.render(this.scene, this.camera);
  }

  sceneAnimation = () => {
    // grabbing the audio service data
    this.audioService.analyzer.getByteFrequencyData(this.audioService.dataArray);
    const numBins = this.audioService.analyzer.frequencyBinCount;

    const lowerThirdFrequncyData = this.audioService.dataArray.slice(0, (this.audioService.dataArray.length / 3) - 1);
    const lowfrequncyData = this.audioService.dataArray.slice(0, (lowerThirdFrequncyData.length / 3) - 1);
    const midfrequncyData = this.audioService.dataArray.slice((lowerThirdFrequncyData.length / 3),
      (lowerThirdFrequncyData.length / 3) * 2 - 1);
    const highfrequncyData = this.audioService.dataArray.slice((lowerThirdFrequncyData.length / 3) * 2, lowerThirdFrequncyData.length);

    const lowFreqAvg = this.avg(lowfrequncyData);
    const midFreqAvg = this.avg(midfrequncyData);
    const highFreqAvg = this.avg(highfrequncyData);

    const lowFreqDownScaled = lowFreqAvg / lowfrequncyData.length;
    const midFreqDownScaled = midFreqAvg / midfrequncyData.length;
    const highFreqDownScaled = highFreqAvg / highfrequncyData.length;

    const lowFreqAvgScalor = this.modulate(lowFreqDownScaled, 0, 1, 0, 5);
    const midFreqAvgScalor = this.modulate(midFreqDownScaled, 0, 1, 0, 5);
    const highFreqAvgScalor = this.modulate(highFreqDownScaled, 0, 1, 0, 5);

    // console.log(this.nebula);
    // console.log(this.nebula.emitters[0]);

    /* messing with number of particles emitted as another dynamic change to the scene
    this.particleEmission(this.nebula.emitters[0], lowFreqDownScaled);
    this.particleEmission(this.nebula.emitters[1], midFreqDownScaled);
    this.particleEmission(this.nebula.emitters[2], highFreqDownScaled);
    */

    // the one particle furthest left
    this.nebula.emitters[2].setPosition(new THREE.Vector3(-60 , lowFreqAvgScalor , midFreqAvgScalor));
    this.nebula.emitters[2].setRotation(new THREE.Vector3(Math.sin(90) , midFreqDownScaled , highFreqDownScaled));

    // the particle in the middle
    this.nebula.emitters[1].setPosition(new THREE.Vector3(0, midFreqAvgScalor, highFreqAvgScalor));
    this.nebula.emitters[1].setRotation(new THREE.Vector3(Math.sin(90) , midFreqDownScaled , highFreqDownScaled));

    // the particle furthest right
    this.nebula.emitters[0].setPosition(new THREE.Vector3(60 , highFreqAvgScalor , lowFreqAvgScalor));
    this.nebula.emitters[0].setRotation(new THREE.Vector3(Math.sin(90) , midFreqDownScaled , highFreqDownScaled));


    this.nebula.update();
  }

  particleEmission(emitter, scale) {
    // emitter.emit(scale, 1);
    // emitter.setRate(DEFAULT_EMITTER_RATE * scale);
  }

  avg = (arr) => {
    const total = arr.reduce((sum, b) => sum + b);
    return (total / arr.length);
  }

  fractionate(val: number, minVal: number, maxVal: number) {
    return (val - minVal) / (maxVal - minVal);
  }

  modulate(val: any, minVal: any, maxVal: any, outMin: number, outMax: number) {
    const fr = this.fractionate(val, minVal, maxVal);
    const delta = outMax - outMin;
    return outMin + (fr * delta);
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
