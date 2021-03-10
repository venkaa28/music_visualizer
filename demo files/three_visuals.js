
let scene, camera, renderer; //, cube, light;
let ball;
let noise = new SimplexNoise();
let plane, plane2;

function init() {


    scene = new THREE.Scene();
    let group = new THREE.Group();


    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,0,100);
    camera.lookAt(scene.position);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});

    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.shadowMap.enabled = true;


    let planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
    let planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x6904ce,
        side: THREE.DoubleSide,
        wireframe: true
    });

    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0, 30, 0);
    group.add(plane);

    plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    plane2.rotation.x = -0.5 * Math.PI;
    plane2.position.set(0, -30, 0);
    group.add(plane2);

    let icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
    let lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    ball.position.set(0, 0, 0);
    group.add(ball);


    let ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    let spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(ball.position);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // orbitControls.autoRotate = true;

    scene.add(group);

    document.body.appendChild(renderer.domElement);
    //console.log(ball.geometry.attributes.position);
    render();
    function render() { // this function runs at every update

        //if(typeof analyzer != "undefined") {
            analyzer.getByteFrequencyData(dataArray);
            console.log("analyzer is not null");
            //console.log(dataArray);

            let lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
            let upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

            let overallAvg = avg(dataArray);
            let lowerMax = max(lowerHalfArray);
            let lowerAvg = avg(lowerHalfArray);
            let upperMax = max(upperHalfArray);
            let upperAvg = avg(upperHalfArray);

            let lowerMaxFr = lowerMax / lowerHalfArray.length;
            let lowerAvgFr = lowerAvg / lowerHalfArray.length;
            let upperMaxFr = upperMax / upperHalfArray.length;
            let upperAvgFr = upperAvg / upperHalfArray.length;

            //console.log(plane.geometry.isBufferGeometry);
            //console.log(plane2.geometry.isBufferGeometry);
            makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
            makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));

            makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
            //group.rotation.y += 0.005;

            renderer.render(scene, camera);
            requestAnimationFrame(render);
        //}
    }

    function makeRoughBall(mesh, bassFr, treFr) {
        let position = mesh.geometry.attributes.position;
        let vector = new THREE.Vector3();
        for (let i = 0,  l = position.count; i<l; i++){
            vector.fromBufferAttribute(position, i);
            vector.applyMatrix4(mesh.matrixWorld);
            let offset = mesh.geometry.parameters.radius;
            let amp = 7;
            let time = window.performance.now();
            vector.normalize();
            let rf = 0.00001;
            let distance = (offset + bassFr ) + noise.noise3D(vector.x + time *rf*7, vector.y +  time*rf*8, vector.z + time*rf*9) * amp * treFr;
            vector.multiplyScalar(distance);
            position.setX(i, vector.x);
            position.setY(i, vector.y);
            position.setZ(i, vector.z);
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

    function makeRoughGround(mesh, distortionFr) {
        let position = mesh.geometry.attributes.position;
        let vector = new THREE.Vector3();
        for (let i = 0,  l = position.count; i<l; i++){
            vector.fromBufferAttribute(position, i);
            vector.applyMatrix4(mesh.matrixWorld);
            //console.log(vector);
            let amp = 1;
            let time = Date.now();
            let distance = (noise.noise2D(vector.x + time * 0.0003, vector.y + time * 0.0001) + 0) * distortionFr * amp;
            vector.z = distance;
            //position.setX(i, vector.x);
            //position.setY(i, vector.y);
            position.setZ(i, vector.z);
            // mesh.geometry.attributes.position.needsUpdate = true;
            // mesh.updateMatrix();
        }
        //mesh.geometry.setAttribute("position", position);
        // mesh.geometry.vertices.forEach(function (vertex, i) {
        //     let amp = 2;
        //     let time = Date.now();
        //     let distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
        //     vertex.z = distance;
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

}

function update () {
    // Draw!
    renderer.render(scene, camera);
    render();
    // Schedule the next frame.
    requestAnimationFrame(update);
}



//some helper functions here
function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    let fr = fractionate(val, minVal, maxVal);
    let delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    let total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
// Schedule the first frame.
//requestAnimationFrame(update);

