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
    this.camera.position.set(500, 500, 1000);
    // set the camera to look at the center of the scene
    this.camera.lookAt(this.scene.position);
    // adds the camera to the scene
    this.scene.add(this.camera);


    const planeGeometry = new THREE.PlaneGeometry(800, 800, 100, 100);
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
    const position = this.plane.geometry.attributes.position;
    const vector = new THREE.Vector3();
    for (let i = 0,  l = position.count; i < l; i++){
      vector.fromBufferAttribute(position, i);
      if (vector.z * vector.z + vector.y * vector.y < 0.10){
        //position.setX(i, 0);
        //position.setY(i, 0);
        position.setZ(i, 0);
      } else {
        let rho = Math.sqrt( vector.x * vector.x + vector.y * vector.y );
        let phi = Math.atan2( vector.y , vector.x );
        const scaledVector = new THREE.Vector3(
          10 * Math.cos( phi ) * Math.sin( rho - this.t / 2 ) / Math.sqrt( rho ),
          10000 * Math.sin( phi ) * Math.sin( rho - this.t / 2 ) / Math.sqrt( rho ), 0);
        // position.setX(i, scaledVector.x);
         //position.setY(i, scaledVector.y);
        position.setZ(i,  100* Math.sin( phi ) * Math.sin( rho - this.t / 5 ) / Math.sqrt( rho ));
        }
      }
    this.plane.geometry.attributes.position.needsUpdate = true;
    //this.plane.geometry.computeVertexNormals();
    this.plane.updateMatrix();
    this.t++;

    }


  public resize(): void {
    const width = window.innerWidth - 50;
    const height = window.innerHeight - 50;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
