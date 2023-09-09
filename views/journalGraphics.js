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
        this.height = h;
        this.length = l;
        this.cubeSize = 1;
        this.title = title;
        this.cubeActive = false;
    }
    addToGrid(index){
        let xBoundary = 4.0;
        let yTopBoundary = 4.0;
        let columns = 3;

        let row = Math.floor(index / columns);
        let column = index % columns;
        
        let xPos = (column * xBoundary) - xBoundary; // bounded to -4,0,4
        let yPos = yTopBoundary - row*yTopBoundary; // unbounded

        this.position.set(xPos, yPos, -0.5);
    }

    // not finished
    onResize(width, height, aspect) {
        this.cubeSize = (height * aspect) / 5;
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.1 : 1));
    }
    
    onMouseOver(e) {
        this.cubeActive = !this.cubeActive;
        this.material.forEach((txtrColor) => txtrColor.color.set(0xffd1ad));
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.1 : 1));
    }
    
    onMouseOut(e) {
        this.cubeActive = !this.cubeActive;
        this.material.forEach((txtrColor) => txtrColor.color.set(0xffffff));
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.1 : 1));
    }
    
    onMouseClick(e) {
        //this.cubeActive = !this.cubeActive;
        console.log("on mouse click");
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.1 : 1));
    }
}

// states
let journalsCount = 0;
let intersects = [];
let hovered = {}
//const username = document.getElementById("greeting").innerHTML.split(",")[0].split(" ").pop();
//let navbarHeight = document.getElementById("navbar").offsetHeight;

// graphics setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const light = new THREE.DirectionalLight( 0xffffff, 3 );
const controls = new OrbitControls(camera, renderer.domElement); // rotate with mousedown

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
document.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', onWindowResize);
document.addEventListener('click', onMouseClick);
//const addJournalButton = document.getElementById("add-journal");
//addJournalButton.addEventListener('click', onAddButtonClick);
//document.documentElement.style.setProperty('--nav-height', document.getElementById("navbar").offsetHeight);

async function setBackground(){
    new THREE.TextureLoader().load('https://assets.codepen.io/191583/airplane-hanger-env-map.jpg', tx => {
        scene.background = new THREE.PMREMGenerator(renderer).fromEquirectangular(tx).texture;
    });
}

function onAddButtonClick() {
    var journalGraphic = new JournalGraphic('untitled', 3, 3, 1);
    journalGraphic.addToGrid(journalsCount);
    scene.add(journalGraphic);
    // save it to db
}

function onMouseClick(e) {
    intersects.forEach((hit) => {
        hit.object.onMouseClick(hit);
    });
}

function onMouseMove(e) {
    // set x, y (accounting for navbar height) mouse position
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, (-(e.clientY / window.innerHeight) * 2 + 1) + 0.3);
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);

    Object.keys(hovered).forEach((key) => {
        const hit = intersects.find((hit) => hit.object.uuid === key);
        if (hit === undefined) {
            const hoveredItem = hovered[key];
            if (hoveredItem.object.onMouseOver) hoveredItem.object.onMouseOut(hoveredItem);
            delete hovered[key];
        }
    })

    intersects.forEach((hit) => {
        // if hit has not been flagged as hovered we must call onMouseOver
        if (!hovered[hit.object.uuid]) {
            hovered[hit.object.uuid] = hit;
            if (hit.object.onMouseOver) hit.object.onMouseOver(hit);
        }
        
        if (hit.object.onMouseMove) hit.object.onMouseMove(hit);
    })
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const target = new THREE.Vector3(0, 0, 0);
    const distance = camera.position.distanceTo(target);
    const fov = (camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fov / 2) * distance;
    const viewportWidth = viewportHeight * (window.innerWidth / window.innerHeight);
    // scene.traverse((obj) => {
    //     if (obj.onResize) obj.onResize(viewportWidth, viewportHeight, camera.aspect);
    // });
}

function animate() {
    render();
    requestAnimationFrame(animate);
}

function render() {
    scene.traverse((obj) => {
        if (obj.cubeActive) obj.rotation.y += 0.02;
    });
    raycaster.setFromCamera( mouse, camera );
    renderer.render( scene, camera );
}

async function init() {
    camera.position.z = 10;
    const ambientLight = new THREE.AmbientLight();
    light.position.set( 1, 1, 1 ).normalize();
    scene.add(light);
    scene.add(ambientLight);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // await setBackground();
    // query db for journal info to render
    
    journalsCount = 5;
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

