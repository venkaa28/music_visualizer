import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { GUI } from './textures/dat.gui.module.js';
import { Water } from './textures/Water.js';
import { Sky } from './textures/Sky.js';
import {Vector3} from "three";


@Injectable({
  providedIn: 'root'
})
export class WavesSceneService {

  constructor(private ngZone: NgZone, public audioService: AudioService) {
    this.parameters = {
      inclination: 0.49,
      azimuth: 0.01
    };
  }
  private water: Water;
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private mesh!: THREE.Mesh;
  private group!: THREE.Group;
  private noise = new SimplexNoise();
  private sun = new THREE.Vector3();
  private loader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private canvasRef: ElementRef<HTMLCanvasElement>;
  public frame: number = 0;
  private sky: any;
  private parameters: {inclination, azimuth};
  private pmremGenerator:  THREE.PMREMGenerator;

  private frameId: number = null;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, // grabs the canvas element
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.container.appendChild( this.renderer.domElement );
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    this.camera.position.set(30, 300, 1100);

    this.camera.lookAt(0, 0, 0);
    // adds the camera to the scene
    this.scene.add(this.camera);

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000, 100, 100);
     this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( '../../../assets/3d_models/waternormals.jpg', function ( texture ) {

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        } ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: this.scene.fog !== undefined
      }
    );
    this.water.rotation.x = - Math.PI/2;

    this.scene.add( this.water );
    // Skybox

    this.sky = new Sky();
    this.sky.scale.setScalar( 10000 );
    this.scene.add( this.sky );

    const skyUniforms = this.sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;



    this.pmremGenerator = new THREE.PMREMGenerator( this.renderer );

    this.updateSun(this.sun, this.water, this.scene, this.pmremGenerator);

    // const geometry = new THREE.BoxGeometry( 30, 30, 30 );
    // const material = new THREE.MeshStandardMaterial( { roughness: 0 } );
    //
    // this.mesh = new THREE.Mesh( geometry, material );
    // this.scene.add( this.mesh );

    // const controls = new OrbitControls( this.camera, this.renderer.domElement );
    // controls.maxPolarAngle = Math.PI * 0.495;
    // controls.target.set( 0, 10, 0 );
    // controls.minDistance = 40.0;
    // controls.maxDistance = 200.0;
    // controls.update();

  }

  updateSun(sun, water, scene, pmremGenerator) {

    this.parameters.azimuth = (this.audioService.getTime() / this.audioService.getDuration()) * 0.5;
    const theta = Math.PI * ( this.parameters.inclination - 0.5 );
    const phi = 2 * Math.PI * ( this.parameters.azimuth - 0.5 );
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);
    //
    this.sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene( this.sky ).texture;

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
    const midFreqAvgScalor = this.modulate(midFreqDownScaled, 0, 1, 0, 10);
    const highFreqAvgScalor = this.modulate(highFreqDownScaled, 0, 1, 0, 2);

    // this.water.material.uniforms.distortionScale = 0;
    // this.water.material.uniformsNeedUpdate = true;

    // const position = this.mesh.geometry.attributes.position;
    //
    // const vector = new THREE.Vector3();
    //
     const time = performance.now() * 0.001;
     const vec3 = new Vector3();
    const pos = this.water.geometry.attributes.position;
    vec3.fromBufferAttribute(pos, 1700);

     this.shark.position.y = Math.sin( time ) * .25 + midFreqAvgScalor;
     console.log(this.shark.position.y);
    //
    this.water.material.uniforms[ 'time' ].value += 10.0 / 60.0;

    this.wavesBuffer(1 + lowFreqAvgScalor, midFreqAvgScalor, highFreqAvgScalor);
    this.water.geometry.attributes.position.needsUpdate = true;
    this.water.updateMatrix();

    // if (this.frame++ % 1 === 0) {
    //   this.mesh.material.color.setRGB(
    //     highFreqAvgScalor > 0 ? 1/highFreqAvgScalor * 30 : 255,
    //     midFreqAvgScalor > 0 ? 1/midFreqAvgScalor * 30 : 255,
    //     lowFreqAvgScalor > 0 ?  1/lowFreqAvgScalor * 30 : 255
    //   );
    // }

    this.updateSun(this.sun, this.water, this.scene, this.pmremGenerator);
     // this.mesh.geometry.attributes.position.needsUpdate = true;
     //  this.mesh.geometry.computeVertexNormals();
     // this.mesh.updateMatrix();

  }
  // for re-use

  wavesBuffer( waveSize, magnitude1,  magnitude2) {

    const pos = this.water.geometry.attributes.position;
    const center = new THREE.Vector3(0, 0, 0);
    const vec3 = new THREE.Vector3();

    const time = window.performance.now() * .001;
    for (let i = 0, l = pos.count; i < l; i++) {

     vec3.fromBufferAttribute(pos, i);
      vec3.sub(center);

      //const sampleNoise = this.noise.noise3d((vec3.x + time * 0.00001), (vec3.y + time * 0.00001), (vec3.z + time * 0.00001));
      const z = Math.sin(vec3.length() / -(waveSize) + (time)) * (magnitude1 + (magnitude1 / 2.5)) - (magnitude2);
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
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.createScene(this.canvasRef);
  }
}
