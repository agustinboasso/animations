import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//MODELOS GLTF

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')


const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null;

// ... (tu código existente)



gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene);
        const animations = gltf.animations;

        // Verificar si el modelo tiene animaciones
        if (animations && animations.length > 0) {
            // Crear un objeto para almacenar las opciones de animación
            const animationOptions = {};

            // Variable para almacenar las acciones de animación activas
            let activeActions = [];

            // Callback para detener todas las animaciones activas
            const stopAllAnimations = () => {
                for (const action of activeActions) {
                    action.stop();
                }
                activeActions = [];
            };

            // Iterar a través de todas las animaciones en el modelo
            for (let i = 0; i < animations.length; i++) {
                const animation = animations[i];

                // Agregar una opción para reproducir cada animación
                animationOptions[`playAnimation${i}`] = () => {
                    const action = mixer.clipAction(animation);
                    action.play();
                    activeActions.push(action);
                };
            }

            // Agregar una opción para detener todas las animaciones
            animationOptions.stopAllAnimations = () => {
                stopAllAnimations();
            };

            // Agregar controles al panel de dat.GUI
            const animationFolder = gui.addFolder('Animaciones');
            for (let i = 0; i < animations.length; i++) {
                animationFolder.add(animationOptions, `playAnimation${i}`).name(`Animación ${i}`);
            }
            animationFolder.add(animationOptions, 'stopAllAnimations').name('Detener animaciones');
        }

        gltf.scene.scale.set(0.025, 0.025, 0.025);
        scene.add(gltf.scene);
    },
    () => {
        console.log('progress');
    }
);





    // '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    // (gltf) =>{
    //     //console.log(gltf.scene)
    //     //scene.add(gltf.scene.children[0])

    //     //AGREGA TODO EL GRUPO A LA ESCENA
    //     scene.add(gltf.scene)


    //     //DUPLICAR EL ARRAY CON SPREAD OPERATOR

    //     // const children = [...gltf.scene.children]
    //     // //console.log(children)
    //     // for (const child of children){
    //     //     scene.add(child)
    //     // }



    // //se puede usar while para modelos mas complejos
    
    // //    while(gltf.scene.children.length){
    // //     scene.add(gltf.scene.children[0])
    // //    }
    // },
    // '/models/Duck/glTF-Embedded/Duck.gltf',
    // (gltf) =>{
    //     //console.log(gltf)
    //     scene.add(gltf.scene.children[0])
    // },
    // '/models/Duck/glTF-Binary/Duck.glb',
    // (gltf) =>{
    //     //console.log(gltf)
    //     scene.add(gltf.scene.children[0])
    // },
    // '/models/Duck/glTF/Duck.gltf',
    // (gltf) =>{
    //     //console.log(gltf)
    //     scene.add(gltf.scene.children[0])
    // },
    // () =>{
    //     console.log('progress')
    // },
    // () =>{
    //     console.error('error')
    // },
    

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //UPDATE MIXER ANIMATION
    if(mixer !== null){
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()