import {ElementRef, Injectable, NgZone, OnDestroy} from '@angular/core';
import * as THREE from 'three';
import {ToolsService} from '../services/tools.service';
import {AudioService} from '../services/audio.service';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {SpotifyService} from '../services/spotify.service';
import {SpotifyPlaybackSdkService} from '../services/spotify-playback-sdk.service';


@Injectable({
  providedIn: 'root'
})
export class PlaneSceneServiceService implements OnDestroy{


  constructor(private ngZone: NgZone, public audioService: AudioService,
              private spotifyService: SpotifyService, private spotifyPlayer: SpotifyPlaybackSdkService,
              public tool: ToolsService) {
  }


  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private ambLight!: THREE.AmbientLight;
  private plane!: THREE.Mesh;
  private secondPlane!: THREE.Mesh;
  private loader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private darkSky: THREE.Group;
  private canvasRef: ElementRef<HTMLCanvasElement>;
  public frame = 0;
  public trackProgress = 0;
  public spotifyBool: boolean;
  private frameId: number = null;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }

    document.removeEventListener('DOMContentLoaded', this.render);
    document.removeEventListener('resize', this.resize);
  }

  public cancelAnimation() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public async createScene(canvas: ElementRef<HTMLCanvasElement>, renderer: THREE.WebGLRenderer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.canvasRef = canvas;
      this.scene = new THREE.Scene();
      this.group = new THREE.Group();
      this.loader = new GLTFLoader();

      this.renderer = renderer;
      this.scene.fog = new THREE.FogExp2(0x11111f, 0.00025);
      // sets the background color to black
      this.renderer.setClearColor(0x000000);

      // sets the size of the canvas
      this.renderer.setSize(window.innerWidth , window.innerHeight);
      this.textureLoader = new THREE.TextureLoader();

        //loading in dark sky 3d model
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
              (child.material as any).map = newTexture;
              (child.material as any).backside = true;
              (child.material as any).needsUpdate = true;
              (child.material as any).map.needsUpdate = true;
            }
          });
        });
        this.group.add(this.darkSky);
      });

      // sets a perspective camera
      this.camera = new THREE.PerspectiveCamera(80, (window.innerWidth) / (window.innerHeight), 1, 7000);
      // lets the camera at position x, y, z
      this.camera.position.set(-10, 425, -1300);
      // set the camera to look at the center of the scene
      // this.camera.lookAt(this.scene.position);
      this.camera.lookAt(0, 0, 0);
      // adds the camera to the scene
      this.scene.add(this.camera);
      //creating the plane that responds to the music
      const planeGeometry = new THREE.PlaneGeometry(1600, 1600, 100, 100);
      const planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x25E0EC,
        side: THREE.DoubleSide,
        wireframe: true
      });
      //creating the plane that sits below and moves infinitely
      const secondPlaneGeometry = new THREE.PlaneGeometry(1600, 15000, 100, 100);
      const secondPlaneMaterial = new THREE.MeshLambertMaterial({
        color: 0x696969,
        side: THREE.DoubleSide,
        wireframe: true
      });

      this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
      this.plane.rotation.x = -0.5 * Math.PI;

      this.plane.position.set(0, -30, 400);

      this.secondPlane = new THREE.Mesh(secondPlaneGeometry, secondPlaneMaterial);
      this.secondPlane.rotation.x = -0.5 * Math.PI;

      this.secondPlane.position.set(0, -180, 0);

      this.group.add(this.plane);
      this.group.add(this.secondPlane);
      // adding ambient lighting to the scene
      this.ambLight = new THREE.AmbientLight(0xaaaaaa, 1);
      this.scene.add(this.ambLight);
      //adding directional light
      const directionalLight = new THREE.DirectionalLight(0xffeedd);
      directionalLight.position.set(0, 0, 1);
      this.scene.add(directionalLight);
      //adding the group to the scene
      this.scene.add(this.group);

      resolve();
    });
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

  public async render(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.frameId = requestAnimationFrame(() => {
        this.render();
      });

      if(this.spotifyBool === true) {
        this.spotifyPlayer.player?.getCurrentState().then(state => {
          if (state) {
            this.trackProgress = state.position;
          }
        });
      }

      await this.sceneAnimation();
      this.renderer.render(this.scene, this.camera);

      resolve();
    });
  }

  async sceneAnimation(): Promise<void> {
    return new Promise(async (resolve, reject) =>  {
      if (!this.spotifyBool) {
        this.tool.freqSetup();

        this.tool.wavesBuffer(1 + this.tool.lowFreqAvgScalor, this.tool.midFreqAvgScalor, this.tool.highFreqAvgScalor, 0.001, this.plane);
      } else {
        if (typeof this.spotifyService.analysis !== 'undefined' && typeof this.spotifyService.feature !== 'undefined') {
          if (this.spotifyService.firstTimbrePreProcess === null) {
            await this.spotifyService.getTimbrePreProcessing();
          } else {
            const segmentLoudness = this.spotifyService.getSegmentLoudness(this.trackProgress - 800);
            this.tool.wavesBuffer(this.spotifyService.firstTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)] * 2,
              this.spotifyService.brightnessTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)] * 0.75,
              segmentLoudness, 0.005, this.plane);
          }
          //const pitchAvg = this.tool.absAvg(currSegment.pitches);
        }
      }
      this.plane.rotation.z += 0.005;
      this.darkSky.rotation.y += 0.0005;
      this.secondPlane.position.z += 0.05;
      if (this.secondPlane.position.z >= 6000) {
        this.secondPlane.position.z = 0;
      }
      this.secondPlane.geometry.attributes.position.needsUpdate = true;
      this.secondPlane.updateMatrix();

      this.plane.geometry.attributes.position.needsUpdate = true;
      this.plane.updateMatrix();
    
      resolve();
    });
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
