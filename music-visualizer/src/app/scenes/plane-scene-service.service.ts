import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioServiceService} from '../services/audio-service.service';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';


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
  private secondPlane!: THREE.Mesh;
  private loader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private darkSky: THREE.Group;
  private rain: THREE.Points;

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
    this.loader = new GLTFLoader();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, // grabs the canvas element
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.scene.fog = new THREE.FogExp2(0x11111f, 0.00025);
    // this.renderer.setClearColor(this.scene.fog.color);
    // sets the background color to black
    this.renderer.setClearColor(0xFFFFFF);

    // sets the size of the canvas
    this.renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
    this.textureLoader = new THREE.TextureLoader();
    // renderer.shadowMap.enabled = true;

    this.loader.load('../../../assets/3d_models/fantasy_sky_background/scene.gltf', (model) => {
      this.darkSky = model.scene;
      this.darkSky.scale.set(450, 450, 450);
      this.darkSky.rotateY(180);
      this.textureLoader.load( '../../../assets/3d_models/fantasy_sky_background/textures/Material__25__background_JPG_002_emissive.jpg',
        ( newTexture ) => {

        newTexture.encoding = THREE.sRGBEncoding;
        newTexture.flipY = false;
        newTexture.wrapS = THREE.RepeatWrapping;
        newTexture.wrapT = THREE.RepeatWrapping;

        this.darkSky.traverse(( child ) => {

          if (child instanceof THREE.Mesh) {
            // create a global var to reference later when changing textures
            // apply texture

            (child.material as any).map = newTexture;
            (child.material as any).backside = true;
            (child.material as any).needsUpdate = true;
            (child.material as any).map.needsUpdate = true;

          }
        });
        console.log(this.darkSky);

      });

      this.group.add(this.darkSky);
      console.log(this.darkSky.position);
    });

    // sets a perspective camera
    this.camera = new THREE.PerspectiveCamera(45, (window.innerWidth - 50) / (window.innerHeight - 50), 0.1, 7000);
    // lets the camera at position x, y, z
    this.camera.position.set(-50, 300, -1400);
    // this.camera.position.set(0,20,1500);
    // set the camera to look at the center of the scene
    // this.camera.lookAt(this.scene.position);
    this.camera.lookAt(0, 0, 0);
    // adds the camera to the scene
    this.scene.add(this.camera);


    const planeGeometry = new THREE.PlaneGeometry(1600, 1600, 100, 100);
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x25E0EC,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const secondPlaneGeometry = new THREE.PlaneGeometry(1600, 15000, 100, 100);
    const secondPlaneMaterial = new THREE.MeshLambertMaterial({
      color: 0x696969,
      side: THREE.DoubleSide,
      wireframe: true
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -0.5 * Math.PI;
    // this.plane.rotation.z =  Math.PI;
    // this.plane.rotation.x = 0.25 * Math.PI;
    this.plane.position.set(0, -30, 400);

    this.secondPlane = new THREE.Mesh(secondPlaneGeometry, secondPlaneMaterial);
    this.secondPlane.rotation.x = -0.5 * Math.PI;
    // this.plane.rotation.z =  Math.PI;
    // this.plane.rotation.x = 0.25 * Math.PI;
    this.secondPlane.position.set(0, -180, 0);

    this.group.add(this.plane);
    this.group.add(this.secondPlane);
    // adding ambient lighting to the scene
    this.ambLight = new THREE.AmbientLight(0xaaaaaa, 2);
    this.scene.add(this.ambLight);

    // adding a spotlight to the scene
    // const spotLight = new THREE.SpotLight(0xffffff);
    // spotLight.intensity = 0.9;
    // spotLight.position.set(-10, 40, 20);
    // spotLight.castShadow = true;
    // this.scene.add(spotLight);

    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    this.scene.add(directionalLight);

    // group.rotation.y += 0.005;
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
    const midfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3),
      (lowerHalfFrequncyData.length / 3) * 2 - 1);
    const highfrequncyData = this.audioService.dataArray.slice((lowerHalfFrequncyData.length / 3) * 2, lowerHalfFrequncyData.length);

    // console.log(lowerHalfFrequncyData.length);


    const lowFreqAvg = this.avg(lowfrequncyData);
    const midFreqAvg = this.avg(midfrequncyData);
    const highFreqAvg = this.avg(highfrequncyData);

    const lowFreqDownScaled = lowFreqAvg / lowfrequncyData.length;
    const midFreqDownScaled = midFreqAvg / midfrequncyData.length;
    const highFreqDownScaled = highFreqAvg / highfrequncyData.length;


    const lowFreqAvgScalor = this.modulate(lowFreqDownScaled, 0, 1, 0, 15);
    const midFreqAvgScalor = this.modulate(midFreqDownScaled, 0, 1, 0, 25);
    const highFreqAvgScalor = this.modulate(highFreqDownScaled, 0, 1, 0, 20);

    const position = this.plane.geometry.attributes.position;

    // console.log(position);
    const vector = new THREE.Vector3();
    this.wavesBuffer(1 + lowFreqAvgScalor, midFreqAvgScalor, highFreqAvgScalor);

    // for (let i = 0,  l = position.count; i < l; i++){
    //   vector.fromBufferAttribute(position, i);
      // const time = window.performance.now();
      // const scalor = this.modulate(lowerHalfFrequncyData[i % 128], 0, 255, 0, 8);
      // const distance  = -25 * scalor + this.noise.noise3d(vector.x, vector.y, vector.z + lowFreqAvg * 0.001);
      // position.setZ(i, distance);
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
    // }
    // this.group.rotation.y += 0.005;
    this.plane.rotation.z += 0.005;
    this.darkSky.rotation.y += 0.003;
    this.secondPlane.position.z += 5;
    if (this.secondPlane.position.z === 6000){
      this.secondPlane.position.z = 0;
    }
    //console.log(this.secondPlane.position.z);
    this.secondPlane.geometry.attributes.position.needsUpdate = true;
    this.secondPlane.updateMatrix();

    // this.group.rotation.x += 0.005;
    // this.group.rotation.z += 0.005;
    this.plane.geometry.attributes.position.needsUpdate = true;
    // this.plane.geometry.computeVertexNormals();
    this.plane.updateMatrix();

    }
    // for re-use

  wavesBuffer( waveSize, magnitude1,  magnitude2) {

    const pos = this.plane.geometry.attributes.position;
    const center = new THREE.Vector3(0, 0, 0);
    const vec3 = new THREE.Vector3();

    const time = window.performance.now() * .001;
    for (let i = 0, l = pos.count; i < l; i++) {

      vec3.fromBufferAttribute(pos, i);
      vec3.sub(center);

      const sampleNoise = this.noise.noise3d((vec3.x + time * 0.00001), (vec3.y + time * 0.00001), (vec3.z + time * 0.00001));
      const z = Math.sin(vec3.length() / -(waveSize) + (time)) * (magnitude1 + (sampleNoise * magnitude1 / 2.5)) - (magnitude2);
      pos.setZ(i, z);

    }
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
