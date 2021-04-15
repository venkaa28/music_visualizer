import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import {SpotifyService} from "../services/spotify.service";
import {SpotifyPlaybackSdkService} from "../services/spotify-playback-sdk.service";
import {ToolsService} from "../services/tools.service";

@Injectable({
  providedIn: 'root'
})
export class TestParticlesService {

  constructor(private ngZone: NgZone, public audioService: AudioService,
              private spotifyService: SpotifyService, private spotifyPlayer: SpotifyPlaybackSdkService,
              public tool: ToolsService) {
    const numParticles = this.AMOUNTX * this.AMOUNTY;

    this.positions = new Float32Array( numParticles * 3 );
    //const positions = [];
    this.scales = new Float32Array( numParticles );
    //const scales = [];

    let inc = Math.PI * (3 - Math.sqrt(5));
    let x = 0;
    let y = 0;
    let z = 0;
    let r = 0;
    let phi = 0;
    this.radius = 20;

    for (let i = 0,  l = numParticles; i < l; i = i + 3){
      const off = 2 / numParticles;
      //var vec3 = new THREE.Vector3();
      y = i * off - 1 + off / 2;
      r = Math.sqrt(1 - y * y);
      phi = i * inc;
      x = Math.cos(phi) * r;
      z = (Math.sin(phi) * r);
      x *= this.radius;
      y *= this.radius;
      z *= this.radius;

      const position = new THREE.Vector3();
      position.set(x, y, z);
      position.setLength(150);
      (this.positions)[i] = position.x;
      (this.positions)[i+1] = position.y;
      (this.positions)[i+2] = position.z;

    }
  }

  private canvas!: HTMLCanvasElement;
  private canvasRef: ElementRef<HTMLCanvasElement>;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private AMOUNTX = 125;
  private AMOUNTY = 125;
  private particles: THREE.Points;
  private count = 0;
  public t = 0;
  public frame = 0;
  public trackProgress = 0;
  public spotifyBool: boolean;
  private frameId: number = null;
  private radius: number;
  private positions: Float32Array;
  private scales: Float32Array;

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
    this.canvasRef = canvas;
    this.canvas = canvas.nativeElement;
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 4000 );
    this.camera.position.set(100, 25, 50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene = new THREE.Scene();


    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( this.positions, 3 ) );
    geometry.setAttribute( 'scale', new THREE.BufferAttribute( this.scales, 1 ) );

    //const material = new THREE.PointsMaterial( { color: this.getRandomColor() } );
    const material = new THREE.PointsMaterial( {color:0xFFFFFF});
    //

    this.particles = new THREE.Points( geometry, material );
    this.scene.add( this.particles );

    this.renderer = renderer;
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize( window.innerWidth, window.innerHeight );

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

    if (!this.spotifyBool) {
      this.tool.freqSetup();

      this.tool.makeRoughBall(this.particles,
        this.tool.modulate(Math.pow(this.tool.lowFreqDownScaled, 0.8), 0, 1, 0, 4),
        this.tool.midFreqDownScaled,
        this.tool.highFreqDownScaled, this.radius);
      //this.particles.rotation.x += 0.01;
      this.particles.rotation.y += 0.005;
      this.particles.rotation.z += 0.005;

      this.count += 0.1;
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.geometry.attributes.scale.needsUpdate = true;
    } else {
      if (typeof this.spotifyService.analysis !== 'undefined' && typeof this.spotifyService.feature !== 'undefined') {
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
          this.tool.makeRoughBall(this.particles,
            this.tool.modulate(Math.pow(this.spotifyService.firstTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)]/maxValScalor1, 0.8), 0, 1, 0, 4),
            this.spotifyService.brightnessTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)]/maxValScalor2,
            scaledAvgPitch, this.radius);
          //this.particles.rotation.x += 0.01;
          this.particles.rotation.y += 0.005;
          this.particles.rotation.z += 0.005;

          this.count += 0.1;
          this.particles.geometry.attributes.position.needsUpdate = true;
          this.particles.geometry.attributes.scale.needsUpdate = true;
        }
      }
    }


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
