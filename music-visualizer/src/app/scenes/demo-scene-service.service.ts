import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from "../services/audio.service";

@Injectable({
  providedIn: 'root'
})
export class DemoSceneServiceService implements OnDestroy{

  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private ambLight!: THREE.AmbientLight;
  private ball!: THREE.Mesh;
  private noise = new SimplexNoise();
  private plane!: THREE.Mesh;
  private plane2!: THREE.Mesh;

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

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {

    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
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

    const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 10);
    const lambertMaterial = new THREE.MeshLambertMaterial({
      color: 0xff00ee,
      wireframe: true
    });

    this.ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    this.ball.position.set(0, 0, 0);
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
    // if(typeof analyzer != "undefined") {
    this.audioService.analyzer.getByteFrequencyData(this.audioService.dataArray);

    const lowerHalfArray = this.audioService.dataArray.slice(0, (this.audioService.dataArray.length / 2) - 1);
    const upperHalfArray = this.audioService.dataArray.slice((this.audioService.dataArray.length / 2) - 1, this.audioService.dataArray.length - 1);

    const overallAvg = this.avg(this.audioService.dataArray);
    const lowerMax = this.max(lowerHalfArray);
    const lowerAvg = this.avg(lowerHalfArray);
    const upperMax = this.max(upperHalfArray);
    const upperAvg = this.avg(upperHalfArray);

    const lowerMaxFr = lowerMax / lowerHalfArray.length;
    const lowerAvgFr = lowerAvg / lowerHalfArray.length;
    const upperMaxFr = upperMax / upperHalfArray.length;
    const upperAvgFr = upperAvg / upperHalfArray.length;

    //this.makeRoughGround(this.plane, this.modulate(upperAvgFr, 0, 1, 0.5, 4));
    //this.makeRoughGround(this.plane2, this.modulate(lowerMaxFr, 0, 1, 0.5, 4));

    this.makeRoughBall(this.ball, this.modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), this.modulate(upperAvgFr, 0, 1, 0, 4));
    this.group.rotation.x += 0.001;
    this.group.rotation.y += 0.001;

  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  makeRoughBall = (mesh: any, bassFr: any, treFr: any) => {
    const position = mesh.geometry.attributes.position;
    const vector = new THREE.Vector3();
    for (let i = 0,  l = position.count; i < l; i++){
      vector.fromBufferAttribute(position, i);
      const offset = mesh.geometry.parameters.radius;
      const amp = 5;
      const time = window.performance.now();
      vector.normalize();
      const rf = 0.00001;
      const distance = (offset + bassFr ) + this.noise.noise3d((vector.x + time * rf * 5), (vector.y +  time * rf * 6),
        (vector.z + time * rf * 7)) * amp * treFr;
      vector.multiplyScalar(distance);
      position.setX(i, vector.x);
      position.setY(i, vector.y);
      position.setZ(i, vector.z);
      // mesh.geometry.attributes.position.needsUpdate = true;
      // mesh.geometry.computeVertexNormals();
      // mesh.geometry.computeFaceNormals();
      // mesh.updateMatrix();
    }
    // mesh.geometry.vertices.forEach(function (vertex, i) {
    //     let offset = mesh.geometry.parameters.radius;
    //     let amp = 7;
    //     let time = window.performance.now();
    //     vertex.normalize();
    //     let rf = 0.00001;
    //     let distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
    //     vertex.multiplyScalar(distance);
    // });
    mesh.geometry.attributes.position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();
    mesh.updateMatrix();
    // mesh.geometry.verticesNeedUpdate = true;
    // mesh.geometry.normalsNeedUpdate = true;
    // mesh.geometry.computeVertexNormals();
    // mesh.geometry.computeFaceNormals();
  }

  makeRoughGround = (mesh: any, distortionFr: any) => {
    const position = mesh.geometry.attributes.position;
    const vector = new THREE.Vector3();
    for (let i = 0,  l = position.count; i < l; i++){
      vector.fromBufferAttribute(position, i);
      const amp = 1;
      const time = Date.now();
      const distance = (this.noise.noise(vector.x + time * 0.0003, vector.y + time * 0.0001) + 0) * distortionFr * amp;
      vector.z = distance;
      // position.setX(i, vector.x);
      // position.setY(i, vector.y);
      position.setZ(i, vector.z);
      // mesh.geometry.attributes.position.needsUpdate = true;
      // mesh.updateMatrix();
    }
    // mesh.geometry.setAttribute("position", position);
    // mesh.geometry.vertices.forEach(function (vertex, i) {
    //     let amp = 2;
    //     let time = Date.now();
    //     let distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
    //     vertex.z = distance;
    // });
    mesh.geometry.attributes.position.needsUpdate = true;
    // mesh.geometry.computeVertexNormals();
    // mesh.geometry.computeFaceNormals();
    mesh.updateMatrix();
    // mesh.geometry.verticesNeedUpdate = true;
    // mesh.geometry.normalsNeedUpdate = true;
    // mesh.geometry.computeVertexNormals();
    // mesh.geometry.computeFaceNormals();
  }



  constructor(private ngZone: NgZone, public audioService: AudioService) { }

  // some helper functions here

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

}
