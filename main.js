import * as THREE from 'three';
import vs from './shaders/vs.glsl'
import fs from './shaders/fs.glsl'
import atmosphere_vs from './shaders/atmosphere_vs.glsl'
import atmosphere_fs from './shaders/atmosphere_fs.glsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias: true})
const controls = new OrbitControls(camera, renderer.domElement); // rotate with mousedown

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

// shaders

// globe
const globe_texture = new THREE.TextureLoader().load('./images/earth_surface_map.jpg')
const globe_shader_material = new THREE.ShaderMaterial({
    vertexShader: vs, 
    fragmentShader: fs,
    uniforms: {
        globeTexture: {
            value: globe_texture
        }
    }
})
// glow effect
const atmosphere_shader_material = new THREE.ShaderMaterial({
    vertexShader: atmosphere_vs,
    fragmentShader: atmosphere_fs,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
});

// sphere geometries
const sphere_geometry = new THREE.SphereGeometry(5, 50, 50)
const globe = new THREE.Mesh(sphere_geometry, globe_shader_material)
const atmosphere = new THREE.Mesh(sphere_geometry, atmosphere_shader_material);
atmosphere.scale.set(1.1, 1.1, 1.1);

camera.position.z = 15

scene.add(atmosphere)
const group = new THREE.Group()
group.add(globe)

// stars in background
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({color: 0xffffff})
const starVertices = []
for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starVertices.push(x, y, z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
const stars = new THREE.Points(starGeometry, starMaterial)

scene.add(group)
scene.add(stars)

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    globe.rotation.y += 0.001 // constant rotation
}

animate()
