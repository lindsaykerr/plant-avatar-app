import * as dat from 'lil-gui'
import * as THREE from 'three';

import { postToSerivceWorker } from '../main.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {CameraRig} from './scene/camera.js';
import { DirectionalLightRig } from './scene/lights/directional.js';
import {AVATARSTATES, hasStateChanged, getCurrentState, setCurrentState} from './avatar_api.js';


// object that will hold the avatar actions
// these will assigned to the avatarActions object once the animations have been loaded
(async () => {
const avatarActions = {
    "idle": null,
    "very_angry": null,
    "very_happy": null,
    "very_depressed": null,
    "idle_angry": null,
    "idle_happy": null,
    "idle_depressed" : null,
};

// references the last clip group that was played
let oldClipGroup = null;

// flag that will be set to true once the avatar actions have been loaded
let actionAvailable = false; 

/*
// function that plays a group of clips
function playClipGroup(clipGroup){
                    

    if (oldClipGroup){
        oldClipGroup.forEach((clip) => {
            clip.;
        });
    }
    clipGroup.forEach((clip) => {
        
        clip.play();
    });
    oldClipGroup = clipGroup;
}
*/

// function that plays a group of clips
async function playClipGroup(clipGroup){
                    
 
    if (oldClipGroup){
        oldClipGroup.forEach((clip) => {
            clip.fadeOut(1).stop();
        });
    }
    clipGroup.forEach((clip) => {
        
        clip.fadeIn(1).play();
    });
    oldClipGroup = clipGroup;

}
/*
async function fadeout(oldClipGroup, clipGroup){
    oldClipGroup[0].crossFadeTo(clipGroup[0], 1, false).play();
    oldClipGroup[1].crossFadeTo(clipGroup[1], 1, false).play();
}

async function playClipGroup(clipGroup){
    if(oldClipGroup){
        await fadeout(oldClipGroup, clipGroup);    
        oldClipGroup.forEach((clip) => {
            clip.stop();
        }
        );
    }
    else{
        clipGroup[0].play();
        clipGroup[1].play();
    }
    oldClipGroup = clipGroup;
}
    */


// function that will animate the avatar based on the current state
async function animateAvatar() {

    if (hasStateChanged()) {

        switch (getCurrentState()) {
            case AVATARSTATES.happy:
                avatarActions["very_happy"]();
                break;
            case AVATARSTATES.unhappy:
                avatarActions["very_angry"]();
                break;
            case AVATARSTATES.angry:
                avatarActions["very_angry"]();
                break;
            case AVATARSTATES.idle:
                avatarActions["idle"]();
                break;
            case AVATARSTATES.depressed:
                avatarActions["very_depressed"]();
                break;
            case AVATARSTATES.happy_v2:
                avatarActions["idle_happy"]();
                break;
            case AVATARSTATES.angry_v2:
                avatarActions["idle_angry"]();
                break;
            case AVATARSTATES.depressed_v2:
                avatarActions["idle_depressed"]();
                break;
            default:
                break;
        }
    }
}


    


    const popup = document.getElementById("self-report");
    popup.style.opacity = 0;
    console.log(popup);
/*
    setTimeout(() => {
        popup.classList.remove("hide");
        popup.animate([
            {opacity: 0},
            {opacity: 1}
        ], {
            duration: 500,
            fill: 'forwards',
            easing: 'ease-in-out'
        });
    }, 10000);

*/
const gui = new dat.GUI({
    width: 300,
    title: 'Avatar Debug Menu',

});

gui.hide();




    const hiddenDebugMenuToggle = document.getElementById('hidden-menu');
    hiddenDebugMenuToggle.addEventListener('click', function() {
        console.log("clicked");
        gui.show(gui._hidden);
    });

    
    let sceneChange = true;

    // Setup scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, window.innerWidth/ window.innerHeight, 0.1, 1000);

    
    const renderer = new THREE.WebGLRenderer({antialias: true});
  
    const view = document.getElementById('view3D');
    view.appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.setPixelRatio(window.devicePixelRatio);
    let clock = new THREE.Clock();


    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width  = Math.floor( canvas.clientWidth  * pixelRatio );
        const height = Math.floor( canvas.clientHeight * pixelRatio );
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const protoOptions = gui.addFolder('Prototype Options');
        /*
        protoOptions.add({show: false}, 'show').name('Show Avatar').onChange((value) => {
        }); */

    protoOptions.add({scenario: 'needs water'}, 'scenario', ['needs water', 'ideal']).name('Scenario').onChange((value) => {
        //prototypeControler.scenario(value);    
    });
    protoOptions.add({allow: false}, 'allow').name('Allow Notifications').onChange((value) => {
        if (value) {
            if ("Notification" in window) {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        new Notification(
                            "Granted", {
                                body: "You will be notified",
                            });
                    }
                });
            }
            postToSerivceWorker({type: 'allow-notifications', payload: true});
        } 
    });



 
    // Add some environmental lighting
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const environmentMap = cubeTextureLoader.load([
        '/envmap/px.png',
        '/envmap/nx.png',
        '/envmap/py.png',
        '/envmap/ny.png',
        '/envmap/pz.png',
        '/envmap/nz.png',
    ]);

    scene.background = environmentMap;
    scene.backgroundBlurriness = 0.3;
    scene.environment = environmentMap;
    scene.environmentIntensity = 1.5;

    // mimic a light source
    const dirlightrig = new DirectionalLightRig(scene, new THREE.DirectionalLight(0xfffffff, 1.8), sceneChange);
    dirlightrig.setLightPosition(-2, 5, 5);
    dirlightrig.setLightTarget(0, 3, 0);
    dirlightrig.helperOff();
    

    
    // set camera position
    const cameraRig = new CameraRig(scene, camera, sceneChange);
    cameraRig.setCameraPosition(1, 3, 8);
    cameraRig.setFocus(0, 2.3, 0);
    cameraRig.setHelperSize(0.5);
    cameraRig.helperOff();

    // TODO: ADD LOADING MANAGER

    let mixerAnimation; // holds a function that will be used during the animation loop

    // Load 3D model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        'avatar/plant_character_animate02.glb', 
        (gltf) => {
            scene.add(gltf.scene);
            console.log("imported scene:",gltf);
   
       
            //gltf.scene.visible = false;
            gltf.scene.position.set(0, 0, 0); 

     
             
            if (gltf.animations && gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                const clips = gltf.animations;
     
                const happy_leafs = THREE.AnimationClip.findByName( clips, 'happy_leaf' );
                const unhappy_leafs = THREE.AnimationClip.findByName( clips, 'unhappy_leaf' );
        
                const veryAngryClip = THREE.AnimationClip.findByName( clips, 'angry' );
                const veryIdleClip = THREE.AnimationClip.findByName( clips, 'idle' );
                const veryHappyClip = THREE.AnimationClip.findByName( clips, 'happy' );
                const veryDepressedClip = THREE.AnimationClip.findByName( clips, 'depressed' );
                const standin_happy = THREE.AnimationClip.findByName( clips, 'happy_v2' );
                const standin_angry = THREE.AnimationClip.findByName( clips, 'angry_v2' );
                const standin_depressed = THREE.AnimationClip.findByName( clips, 'depressed_v2' );
               

                const avatar = {
                    "idle":[mixer.clipAction(happy_leafs), mixer.clipAction(veryIdleClip)],
                    "very_angry": [mixer.clipAction(unhappy_leafs), mixer.clipAction(veryAngryClip)],
                    "very_happy": [mixer.clipAction(happy_leafs), mixer.clipAction(veryHappyClip)],
                    "very_depressed": [mixer.clipAction(unhappy_leafs), mixer.clipAction(veryDepressedClip)],
                    "idle_angry": [mixer.clipAction(unhappy_leafs), mixer.clipAction(standin_angry)],
                    "idle_happy": [mixer.clipAction(happy_leafs), mixer.clipAction(standin_happy)],
                    "idle_depressed": [mixer.clipAction(unhappy_leafs), mixer.clipAction(standin_depressed)],
               
                };

           

                avatarActions["idle"] = () => playClipGroup(avatar["idle"]);
                avatarActions["very_happy"] = () => playClipGroup(avatar["very_happy"]);
                avatarActions["very_angry"] = () => playClipGroup(avatar["very_angry"]);
                avatarActions["very_depressed"] = () => playClipGroup(avatar["very_depressed"]);
                avatarActions["idle_angry"] = () => playClipGroup(avatar["idle_angry"]);
                avatarActions["idle_happy"] = () => playClipGroup(avatar["idle_happy"]);
                avatarActions["idle_depressed"] = () => playClipGroup(avatar["idle_depressed"]);
                actionAvailable = true;

                //setCurrentState(AVATARSTATES.idle);
                
                

               
   

                mixerAnimation = () => {
                    mixer.update(clock.getDelta());
                 
                };
            
            } else {
                // Render the scene if there are no animations.
    
            }

        }, 
        (loading) => {

        }, 
        (error) => {
            console.log(error);
        });

        // Add GUI controls
        const guiAvatarActions = gui.addFolder('Avatar Actions');
        const guiAvatarStates = {
            happy: () => setCurrentState(AVATARSTATES.happy),
            angry: () => setCurrentState(AVATARSTATES.angry),
            idle: () => setCurrentState(AVATARSTATES.idle),
            depressed: () => setCurrentState(AVATARSTATES.depressed),
            happy_v2: () => setCurrentState(AVATARSTATES.happy_v2),
            angry_v2: () => setCurrentState(AVATARSTATES.angry_v2),
            depressed_v2: () => setCurrentState(AVATARSTATES.depressed_v2)
        }

        guiAvatarActions.add(guiAvatarStates, 'happy').name('Happy');
        guiAvatarActions.add(guiAvatarStates, 'angry').name('Angry');
        guiAvatarActions.add(guiAvatarStates, 'idle').name('Idle');
        guiAvatarActions.add(guiAvatarStates, 'depressed').name('Depressed');
        guiAvatarActions.add(guiAvatarStates, 'happy_v2').name('Happy V2');
        guiAvatarActions.add(guiAvatarStates, 'angry_v2').name('Angry V2');
        guiAvatarActions.add(guiAvatarStates, 'depressed_v2').name('Depressed V2');



    // Animation loop
    async  function animate() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
     
        if (sceneChange) {     
            cameraRig.updateCamera();
            dirlightrig.update();
            sceneChange = false;
        }
        if (mixerAnimation) {
            mixerAnimation();
        }
        if (actionAvailable) {
            animateAvatar();
           
        }

   
        
    }

})();