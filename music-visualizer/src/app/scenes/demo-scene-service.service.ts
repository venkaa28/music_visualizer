import {ElementRef, Injectable, NgZone, OnDestroy} from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from "../services/audio.service";
import {SpotifyService} from "../services/spotify.service";
import {SpotifyPlaybackSdkService} from "../services/spotify-playback-sdk.service";
import {ToolsService} from "../services/tools.service";

@Injectable({
  providedIn: 'root'
})
export class DemoSceneServiceService implements OnDestroy{

  constructor(private ngZone: NgZone, public audioService: AudioService,
              private spotifyService: SpotifyService, private spotifyPlayer: SpotifyPlaybackSdkService,
              public tool: ToolsService) {
    this.icosahedronGeometry = new THREE.IcosahedronGeometry(10, 10);
    this.lambertMaterial = new THREE.MeshLambertMaterial({
      color: 0xff00ee,
      wireframe: true
    });

    this.ball = new THREE.Mesh(this.icosahedronGeometry, this.lambertMaterial);
  }

  private canvas!: HTMLCanvasElement;
  private canvasRef: ElementRef<HTMLCanvasElement>;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private ambLight!: THREE.AmbientLight;
  private ball!: THREE.Mesh;
  private noise = new SimplexNoise();
  private plane!: THREE.Mesh;
  private plane2!: THREE.Mesh;
  public spotifyBool: boolean;
  public trackProgress = 0;
  public icosahedronGeometry: THREE.BufferGeometry;
  public lambertMaterial: THREE.MeshLambertMaterial;

  private frameId: number = null;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public cancelAnimation() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public async createScene(canvas: ElementRef<HTMLCanvasElement>, renderer: THREE.WebGLRenderer): Promise<void> {

    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.canvas = canvas.nativeElement;
    this.canvasRef = canvas;

    this.renderer = renderer;
    this.renderer.setClearColor(0x000000);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.shadowMap.enabled = true;

    this.camera = new THREE.PerspectiveCamera(45, (window.innerWidth) / (window.innerHeight), 0.1, 1000);
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);

    const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x6904CE,
      side: THREE.DoubleSide,
      wireframe: true
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -0.5 * Math.PI;
    this.plane.position.set(0, 30, 0);
    //this.group.add(this.plane);

    this.plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane2.rotation.x = -0.5 * Math.PI;
    this.plane2.position.set(0, -30, 0);
    //this.group.add(this.plane2);


    this.ball.position.set(0,0,0);
    this.group.add(this.ball);


    this.ambLight = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(this.ambLight);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(this.ball.position);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // orbitControls.autoRotate = true;

    this.scene.add(this.group);
  }

  public async animate(): Promise<void> {
    await this.ngZone.runOutsideAngular(async () => {
      if (document.readyState !== 'loading') {
        await this.render();
      } else {
        window.addEventListener('DOMContentLoaded', async () => {
          await this.render();
        });
      }
      window.addEventListener('resize', async () => {
        await this.resize();
      });
    });
  }

  public async render(): Promise<void> {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    if (this.spotifyBool === true) {
      this.spotifyPlayer.player.getCurrentState().then(async state => {
        if (!state) {
          // console.error('User is not playing music through the Web Playback SDK');
        } else {
          this.trackProgress = state.position;
          await this.sceneAnimation();
          this.renderer.render(this.scene, this.camera);
        }
      });
    } else {
      await this.sceneAnimation();
      this.renderer.render(this.scene, this.camera);
    }

  }

  async sceneAnimation() {
    // if(typeof analyzer != "undefined") {
    const {radius} = (this.ball as any).geometry.parameters.radius;
    if (!this.spotifyBool) {
      this.tool.freqSetup();

      this.tool.makeRoughBall(this.ball,
        this.tool.modulate(Math.pow(this.tool.lowFreqDownScaled, 0.8), 0, 1, 0, 4),
        this.tool.midFreqDownScaled,
        this.tool.highFreqDownScaled, radius);
    } else {
      if (this.spotifyService.firstTimbrePreProcess === null) {
        await this.spotifyService.getTimbrePreProcessing();
      } else {
      const scaledAvgPitch = this.spotifyService.getScaledAvgPitch(this.trackProgress);
      const timbreAvg = this.spotifyService.getTimbreAvg(this.trackProgress);
      const segmentLoudness = this.spotifyService.getSegmentLoudness(this.trackProgress);
      const timeScalar = this.spotifyService.getTimeScalar(this.trackProgress);
      // const scaledTimbreAvg = this.modulate(timbreAvg, 0, 0.1, 0, 30);
      //this.spotifyService.firstTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)] * 2
      //this.spotifyService.brightnessTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)] * 0.75
      const maxValScalor1 = this.tool.max(this.spotifyService.firstTimbrePreProcess!);
      const maxValScalor2 = this.tool.max(this.spotifyService.brightnessTimbrePreProcess!);
      // this.tool.makeRoughBall(this.ball,
      //   this.tool.modulate(Math.pow(this.spotifyService.firstTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)]/maxValScalor1, 0.8), 0, 1, 0, 4),
      //   this.spotifyService.brightnessTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)]/maxValScalor2,
      //   scaledAvgPitch, radius);
        }
      }
    this.group.rotation.x += 0.001;
    this.group.rotation.y += 0.001;

  }

  public async resize(): Promise<void> {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    await this.createScene(this.canvasRef, this.renderer);
  }

}
