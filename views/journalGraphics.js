import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

class JournalGraphic extends THREE.Mesh{
    constructor(title, w, h, l){
        let geometry = new THREE.BoxGeometry(w, h, l);
        let textureLoader = new THREE.TextureLoader();
        textureLoader.setPath('../images/book/');
        let bookTextures = [
            new THREE.MeshBasicMaterial({
                map: textureLoader.load("pagesflipped.jpeg"),
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load("left.jpeg"),
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load("pages.jpeg"),
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load("pages.jpeg"),
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load("front.jpeg"),
            }),
            new THREE.MeshBasicMaterial({
                map: textureLoader.load("back.jpeg"),
            }),  
        ];
        super(geometry, bookTextures);
        this.width = w;
        this.length = l;
        this.height = h;
        this.title = title;
    }
    addToGrid(index){
        console.log("added to grid")
        let xBoundary = 4.0;
        let yTopBoundary = 4.0;
        let columns = 5;

        let row = Math.floor(index / columns);
        let column = index % columns;
        
        let xPos = (column * xBoundary) - xBoundary; // bounded to -4,0,4
        let yPos = yTopBoundary - row*yTopBoundary; // unbounded

        this.position.set(xPos, yPos, -0.5);
        console.log(this.position.x, this.position.y)
    }
}

// graphics setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
//const controls = new OrbitControls(camera, renderer.domElement); // rotate with mousedown
const username = document.getElementById("greeting").innerHTML.split(",")[0].split(" ").pop();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

async function setBackground(){
    new THREE.TextureLoader().load('https://assets.codepen.io/191583/airplane-hanger-env-map.jpg', tx => {
        scene.background = new THREE.PMREMGenerator(renderer).fromEquirectangular(tx).texture
    });
}

function animate() {
    //console.log(box.position.x, box.position.y, box.position.z);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

async function init() {
    camera.position.z = 10;
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
    await setBackground();
    // query db for journal info to render

    const journalsCount = 10;
    const journalTitles = ["untitled"] * 10;

    for (let i = 0; i < journalsCount; i++){
        let box = new JournalGraphic(journalTitles[i], 3, 3, 1);
        box.addToGrid(i);
        scene.add(box);
    }
    animate();
}

init();

// test functions below

// check whether point is visible from camera
function checkVisibility(x, y, z){
    camera.updateMatrix();
    camera.updateMatrixWorld();
    const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(matrix); 
    if (frustum.containsPoint(new THREE.Vector3(x, y, z))) {
        return 1;
    }
    return 0;
}

