import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import { Water } from './textures/Water.js';
import { Sky } from './textures/Sky.js';
import {Vector3} from "three";
import {SpotifyService} from "../services/spotify.service";
import {SpotifyPlaybackSdkService} from "../services/spotify-playback-sdk.service";
import {ToolsService} from "../services/tools.service";


@Injectable({
  providedIn: 'root'
})
export class WavesSceneService implements OnDestroy {

  constructor(private ngZone: NgZone, public audioService: AudioService, private spotifyService: SpotifyService, private spotifyPlayer: SpotifyPlaybackSdkService, public tool: ToolsService) {
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
  private shark: THREE.Group;
  private frameId: number = null;
  public spotifyBool: boolean;
  public trackProgress = 0;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }

    document.removeEventListener('DOMContentLoaded', this.render);
    document.removeEventListener('resize', this.resize);
  }


  public async createScene(canvas: ElementRef<HTMLCanvasElement>, renderer: THREE.WebGLRenderer): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.canvas = canvas.nativeElement;

      // this.renderer = new THREE.WebGLRenderer({
      //   canvas: this.canvas, // grabs the canvas element
      //   alpha: true,    // transparent background
      //   antialias: true // smooth edges
      // }
      this.renderer = renderer;
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.loader = new GLTFLoader();
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
          waterNormals: new THREE.TextureLoader().load('../../../assets/3d_models/waternormals.jpg', function (texture) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

          }),
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: this.scene.fog !== undefined
        }
      );
      this.water.rotation.x = -Math.PI / 2;

      this.scene.add(this.water);
      // Skybox

      this.sky = new Sky();
      this.sky.scale.setScalar(10000);
      this.scene.add(this.sky);

      const skyUniforms = this.sky.material.uniforms;

      skyUniforms['turbidity'].value = 10;
      skyUniforms['rayleigh'].value = 2;
      skyUniforms['mieCoefficient'].value = 0.005;
      skyUniforms['mieDirectionalG'].value = 0.8;


      this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

      this.updateSun(this.sun, this.water, this.scene, this.pmremGenerator);
      // "Shark" (https://skfb.ly/6YsQn) by Greg is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
      /*await this.loader.load('../../../assets/3d_models/shark/scene.gltf', (model) => {
        this.shark = model.scene;
        this.shark.scale.set(5, 5, 5);
        this.shark.rotateY(180);
        this.scene.add(this.shark);
      });*/
      console.log("shark set.")
      const geometry = new THREE.BoxGeometry(30, 30, 30);
      const material = new THREE.MeshStandardMaterial({roughness: 0});
      this.mesh = new THREE.Mesh(geometry, material);

      resolve();
    });
  }

  updateSun(sun, water, scene, pmremGenerator) {

    if(!this.spotifyBool){
      this.parameters.azimuth = (this.audioService.getTime() / this.audioService.getDuration()) * 0.5;
    }else {
      this.parameters.azimuth = this.trackProgress/this.spotifyService.trackDuration *0.5;
    }
    const theta = Math.PI * ( this.parameters.inclination - 0.5 );
    const phi = 2 * Math.PI * ( this.parameters.azimuth - 0.5 );
    
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    this.sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene( this.sky ).texture;

  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', this.render);
      }
      window.addEventListener('resize', this.resize);
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    if(this.spotifyBool === true) {
      this.spotifyPlayer.player.getCurrentState().then(state => {
        if (!state) {
          // console.error('User is not playing music through the Web Playback SDK');
          // return;
        } else {
          this.trackProgress = state.position;
        }
      });
    }
    
    this.sceneAnimation();
    this.renderer.render(this.scene, this.camera);
  }

  async sceneAnimation() {
    if (!this.spotifyBool){
      this.tool.freqSetup();

      const time = performance.now() * 0.001;
      const vec3 = new Vector3();
      const pos = this.water.geometry.attributes.position;
      vec3.fromBufferAttribute(pos, 1700);

      //this.shark.position.y = Math.sin( time ) * .25 + this.tool.midFreqAvgScalor;

      this.water.material.uniforms[ 'time' ].value += 10.0 / 60.0;

      this.tool.wavesBuffer(1 + this.tool.lowFreqAvgScalor, this.tool.midFreqAvgScalor, this.tool.highFreqAvgScalor, 0.001, this.water);
    } else {
      if (typeof this.spotifyService.analysis !== 'undefined' && typeof this.spotifyService.feature !== 'undefined') {
        if (this.spotifyService.firstTimbrePreProcess === null) {
          await this.spotifyService.getTimbrePreProcessing();
        } else {
          //const pitchAvg = this.tool.absAvg(currSegment.pitches);
          const scaledAvgPitch = this.spotifyService.getScaledAvgPitch(this.trackProgress);
          const timbreAvg = this.spotifyService.getTimbreAvg(this.trackProgress);
          const segmentLoudness = this.spotifyService.getSegmentLoudness(this.trackProgress);
          const timeScalar = this.spotifyService.getTimeScalar(this.trackProgress);

          const time = performance.now() * 0.001;

          //this.shark.position.y = Math.sin( time ) * 20 + 5;
          this.water.material.uniforms[ 'time' ].value += 10.0 / 60.0;

          this.tool.wavesBuffer(timbreAvg * 2, scaledAvgPitch, segmentLoudness, timeScalar, this.water);
        }
      }
    }

    this.updateSun(this.sun, this.water, this.scene, this.pmremGenerator);
    
    this.water.geometry.attributes.position.needsUpdate = true;
    this.water.updateMatrix();
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.createScene(this.canvasRef, this.renderer);
  }
}
