import { Injectable, ElementRef, NgZone } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import {ToolsService} from '../services/tools.service'
import {SpotifyPlaybackSdkService} from "../services/spotify-playback-sdk.service";
import {SpotifyService} from "../services/spotify.service";


@Injectable({
  providedIn: 'root'
})
export class SeaSceneService {
  constructor(private ngZone: NgZone, public audioService: AudioService, private spotifyService: SpotifyService,
              private spotifyPlayer: SpotifyPlaybackSdkService,
              private tool: ToolsService) { }

  public canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private hemisphereLight;
  private shadowLight;
  private noise = new SimplexNoise();
  private sea;
  private airplane;
  private sky;
  private pivot;
  public frame = 0;
  private canvasRef: ElementRef<HTMLCanvasElement>;
  private height: any;
  private width: any;
  private frameId: number = null;
  public spotifyBool: boolean;
  public trackProgress = 0;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }


  public async createScene(canvas: ElementRef<HTMLCanvasElement>, renderer: THREE.WebGLRenderer): Promise<void> {

    // Define the colors
    const Colors = {
      red: 0xf25346,
      white: 0xd8d0d1,
      brown: 0x59332e,
      pink: 0xF5986E,
      brownDark: 0x23190f,
      blue: 0x68c3c0,
    };

    // Create the scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
    this.canvas = canvas.nativeElement;
    this.canvasRef = canvas;

    // Create the camera
    let fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH;
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    this.camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
    // Set the position of the camera
    this.camera.position.x = 0;
    this.camera.position.z = 200;
    this.camera.position.y = 100;



    // Create the renderer
    this.renderer = renderer;
    this.renderer.setSize(WIDTH, HEIGHT);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0xadd8e6);


    // Create the light
    this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
    this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    this.shadowLight.position.set(150, 100, 350);
    this.shadowLight.castShadow = true;
    // define the visible area of the projected shadow
    this.shadowLight.shadow.camera.left = -400;
    this.shadowLight.shadow.camera.right = 400;
    this.shadowLight.shadow.camera.top = 400;
    this.shadowLight.shadow.camera.bottom = -400;
    this.shadowLight.shadow.camera.near = 1;
    this.shadowLight.shadow.camera.far = 1000;
    this.shadowLight.shadow.mapSize.width = 2048;
    this.shadowLight.shadow.mapSize.height = 2048;
    this.scene.add(this.hemisphereLight);
    this.scene.add(this.shadowLight);

// The Sea class
    const Sea = function(){
      const geom = new THREE.SphereGeometry(50, 50, 50);
      const lambertMaterial = new THREE.MeshLambertMaterial({
        color: Colors.blue,
        transparent: true,
        opacity: 0.9,
      });

      const position = geom.attributes.position;
      const l = position.count;
      const v = new THREE.Vector3();
      // old positions
      this.waves = [];
      this.noise = new SimplexNoise();

      for (let i = 0; i < l; i++){
        v.fromBufferAttribute(position, i);
        this.waves.push({y: v.y,
          x: v.x,
          z: v.z,
        });
      };

      this.mesh = new THREE.Mesh(geom, lambertMaterial);
      this.mesh.receiveShadow = true;
    };

    // Create the sea
    this.sea = new Sea();
    this.sea.mesh.position.y = 100;
    this.scene.add(this.sea.mesh);

    // The cloud class
    const Cloud = function() {
      this.mesh = new THREE.Object3D();
      const geom = new THREE.BoxGeometry(20, 20, 20);
      const mat = new THREE.MeshPhongMaterial({
        color: Colors.white,
      });

      const nBlocs = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nBlocs; i++) {
        const m = new THREE.Mesh(geom, mat);
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        const s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);

        m.castShadow = true;
        m.receiveShadow = true;

        this.mesh.add(m);
      }
    }

      // The function to create the sky(including the cloud)
      const Sky = function () {
        // Create an empty container
        this.mesh = new THREE.Object3D();


        // choose a number of clouds to be scattered in the sky
        this.nClouds = 15;
        this.clouds_buf = [];
        this.clouds_amp_buf = [];
        this.clouds_phase_buf = [];

        // To distribute the clouds consistently,
        // we need to place them according to a uniform angle
        const stepAngle = Math.PI * 2 / this.nClouds;

        // create the clouds
        for (let i = 0; i < this.nClouds; i++) {
          const c = new Cloud();

          // set the rotation and the position of each cloud;
          // for that we use a bit of trigonometry
          const a = stepAngle * i; // this is the final angle of the cloud
          const h = 330 + Math.random() * 50; // this is the distance between the center of the axis and the cloud itself
          c.mesh.position.y = Math.sin(a) * h;
          c.mesh.position.x = Math.cos(a) * h;
          // rotate the cloud according to its position
          c.mesh.rotation.z = a + Math.PI / 2;

          // for a better result, we position the clouds
          // at random depths inside of the scene
          c.mesh.position.z = -400 - Math.random() * 400;
          // we also set a random scale for each cloud
          const s = 1 + Math.random() * 2;
          c.mesh.scale.set(s, s, s);

          const pivot = new THREE.Object3D();
          pivot.position.set(0, 100, 0);
          pivot.add(c.mesh);

          this.clouds_buf.push(pivot);
          this.clouds_amp_buf.push(Math.random());
          this.clouds_phase_buf.push(Math.random() * Math.PI * 2);

          // do not forget to add the mesh of each cloud in the scene
          this.mesh.add(pivot);
        }
      }

      // Create the sky
      this.sky = new Sky();
      this.sky.mesh.position.y = 100;
      this.scene.add(this.sky.mesh);


      // The airplane class
      const AirPlane = function () {
        this.mesh = new THREE.Object3D();

        // Create the cabin
        const geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
        const matCockpit = new THREE.MeshPhongMaterial({color: Colors.red});
        const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
        cockpit.castShadow = true;
        cockpit.receiveShadow = true;
        this.mesh.add(cockpit);

        // Create the engine
        const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
        const matEngine = new THREE.MeshPhongMaterial({color: Colors.white});
        const engine = new THREE.Mesh(geomEngine, matEngine);
        engine.position.x = 40;
        engine.castShadow = true;
        engine.receiveShadow = true;
        this.mesh.add(engine);

        // Create the tail
        const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
        const matTailPlane = new THREE.MeshPhongMaterial({color: Colors.red});
        const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
        tailPlane.position.set(-35, 25, 0);
        tailPlane.castShadow = true;
        tailPlane.receiveShadow = true;
        this.mesh.add(tailPlane);

        // Create the wing
        const geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
        const matSideWing = new THREE.MeshPhongMaterial({color: Colors.red});
        const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
        sideWing.castShadow = true;
        sideWing.receiveShadow = true;
        this.mesh.add(sideWing);

        // propeller
        const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
        const matPropeller = new THREE.MeshPhongMaterial({color: Colors.brown});
        this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
        this.propeller.castShadow = true;
        this.propeller.receiveShadow = true;

        // blades
        const geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
        const matBlade = new THREE.MeshPhongMaterial({color: Colors.brownDark});

        const blade = new THREE.Mesh(geomBlade, matBlade);
        blade.position.set(8, 0, 0);
        blade.castShadow = true;
        blade.receiveShadow = true;
        this.propeller.add(blade);
        this.propeller.position.set(50, 0, 0);
        this.mesh.add(this.propeller);

      }

        // Create the plane
        this.airplane = new AirPlane();
        this.airplane.mesh.scale.set(.25, .25, .25);
        this.pivot = new THREE.Object3D();
        this.pivot.position.set(0, 100, 0);
        this.pivot.add(this.airplane.mesh);
        this.airplane.mesh.position.y = 95;
        this.scene.add(this.pivot);

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



  sceneAnimation = () => {
    if (!this.spotifyBool){
      this.tool.freqSetup();
      this.tool.makeRoughBall(this.sea.mesh,
        this.tool.modulate(Math.pow(this.tool.lowFreqDownScaled, 0.8), 0, 1, 0, 2),
        this.tool.midFreqDownScaled,
        this.tool.highFreqDownScaled,
        this.sea.mesh.geometry.parameters.radius)

    }else {
      if (typeof this.spotifyService.analysis !== 'undefined' && typeof this.spotifyService.feature !== 'undefined') {
        if (this.spotifyService.firstTimbrePreProcess === null) {
          this.spotifyService.getTimbrePreProcessing();
        } else {
          const scaledAvgPitch = this.spotifyService.getScaledAvgPitch(this.trackProgress);
          // const timbreAvg = this.spotifyService.getTimbreAvg(this.trackProgress);
          const segmentLoudness = this.spotifyService.getSegmentLoudness(this.trackProgress);
          const avgPitch = this.spotifyService.getAvgPitch(this.trackProgress);
          // const scaledTimbreAvg = this.modulate(timbreAvg, 0, 0.1, 0, 30);
          // this.tool.wavesBuffer(timbreAvg * 2, scaledAvgPitch, segmentLoudness, timeScalar, this.plane);
          const maxValScalar1 = this.tool.max(this.spotifyService.firstTimbrePreProcess);
          const maxValScalar2 = this.tool.max(this.spotifyService.brightnessTimbrePreProcess);
          this.tool.makeRoughBall(this.sea.mesh,
            this.tool.modulate(Math.pow(this.spotifyService.firstTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)] / maxValScalar1, 0.8), 0, 1, 0, 4),
            this.spotifyService.brightnessTimbrePreProcess![Math.floor((this.trackProgress) / 16.7)] / maxValScalar2,
            scaledAvgPitch, this.sea.mesh.geometry.parameters.radius)
        }
      }
    }

    this.airplane.propeller.rotation.x += 0.3;
    this.airplane.mesh.rotation.x += -0.1;
    this.pivot.rotation.z -= 0.01;
    this.sea.mesh.rotation.z += .005;
    this.sky.mesh.rotation.z += .01;
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
