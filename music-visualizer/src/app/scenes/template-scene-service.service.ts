import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioServiceService} from "../services/audio-service.service";

@Injectable({
  providedIn: 'root'
})
export class TemplateSceneServiceService {

  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private ambLight!: THREE.AmbientLight;
  private noise = new SimplexNoise();

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
    //sets the background color to black
    this.renderer.setClearColor(0x000000);

    // sets the size of the canvas
    this.renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
    // renderer.shadowMap.enabled = true;

    // sets a perspective camera
    this.camera = new THREE.PerspectiveCamera(45, (window.innerWidth - 50) / (window.innerHeight - 50), 0.1, 1000);
    // lets the camera at position x, y, z
    this.camera.position.set(0, 0, 100);
    // set the camera to look at the center of the scene
    this.camera.lookAt(this.scene.position);
    // adds the camera to the scene
    this.scene.add(this.camera);

    // add scene objects with mesh and material here

    // adding ambient lighting to the scene
    this.ambLight = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(this.ambLight);

    // adding a spotlight to the scene
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    // spotLight.lookAt(this.ball.position);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

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
    // put code that animates objects in here
  }

  public resize(): void {
    const width = window.innerWidth - 50;
    const height = window.innerHeight - 50;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  constructor(private ngZone: NgZone, public audioService: AudioServiceService) { }
}
