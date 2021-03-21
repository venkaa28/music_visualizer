import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioServiceService} from '../services/audio-service.service';

@Injectable({
  providedIn: 'root'
})
export class TestParticlesService {

  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private group!: THREE.Group;
  private SEPARATION = 5;
  private AMOUNTX = 150;
  private AMOUNTY = 150;
  private particles: THREE.Points;
  private noise = new SimplexNoise();
  private count = 0;
  public t = 0;

  private frameId: number = null;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 4000 );
    this.camera.position.set(150, 150, 100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene = new THREE.Scene();

    const numParticles = this.AMOUNTX * this.AMOUNTY;

    const positions = new Float32Array( numParticles * 3 );
    //const positions = [];
    const scales = new Float32Array( numParticles );
    //const scales = [];


    for (let i = 0,  l = numParticles; i < l; i = i + 3){
      const position = new THREE.Vector3();
      position.set(THREE.MathUtils.randFloatSpread(1), THREE.MathUtils.randFloatSpread(1), THREE.MathUtils.randFloatSpread(1));
      position.setLength(150);
      positions[i] = position.x;
      positions[i+1] = position.y;
      positions[i+2] = position.z;

      //positions.push(position);

    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

    const material = new THREE.PointsMaterial( { color: this.getRandomColor() } );

    //

    this.particles = new THREE.Points( geometry, material );
    this.scene.add( this.particles );

    this.renderer = new THREE.WebGLRenderer( {canvas: this.canvas, alpha: true, antialias: true } );
    this.renderer.setClearColor(0x000000);
    // this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

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
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.scale.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
    this.count += 0.1;
  }

  sceneAnimation() {

    this.audioService.analyzer.getByteFrequencyData(this.audioService.dataArray);
    // console.log(dataArray);

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

    this.makeRoughBall(this.particles, this.modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), this.modulate(upperAvgFr, 0, 1, 0, 4));
    this.particles.rotation.x += 0.01;
    //this.particles.rotation.y += 0.01;
    //this.particles.rotation.z += 0.01;


}


  makeRoughBall = (mesh: any, bassFr: any, treFr: any) => {
    const position = mesh.geometry.attributes.position;
    const vector = new THREE.Vector3();
    for (let i = 0,  l = position.count; i < l; i++){
      vector.fromBufferAttribute(position, i);
      const offset = 50;//mesh.geometry.parameters.radius;
      const amp = 8;
      const time = window.performance.now();
      vector.normalize();
      const rf = 0.00005;
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

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
