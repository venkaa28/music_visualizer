import { Injectable, ElementRef, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';
import {AudioService} from '../services/audio.service';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';


@Injectable({
  providedIn: 'root'
})
export class SeaSceneService {
  constructor(private ngZone: NgZone, public audioService: AudioService) { }

  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private ambLight!: THREE.AmbientLight;
  private noise = new SimplexNoise();
  private plane!: THREE.Mesh;
  private cylinder: THREE.Mesh;
  private loader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private sea;
  private airplane;
  private sky;
  public frame = 0;

  private height: any;
  private width: any;
  private c1: 0xf7d9aa;
  private aspectRatio: number;
  private fieldOfView: number;
  private nearPlane: number;
  private farPlane: number;
  private frameId: number = null;
  private cylinderGeometry: any;

  public ngOnDestroy = (): void => {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }


  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {

    // define the colors
    let Colors = {
      red: 0xf25346,
      white: 0xd8d0d1,
      brown: 0x59332e,
      pink: 0xF5986E,
      brownDark: 0x23190f,
      blue: 0x68c3c0,
    };

    this.canvas = canvas.nativeElement;


    // create the scene
    var fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, container;
    // Get the width and the height of the screen,
    // use them to set up the aspect ratio of the camera
    // and the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // Create the scene
    this.scene = new THREE.Scene();

    // Add a fog effect to the scene; same color as the
    // background color used in the style sheet
    this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Create the camera
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
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // Allow transparency to show the gradient background
      // we defined in the CSS
      alpha: true,

      // Activate the anti-aliasing; this is less performant,
      // but, as our project is low-poly based, it should be fine :)
      antialias: true
    });

    // Define the size of the renderer; in this case,
    // it will fill the entire screen
    this.renderer.setSize(WIDTH, HEIGHT);

    // Enable shadow rendering
    this.renderer.shadowMap.enabled = true;

    // Add the DOM element of the renderer to the
    // container we created in the HTML
    // container = document.getElementById('world');
    // container.appendChild(this.renderer.domElement);




    // Listen to the screen: if the user resizes it
    // we have to update the camera and the renderer size
    window.addEventListener('resize', handleWindowResize, false);

    function handleWindowResize() {
      // update height and width of the renderer and the camera
      HEIGHT = window.innerHeight;
      WIDTH = window.innerWidth;
      this.renderer.setSize(WIDTH, HEIGHT);
      this.camera.aspect = WIDTH / HEIGHT;
      this.camera.updateProjectionMatrix();
    }


    var hemisphereLight, shadowLight;
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    // Allow shadow casting
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // define the resolution of the shadow; the higher the better,
    // but also the more expensive and less performant
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // to activate the lights, just add them to the scene
    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);



    // // create the sea(cylinder)
    // this.cylinderGeometry = new THREE.CylinderGeometry(500, 500, 800, 5, 5);
    // // rotate the geometry on the x axis
    // this.cylinderGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(3.14 / 2));
    // // create the material
    // const mat = new THREE.MeshPhongMaterial({
    //   color: '#FFFFFF',
    //   transparent: true,
    //   opacity: .9,
    //   // shading: THREE.FlatShading,
    // });
    // // To create an object in Three.js, we have to create a mesh
    // // which is a combination of a geometry and some material
    // this.cylinder = new THREE.Mesh(this.cylinderGeometry, mat);
    //
    // this.cylinder.rotation.x = -0.5 * Math.PI;
    // this.cylinder.rotation.y = -0.5 * Math.PI;
    // // mesh.rotation.z = -0.5 * Math.PI;
    //
    // // Allow the sea to receive shadows
    // this.cylinder.receiveShadow = true;
    //
    // // push it a little bit at the bottom of the scene
    // this.cylinder.position.set(0, 0, 0);
    //
    // // add the mesh of the sea to the scene
    // // this.scene.add(mesh);
    // this.group.add(this.cylinder);



    // the function to create the sea
    let Sea = function(){

      // create the geometry (shape) of the cylinder;
      // the parameters are:
      // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
      var geom = new THREE.CylinderGeometry(600,600,800,40,10);

      // rotate the geometry on the x axis
      geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));

      // create the material
      var mat = new THREE.MeshPhongMaterial({
        color:Colors.blue,
        transparent:true,
        opacity:.6,
      });

      // To create an object in Three.js, we have to create a mesh
      // which is a combination of a geometry and some material
      this.mesh = new THREE.Mesh(geom, mat);

      // Allow the sea to receive shadows
      this.mesh.receiveShadow = true;
    }


    // create the sea
    this.sea = new Sea();
    // push it a little bit at the bottom of the scene
    this.sea.mesh.position.y = -600;
    // add the mesh of the sea to the scene
    this.scene.add(this.sea.mesh);


    // the function to create the cloud
    let Cloud = function(){
      // Create an empty container that will hold the different parts of the cloud
      this.mesh = new THREE.Object3D();

      // create a cube geometry;
      // this shape will be duplicated to create the cloud
      var geom = new THREE.BoxGeometry(20,20,20);

      // create a material; a simple white material will do the trick
      var mat = new THREE.MeshPhongMaterial({
        color:Colors.white,
      });

      // duplicate the geometry a random number of times
      var nBlocs = 3+Math.floor(Math.random()*3);
      for (var i=0; i<nBlocs; i++ ){

        // create the mesh by cloning the geometry
        var m = new THREE.Mesh(geom, mat);

        // set the position and the rotation of each cube randomly
        m.position.x = i*15;
        m.position.y = Math.random()*10;
        m.position.z = Math.random()*10;
        m.rotation.z = Math.random()*Math.PI*2;
        m.rotation.y = Math.random()*Math.PI*2;

        // set the size of the cube randomly
        var s = .1 + Math.random()*.9;
        m.scale.set(s,s,s);

        // allow each cube to cast and to receive shadows
        m.castShadow = true;
        m.receiveShadow = true;

        // add the cube to the container we first created
        this.mesh.add(m);
      }
    }



    // the function to create the sky
    let Sky = function(){
      // Create an empty container
      this.mesh = new THREE.Object3D();

      // choose a number of clouds to be scattered in the sky
      this.nClouds = 20;

      // To distribute the clouds consistently,
      // we need to place them according to a uniform angle
      var stepAngle = Math.PI*2 / this.nClouds;

      // create the clouds
      for(var i=0; i<this.nClouds; i++){
        var c = new Cloud();

        // set the rotation and the position of each cloud;
        // for that we use a bit of trigonometry
        var a = stepAngle*i; // this is the final angle of the cloud
        var h = 750 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself

        // Trigonometry!!! I hope you remember what you've learned in Math :)
        // in case you don't:
        // we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
        c.mesh.position.y = Math.sin(a)*h;
        c.mesh.position.x = Math.cos(a)*h;

        // rotate the cloud according to its position
        c.mesh.rotation.z = a + Math.PI/2;

        // for a better result, we position the clouds
        // at random depths inside of the scene
        c.mesh.position.z = -400-Math.random()*400;

        // we also set a random scale for each cloud
        var s = 1+Math.random()*2;
        c.mesh.scale.set(s,s,s);

        // do not forget to add the mesh of each cloud in the scene
        this.mesh.add(c.mesh);
      }
    }

    // create the sky
    this.sky = new Sky();
    this.sky.mesh.position.y = -600;
    this.scene.add(this.sky.mesh);


    // function to create the plane
    let AirPlane = function() {

      this.mesh = new THREE.Object3D();

      // Create the cabin
      let geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
      let matCockpit = new THREE.MeshPhongMaterial({color: Colors.red});
      let cockpit = new THREE.Mesh(geomCockpit, matCockpit);
      cockpit.castShadow = true;
      cockpit.receiveShadow = true;
      this.mesh.add(cockpit);

      // Create the engine
      let geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
      let matEngine = new THREE.MeshPhongMaterial({color: Colors.white});
      let engine = new THREE.Mesh(geomEngine, matEngine);
      engine.position.x = 40;
      engine.castShadow = true;
      engine.receiveShadow = true;
      this.mesh.add(engine);

      // Create the tail
      let geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
      let matTailPlane = new THREE.MeshPhongMaterial({color: Colors.red});
      let tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
      tailPlane.position.set(-35, 25, 0);
      tailPlane.castShadow = true;
      tailPlane.receiveShadow = true;
      this.mesh.add(tailPlane);

      // Create the wing
      let geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
      let matSideWing = new THREE.MeshPhongMaterial({color: Colors.red});
      let sideWing = new THREE.Mesh(geomSideWing, matSideWing);
      sideWing.castShadow = true;
      sideWing.receiveShadow = true;
      this.mesh.add(sideWing);

      // propeller
      let geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
      let matPropeller = new THREE.MeshPhongMaterial({color: Colors.brown});
      this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
      this.propeller.castShadow = true;
      this.propeller.receiveShadow = true;

      // blades
      let geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
      let matBlade = new THREE.MeshPhongMaterial({color: Colors.brownDark});

      let blade = new THREE.Mesh(geomBlade, matBlade);
      blade.position.set(8, 0, 0);
      blade.castShadow = true;
      blade.receiveShadow = true;
      this.propeller.add(blade);
      this.propeller.position.set(50, 0, 0);
      this.mesh.add(this.propeller);
    };


    // create the plane
    this.airplane = new AirPlane();
    this.airplane.mesh.scale.set(.25,.25,.25);
    this.airplane.mesh.position.y = 100;
    this.scene.add(this.airplane.mesh);




    // adding ambient lighting to the scene
    this.ambLight = new THREE.AmbientLight(0xaaaaaa, 2);
    this.scene.add(this.ambLight);

    // adding a spotlight to the scene
    // const spotLight = new THREE.SpotLight(0xffffff);
    // spotLight.intensity = 0.9;
    // spotLight.position.set(-10, 40, 20);
    // spotLight.castShadow = true;
    // this.scene.add(spotLight);

    const directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    this.scene.add(directionalLight);

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
    const midFreqAvgScalor = this.modulate(midFreqDownScaled, 0, 1, 0, 25);
    const highFreqAvgScalor = this.modulate(highFreqDownScaled, 0, 1, 0, 20);

    // const position = this.cylinder.geometry.attributes.position;

    // console.log(position);
    const vector = new THREE.Vector3();
    this.wavesBuffer(1 + lowFreqAvgScalor, midFreqAvgScalor, highFreqAvgScalor);

    // for (let i = 0,  l = position.count; i < l; i++){
    //   vector.fromBufferAttribute(position, i);
    // const time = window.performance.now();
    // const scalor = this.modulate(lowerHalfFrequncyData[i % 128], 0, 255, 0, 8);
    // const distance  = -25 * scalor + this.noise.noise3d(vector.x, vector.y, vector.z + lowFreqAvg * 0.001);
    // position.setZ(i, distance);
    // if (i <= ((position.count / 3) - 1)){
    //   const distance = (lowFreqAvgScalor) + this.noise.noise3d(vector.x, vector.y, vector.z + lowFreqAvg * 0.001);
    //   position.setZ(i, distance);
    // }else if (i >= position.count / 3 && i <= (position.count / 3) * 2 - 1){
    //   const distance = (midFreqAvgScalor) + this.noise.noise3d(vector.x, vector.y, vector.z + midFreqAvg * 0.001);
    //   position.setZ(i, distance);
    // }else {
    //   const distance = (highFreqAvgScalor) + this.noise.noise3d(vector.x, vector.y, vector.z + highFreqAvg * 0.001);
    //   position.setZ(i, distance);
    // }
    // }
    // this.group.rotation.y += 0.005;
    // this.cylinderGeometry.rotation.z += 0.005;
    // this.cylinder.rotation.z += 0.005;
    // this.cylinder.rotation.x += 0.005;
    // this.cylinder.rotation.y += 0.005;
    // this.darkSky.rotation.y += 0.005;
    // this.group.rotation.x += 0.005;
    // this.group.rotation.z += 0.005;
    // this.cylinder.geometry.attributes.position.needsUpdate = true;
    // this.plane.geometry.computeVertexNormals();
    // this.cylinder.updateMatrix();

    this.airplane.propeller.rotation.x += 0.3;
    this.sea.mesh.rotation.z += .005;
    this.sky.mesh.rotation.z += .01;

  }
  // for re-use

  wavesBuffer(waveSize, magnitude1, magnitude2) {

    // const pos = this.cylinder.geometry.attributes.position;
    const center = new THREE.Vector3(0, 0, 0);
    const vec3 = new THREE.Vector3();

    const time = window.performance.now() * .001;
    // for (let i = 0, l = pos.count; i < l; i++) {
    //
    //   vec3.fromBufferAttribute(pos, i);
    //   vec3.sub(center);
    //
    //   const sampleNoise = this.noise.noise3d((vec3.x + time * 0.00001), (vec3.y + time * 0.00001), (vec3.z + time * 0.00001));
    //   const z = Math.sin(vec3.length() / -(waveSize) + (time)) * (magnitude1 + (sampleNoise * magnitude1 / 2.5)) - (magnitude2);
    //   pos.setZ(i, z);
    //
    // }
    // this.cylinder.geometry.scale(waveSize, magnitude1, magnitude2);
    // this.cylinder.translateX(10);
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
    const width = window.innerWidth - 50;
    const height = window.innerHeight - 50;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
