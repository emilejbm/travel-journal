import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

class JournalGraphic extends THREE.Mesh{
    constructor(title, id, w, h, l){
        let geometry = new THREE.BoxGeometry(w, h, l);
        let textureLoader = new THREE.TextureLoader();
        textureLoader.setPath('/views/images/book/');
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
        this.tintRGB = "0x";
        for (let i = 0; i < 3; i++){
            if (title[i]){
                this.tintRGB = this.tintRGB + title[i].charCodeAt(0).toString(16);
            }
        }
        this.material.forEach((txtr) => {
            txtr.color.set(parseInt(this.tintRGB));
            txtr.color.addScalar(0.1);
        });
        this.width = w;
        this.height = h;
        this.length = l;
        this.cubeSize = 1;
        this.title = title;
        this.db_id = id;
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
        this.material.forEach((txtr) => txtr.color.addScalar(-0.1));
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.1 : 1));
    }
    
    onMouseOut(e) {
        this.cubeActive = !this.cubeActive;
        this.material.forEach((txtr) => {
            txtr.color.set(parseInt(this.tintRGB));
            txtr.color.addScalar(0.1);
        });
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.1 : 1));
    }
    
    onMouseClick(e) {
        //this.cubeActive = !this.cubeActive;
        console.log("on mouse click");
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.1 : 1));
        location.href = "journals/" + this.db_id;
    }
}

// states
let intersects = [];
let hovered = {};
let w = 3, h = 3, l = 1;
let y = 0;
let camera_pos = 0;
const username = window.location.pathname.split("/")[1];
const journalInfoList = []; // [(journalName, journalID)] elements separated by ;;;
// delim chosen arbitrarily to separate name and id with characters that are not likely to be in name

// graphics setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const light = new THREE.DirectionalLight( 0xffffff, 3 );
//const controls = new OrbitControls(camera, renderer.domElement); // rotate with mousedown

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
document.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', onWindowResize);
document.addEventListener('click', onMouseClick);
window.addEventListener('wheel', onMouseWheel);
const addJournalButton = document.getElementById("add-journal-btn");
const journalInfo = document.getElementById('journal-table');
let journalData = journalInfo.getElementsByTagName("td");

addJournalButton.addEventListener('click', onAddButtonClick);

//document.documentElement.style.setProperty('--nav-height', document.getElementById("navbar").offsetHeight);

async function setBackground(){
    new THREE.TextureLoader().load('https://assets.codepen.io/191583/airplane-hanger-env-map.jpg', tx => {
        scene.background = new THREE.PMREMGenerator(renderer).fromEquirectangular(tx).texture;
    });
}

function onMouseWheel(e){
    y = e.deltaY * 0.01;
}

// sends post request to make a journal in users library
// as of now, titles do not have to be unique
async function onAddButtonClick() {
    var journalTitle = prompt('Enter a title for the journal');

    function validateTitle(journalTitle) {
        // do i care about unique titles?
        // might want to check for special characters and count, db injection?
        return true;
    }

    while (validateTitle(journalTitle) != true) {
        journalTitle = prompt('Enter a title for the Journal');
    }

    try {
        fetch(window.location.href, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "username": username, "title": journalTitle, "notes": [] }),
            keepalive: true
        }).then(location.reload(true));
    } catch (err) {
        console.log("Error creating journal");
    }
}

function onMouseClick(e) {
    intersects.forEach((hit) => {
        hit.object.onMouseClick(hit);
    });
}

function onMouseMove(e) {
    // set x, y (accounting for navbar height) mouse position
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, (-(e.clientY / window.innerHeight) * 2 + 1) + 0.2);
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
}

function animate() {
    camera_pos += y;
    y *= 0.9;
    camera.position.y = -camera_pos;
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
    
    for(var i=0;i<journalData.length;i++) {
        journalInfoList.push(journalData[i].innerHTML);
        let j_title = journalInfoList[i].split(";;;")[0];
        let j_id = journalInfoList[i].split(";;;")[1];
        console.log(j_title, j_id);
        let box = new JournalGraphic(j_title, j_id, w, h, l);
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

