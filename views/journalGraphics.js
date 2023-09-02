import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
//import './styles/library.css';

class JournalGraphic extends THREE.Mesh{
    constructor(title){
        let width = 4;
        let length = 4;
        let height = 4;
        
        let geometry = new THREE.BoxGeometry(width,length,height);
        let loader = new THREE.TextureLoader();
        let book_textures = [
            new THREE.MeshBasicMaterial({ map: loader.load('./images/book/pagesflipped.jpeg')}), //right
            new THREE.MeshBasicMaterial({ map: loader.load('./images/book/left.jpeg')}), //left
            new THREE.MeshBasicMaterial({ map: loader.load('./images/book/pages.jpeg')}), //top
            new THREE.MeshBasicMaterial({ map: loader.load('./images/book/pages.jpeg')}), //bottom
            new THREE.MeshBasicMaterial({ map: loader.load('./images/book/front.jpeg')}), //front
            new THREE.MeshBasicMaterial({ map: loader.load('./images/book/back.jpeg')}), //back
        ];
        super(geometry, book_textures);
        this.title = title;    
        console.log("JournalGraphic created");
    }

    addToGrid(index){
        console.log("added to grid")
        let xBoundary = 2.0;
        let yTopBoundary = 4.0;
        let columns = 3;

        let row = Math.floor(index / columns);
        let column = index % columns;
        
        let xPos = (column * xBoundary) - xBoundary; // bounded to -2,0,2
        let yPos = yTopBoundary - row*yTopBoundary; // unbounded

        this.position.set(xPos, yPos, -0.5);
        console.log(this.position.x, this.position.y)
    }

    delete(){
        // prompt user to make sure

        // delete from db

        // delete from grid

        // call to update grid
    }

    onClick(e){
        // go to {id} notes

    }

    updateName(newJournalName){

    }

    onPointerOver(e){
        // increase size and start rotating, maybe give glow effect
    }

    onPointerOut(e){
        // return to regular size
    }

    resize() {

    }

}

// states
let width = 0;
let height = 0;
let intersects = [];
let hovered = {};
let journalsList = [];
let frustum = new THREE.Frustum();
const username = document.getElementById("greeting").innerHTML.split(",")[0].split(" ").pop();

// graphics setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 15;

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

// add button
const journalContainer = document.getElementById("app")
const addJournalButton = journalContainer.querySelector(".add-journal")
// addJournalButton.addEventListener('click', () => {
//     // get how many journals there are
//     var journalGraphic = new JournalGraphic();
//     journalGraphic.addToGrid(journalsList.length())
//     scene.add(journalGraphic)
//     journalsList.push(journalGraphic)
// });

let geometry = new THREE.BoxGeometry(4,4,1);
let loader = new THREE.TextureLoader();
let book_textures = [
    new THREE.MeshBasicMaterial({ map: loader.load("./images/book/pagesflipped.jpeg")}), //right
    new THREE.MeshBasicMaterial({ map: loader.load('./images/book/left.jpeg')}), //left
    new THREE.MeshBasicMaterial({ map: loader.load('./images/book/pages.jpeg')}), //top
    new THREE.MeshBasicMaterial({ map: loader.load('./images/book/pages.jpeg')}), //bottom
    new THREE.MeshBasicMaterial({ map: loader.load('./images/book/front.jpeg')}), //front
    new THREE.MeshBasicMaterial({ map: loader.load('./images/book/back.jpeg')}), //back
];
//const book_textures = new THREE.MeshBasicMaterial( { color: 0xffff00 } );

let book = new THREE.Mesh(geometry, book_textures);
if (checkVisibility(book.position.x, book.position.y, book.position.z)){
    console.log("points should be visible");
} else {
    console.log("points should NOT be visible");
}

scene.add(book);

function animate() {
    //console.log("goes to animate")
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // for (let i = 0; i < journalsList.length; i++) {
    //     journalsList[i].rotation.y += 0.05
    // }
}

// function init() {
//     console.log("init")
//     // get journals and place in grid
    
//     for (let i = 0; i < 5; i++){
//         //let journalGraphic = new JournalGraphic(userJournals[i].title);
//         let journalGraphic = new JournalGraphic("title");
//         //journalGraphic.addToGrid(i);
//         scene.add(journalGraphic);
//         //console.log(journalGraphic.position.x,journalGraphic.position.y)
//         journalsList.push(journalGraphic);
//     }

//     // let journalGraphic = new JournalGraphic("title");
//     // scene.add(journalGraphic);

//     // query for library id in usersdb

//     // query for length of books in library

//     // need length and titles of each

//     // based on length, fill grid

//     // based on title, if on click go to other page, render all sections and pages of journal

//     // fill grid

//     // run animation
    
// }

// run
// init();
animate();

// const deleteButton = document.createElement('button');
// deleteButton.innerText = 'Delete';
// deleteButton.style.position = 'absolute';
// deleteButton.style.left = `${(journal_mesh.position.x + 1) * 50}%`;
// deleteButton.style.top = `${(journal_mesh.position.y + 1) * 50}%`;

// deleteButton.addEventListener('click', () => {
//     scene.remove(journal_mesh);
//     scene.remove(deleteButton);
//     const index = journal.indexOf(journalMesh);
//     if (index !== -1) {
//         journal.splice(index, 1);
//     }
// });
// document.body.appendChild(deleteButton);
// journal_mesh.userData.deleteButton = deleteButton;


// function onMouseMove(event) {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
// }

// function onClick(event) {
//     raycaster.setFromCamera(mouse, camera);
//     const intersects = raycaster.intersectObjects(journal);

//     if (intersects.length > 0) {
//     const clickedObject = intersects[0].object;
//     if (clickedObject.userData.isjournal) {
//         scene.remove(clickedObject);
//         const index = journal.indexOf(clickedObject);
//         if (index !== -1) {
//         journal.splice(index, 1);
//         }
//     }
//     }
// }
// window.addEventListener('mousemove', onMouseMove, false)
// window.addEventListener('click', onClick, false)
// function animate() {
//     requestAnimationFrame(animate)
//     renderer.render(scene, camera)
//     // for (let i = 0; i < journals.length; i++) {
//     //     journals[i].rotation.y += 0.05
//     // }
    
//     // var username2 = '<%- JSON.stringify(username) %>'
//     // console.log(username2)
// }

// function getUserInfo() {

//     // get username
//     var username = $('#userdata').data();


//     // get num of journals

//     return {numOfJournals, username}
// }

// function resize() {
//     width = window.innerWidth
//     height = window.innerHeight
//     camera.aspect = width / height
//     const target = new THREE.Vector3(0, 0, 0)
//     const distance = camera.position.distanceTo(target)
//     const fov = (camera.fov * Math.PI) / 180
//     const viewportHeight = 2 * Math.tan(fov / 2) * distance
//     const viewportWidth = viewportHeight * (width / height)
//     camera.updateProjectionMatrix()
//     renderer.setSize(width, height)
//     scene.traverse((obj) => {
//         if (obj.onResize) obj.onResize(viewportWidth, viewportHeight, camera.aspect)
//     })
// }