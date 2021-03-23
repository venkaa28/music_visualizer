import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioServiceService} from '../services/audio-service.service';

@Injectable({
  providedIn: 'root'
})
export class PlaneSceneServiceService {

  constructor(private ngZone: NgZone, public audioService: AudioServiceService) { }

  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private ambLight!: THREE.AmbientLight;
  private noise = new SimplexNoise();
  private plane!: THREE.Mesh;
  private t = 0;

  private frameId: number = null;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.canvas = canvas.nativeElement;


    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, // grabs the canvas element
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    // sets the background color to black
    this.renderer.setClearColor(0x000000);

    // sets the size of the canvas
    this.renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
    // renderer.shadowMap.enabled = true;

    // sets a perspective camera
    this.camera = new THREE.PerspectiveCamera(45, (window.innerWidth - 50) / (window.innerHeight - 50), 0.1, 2000);
    // lets the camera at position x, y, z
    this.camera.position.set(-500, 500, -1000);
    // this.camera.position.set(0,20,800);
    // set the camera to look at the center of the scene
    this.camera.lookAt(this.scene.position);
    // adds the camera to the scene
    this.scene.add(this.camera);


    const planeGeometry = new THREE.PlaneGeometry(800, 800, 128, 128);
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
      wireframe: true
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = 0.5 * Math.PI;
    this.plane.position.set(0, -30, 0);

    this.group.add(this.plane);

    // adding ambient lighting to the scene
    this.ambLight = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(this.ambLight);

    // adding a spotlight to the scene
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    //group.rotation.y += 0.005;
    this.scene.add(this.group);
  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }
      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.sceneAnimation();

    this.renderer.render(this.scene, this.camera);
  }

  sceneAnimation = () => {

    this.audioService.analyzer.getByteFrequencyData(this.audioService.dataArray);
    const numBins = this.audioService.analyzer.frequencyBinCount;

    const lowerHalfFrequncyData = this.audioService.dataArray.slice(0, (this.audioService.dataArray.length / 2) - 1);
    const lowfrequncyData = this.audioService.dataArray.slice(0, (lowerHalfFrequncyData.length / 3) - 1);
    const midfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3), (lowerHalfFrequncyData.length / 3) * 2 - 1);
    const highfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3) * 2, lowerHalfFrequncyData.length);

    console.log(lowerHalfFrequncyData.length);


    const lowFreqAvg = this.avg(lowfrequncyData);
    const midFreqAvg = this.avg(midfrequncyData);
    const highFreqAvg = this.avg(highfrequncyData);

    const lowFreqDownScaled = lowFreqAvg/lowfrequncyData.length;
    const midFreqDownScaled = midFreqAvg/midfrequncyData.length;
    const highFreqDownScaled = highFreqAvg/highfrequncyData.length;


    const lowFreqAvgScalor = this.modulate(lowFreqDownScaled, 0,1, 0, 8);
    const midFreqAvgScalor = this.modulate(midFreqDownScaled, 0,1, 0, 8);
    const highFreqAvgScalor = this.modulate(highFreqDownScaled, 0,1, 0, 8);

    const position = this.plane.geometry.attributes.position;
    const planeSepreration = (position.count / 3) / (numBins / 2);

    // console.log(position);
    const vector = new THREE.Vector3();
    for (let i = 0,  l = position.count/2; i < l; i++){
      vector.fromBufferAttribute(position, i);
      //const time = window.performance.now();
      const scalor = this.modulate(lowerHalfFrequncyData[i%128], 0, 255, 1, 8);
      const distance  = -1* lowerHalfFrequncyData[i%128] + this.noise.noise3d(vector.x, vector.y, vector.z + lowFreqAvg * 0.001);
      position.setZ(i, distance);
      // if (i <= ((position.count / 3) - 1)){
      //   const distance = (lowFreqAvgScalor) + this.noise.noise3d(vector.x, vector.y, vector.z + lowFreqAvg * 0.001);
      //   position.setZ(i, distance);
      // }else if (i >= position.count / 3 && i <= (position.count / 3) * 2 - 1){
      //   const distance = (midFreqAvgScalor) + this.noise.noise3d(vector.x, vector.y, vector.z + midFreqAvg * 0.001);
      //   position.setZ(i, distance);
      // }else {
      //   const distance = (highFreqAvgScalor) + this.noise.noise3d(vector.x, vector.y, vector.z + highFreqAvg * 0.001);
      //   position.setZ(i, distance);
      // }
    }
    this.group.rotation.y += 0.01;
    this.plane.geometry.attributes.position.needsUpdate = true;
    // this.plane.geometry.computeVertexNormals();
    this.plane.updateMatrix();

    }

  fractionate(val: number, minVal: number, maxVal: number) {
    return (val - minVal) / (maxVal - minVal);
  }

  modulate(val: any, minVal: any, maxVal: any, outMin: number, outMax: number) {
    const fr = this.fractionate(val, minVal, maxVal);
    const delta = outMax - outMin;
    return outMin + (fr * delta);
  }

  avg = (arr) => {
    const total = arr.reduce((sum, b) => sum + b);
    return (total / arr.length);
  }

  max = (arr) => arr.reduce((a, b) => Math.max(a, b));


  public resize(): void {
    const width = window.innerWidth - 50;
    const height = window.innerHeight - 50;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
