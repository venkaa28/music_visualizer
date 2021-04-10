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
  private hemisphereLight;
  private shadowLight;
  private noise = new SimplexNoise();
  private plane!: THREE.Mesh;
  private cylinder: THREE.Mesh;
  private loader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private sea;
  private airplane;
  private sky;
  private pivot;
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
    const Colors = {
      red: 0xf25346,
      white: 0xd8d0d1,
      brown: 0x59332e,
      pink: 0xF5986E,
      brownDark: 0x23190f,
      blue: 0x68c3c0,
    };

    this.canvas = canvas.nativeElement;

    // background color
    this.canvas.style.backgroundColor = '#add8e6';


    // create the scene
    var fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH;
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
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Set the direction of the light
    shadowLight.position.set(150, 100, 350);

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





    // the function to create the sea
    const Sea = function(){
      // const geom = new THREE.CylinderGeometry(60, 60, 80, 40, 10);
      const geom = new THREE.SphereGeometry(50, 50, 50);
      // const geom = new THREE.IcosahedronGeometry(50, 50);

      // const geom = new THREE.IcosahedronGeometry(50, 10);
      const lambertMaterial = new THREE.MeshLambertMaterial({
        color: Colors.blue,
        transparent: true,
        opacity: 0.9,
        // wireframe: true
      });

      // this.ball = new THREE.Mesh(geom, lambertMaterial);
      // const lambertMaterial = new THREE.MeshLambertMaterial({
      //   color: 0xff00ee,
      //   wireframe: true
      // });

      // const geom = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
      // geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

      const position = geom.attributes.position;
      const l = position.count;
      const v = new THREE.Vector3();

      this.waves = [];

      this.noise = new SimplexNoise();

      for (let i = 0; i < l; i++){
        // var v = geom.vertices[i];
        v.fromBufferAttribute(position, i);

        this.waves.push({y: v.y,
          x: v.x,
          z: v.z,
        });
      };
      // const mat = new THREE.MeshPhongMaterial({
      //   color: Colors.blue,
      //   transparent: true,
      //   opacity: .8,
      // });

      this.mesh = new THREE.Mesh(geom, lambertMaterial);
      this.mesh.receiveShadow = true;

    };

    Sea.prototype.moveWaves = function(bassFr: any, treFr: any){
      // console.log(bassFr, treFr);
      const position = this.mesh.geometry.attributes.position;
      const vector = new THREE.Vector3();
      for (let i = 0, l = position.count; i < l; i++) {
        vector.fromBufferAttribute(position, i);
        // console.log(vector);
        const offset = this.mesh.geometry.parameters.radius;
        // console.log(offset);
        const amp = 3;

        const time = window.performance.now();
        // console.log(time);
        vector.normalize();
        // console.log(vector);
        const rf = 0.00001;
        const distance = (offset + bassFr) + this.noise.noise3d((vector.x + time * rf * 5), (vector.y + time * rf * 6),
          (vector.z + time * rf * 7)) * amp * treFr;
        vector.multiplyScalar(distance);
        position.setX(i, vector.x);
        position.setY(i, vector.y);
        position.setZ(i, vector.z);
      }
      this.mesh.geometry.attributes.position.needsUpdate = true;
      this.mesh.geometry.computeVertexNormals();
      this.mesh.geometry.computeFaceNormals();
      this.mesh.updateMatrix();
    };


    // create the sea
    this.sea = new Sea();
    // push it a little bit at the bottom of the scene
    this.sea.mesh.position.y = 100;
    // add the mesh of the sea to the scene
    this.scene.add(this.sea.mesh);


    // the function to create the cloud
    const Cloud = function(){
      // Create an empty container that will hold the different parts of the cloud
      this.mesh = new THREE.Object3D();

      // create a cube geometry;
      // this shape will be duplicated to create the cloud
      const geom = new THREE.BoxGeometry(20,20,20);

      // create a material; a simple white material will do the trick
      const mat = new THREE.MeshPhongMaterial({
        color: Colors.white,
      });

      // duplicate the geometry a random number of times
      const nBlocs = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nBlocs; i++ ){

        // create the mesh by cloning the geometry
        const m = new THREE.Mesh(geom, mat);

        // set the position and the rotation of each cube randomly
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        // set the size of the cube randomly
        const s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);

        // allow each cube to cast and to receive shadows
        m.castShadow = true;
        m.receiveShadow = true;

        // add the cube to the container we first created
        this.mesh.add(m);
      }
    }



    // the function to create the sky
    const Sky = function(){
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
      for(let i = 0; i < this.nClouds; i++){
        const c = new Cloud();

        // set the rotation and the position of each cloud;
        // for that we use a bit of trigonometry
        const a = stepAngle * i; // this is the final angle of the cloud
        const h = 330 + Math.random() * 50; // this is the distance between the center of the axis and the cloud itself

        // Trigonometry!!! I hope you remember what you've learned in Math :)
        // in case you don't:
        // we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
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

    Sky.prototype.moveClouds = function(angle){
      const time = window.performance.now() * .001;
      for (let i = 0; i < this.nClouds; i++) {
        this.clouds_buf[i].rotation.z += angle * this.clouds_amp_buf[i];
        // this.clouds_buf[i].position.z = -400 - 200 * Math.sin(this.clouds_phase_buf[i]);
        // this.clouds_phase_buf[i] += 0.01 * 1 / this.nClouds * Math.PI * 2;
      }
    };

    // create the sky
    this.sky = new Sky();
    this.sky.mesh.position.y = 100;
    this.scene.add(this.sky.mesh);


    // function to create the plane
    const AirPlane = function() {

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


      // function to create the pilot
      const Pilot = function(){
        this.mesh = new THREE.Object3D();
        this.mesh.name = 'pilot';

        // angleHairs is a property used to animate the hair later
        this.angleHairs = 0;

        // Body of the pilot
        const bodyGeom = new THREE.BoxGeometry(15, 15, 15);
        const bodyMat = new THREE.MeshPhongMaterial({color: Colors.brown});
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.set(2, -12, 0);
        this.mesh.add(body);

        // Face of the pilot
        const faceGeom = new THREE.BoxGeometry(10, 10, 10);
        const faceMat = new THREE.MeshLambertMaterial({color: Colors.pink});
        const face = new THREE.Mesh(faceGeom, faceMat);
        this.mesh.add(face);

        // Hair element
        const hairGeom = new THREE.BoxGeometry(4, 4, 4);
        const hairMat = new THREE.MeshLambertMaterial({color: Colors.brown});
        const hair = new THREE.Mesh(hairGeom, hairMat);
        // Align the shape of the hair to its bottom boundary, that will make it easier to scale.
        hair.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));

        // create a container for the hair
        const hairs = new THREE.Object3D();

        // create a container for the hairs at the top
        // of the head (the ones that will be animated)
        this.hairsTop = new THREE.Object3D();

        // create the hairs at the top of the head
        // and position them on a 3 x 4 grid
        for (var i = 0; i < 12; i++){
          const h = hair.clone();
          const col = i%3;
          const row = Math.floor(i / 3);
          const startPosZ = -4;
          const startPosX = -4;
          h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
          this.hairsTop.add(h);
        }
        hairs.add(this.hairsTop);

        // create the hairs at the side of the face
        const hairSideGeom = new THREE.BoxGeometry(12,4,2);
        hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6,0,0));
        const hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
        const hairSideL = hairSideR.clone();
        hairSideR.position.set(8, -2, 6);
        hairSideL.position.set(8, -2, -6);
        hairs.add(hairSideR);
        hairs.add(hairSideL);

        // create the hairs at the back of the head
        const hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
        const hairBack = new THREE.Mesh(hairBackGeom, hairMat);
        hairBack.position.set(-1, -4, 0)
        hairs.add(hairBack);
        hairs.position.set(-5,5,0);

        this.mesh.add(hairs);

        var glassGeom = new THREE.BoxGeometry(5,5,5);
        var glassMat = new THREE.MeshLambertMaterial({color:Colors.brown});
        var glassR = new THREE.Mesh(glassGeom,glassMat);
        glassR.position.set(6,0,3);
        var glassL = glassR.clone();
        glassL.position.z = -glassR.position.z

        var glassAGeom = new THREE.BoxGeometry(11,1,11);
        var glassA = new THREE.Mesh(glassAGeom, glassMat);
        this.mesh.add(glassR);
        this.mesh.add(glassL);
        this.mesh.add(glassA);

        var earGeom = new THREE.BoxGeometry(2,3,2);
        var earL = new THREE.Mesh(earGeom,faceMat);
        earL.position.set(0,0,-6);
        var earR = earL.clone();
        earR.position.set(0,0,6);
        this.mesh.add(earL);
        this.mesh.add(earR);
      }

      // function to move the hair
      Pilot.prototype.updateHairs = function(){

        // get the hair
        var hairs = this.hairsTop.children;

        // update them according to the angle angleHairs
        var l = hairs.length;
        for (var i=0; i<l; i++){
          var h = hairs[i];
          // each hair element will scale on cyclical basis between 75% and 100% of its original size
          h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25;
        }
        // increment the angle for the next frame
        this.angleHairs += 0.16;
      }
      this.pilot = new Pilot();
      this.pilot.mesh.position.set(-10,27,0);
      this.mesh.add(this.pilot.mesh);
    };


    // create the plane
    this.airplane = new AirPlane();
    this.airplane.mesh.scale.set(.25, .25, .25);


    this.pivot = new THREE.Object3D();
    this.pivot.position.set(0, 100, 0);
    this.pivot.add(this.airplane.mesh);
    this.airplane.mesh.position.y = 95;

    this.scene.add(this.pivot);


    // create the lights
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Set the direction of the light
    this.shadowLight.position.set(150, 350, 350);

    // Allow shadow casting
    this.shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    this.shadowLight.shadow.camera.left = -400;
    this.shadowLight.shadow.camera.right = 400;
    this.shadowLight.shadow.camera.top = 400;
    this.shadowLight.shadow.camera.bottom = -400;
    this.shadowLight.shadow.camera.near = 1;
    this.shadowLight.shadow.camera.far = 1000;

    // define the resolution of the shadow; the higher the better,
    // but also the more expensive and less performant
    this.shadowLight.shadow.mapSize.width = 2048;
    this.shadowLight.shadow.mapSize.height = 2048;

    // to activate the lights, just add them to the scene
    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);

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


    this.airplane.propeller.rotation.x += 0.3;
    this.airplane.mesh.rotation.x += -0.1;
    this.pivot.rotation.z -= 0.01;
    this.sea.mesh.rotation.z += .005;
    this.sea.mesh.rotation.y += .005;
    this.sky.mesh.rotation.z += .01;
    // this.sky.moveClouds(0.01);
    this.airplane.pilot.updateHairs();


    // if(typeof analyzer != "undefined") {
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

    this.sea.moveWaves(this.modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), this.modulate(upperAvgFr, 0, 1, 0, 4));

  }
  // for re-use

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
