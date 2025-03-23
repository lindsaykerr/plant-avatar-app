import * as THREE from 'three';

/**
 * Provides a camera rig object for the scene, which helps with camera positioning and orientation.
 * 
 * @param {THREE.Scene} scene
 * @param {THREE.camera} camera
 * @param {boolean} sceneChange
 * @returns {Object} cameraRig
 */

export class CameraRig {

    constructor(scene, camera, sceneChange) {

        this.camera = camera;
        this.sceneChange = sceneChange;
        this.cameraFocus = new THREE.Vector3(0, 2, 0);
        this.axesHelper = new THREE.AxesHelper(5);
        this.axesHelper.position.set(this.cameraFocus.x, this.cameraFocus.y, this.cameraFocus.z);
        scene.add(this.axesHelper);
    }

    updateCamera() {

        this.camera.lookAt(this.cameraFocus);
        this.camera.updateMatrix();
    }
    setCameraPosition(x, y, z){
        this.sceneChange = true;
        this.camera.position.set(x, y, z);
    }
    setFocus(x, y, z){
        this.sceneChange = true;
        this.cameraFocus.set(x, y, z);
    }
    setHelperSize(size){
        this.axesHelper.scale.set(size, size, size);
    }
    helperOff(){
        this.axesHelper.visible = false;
    }
    helperOn(){
        this.axesHelper.visible = true;
    }
    
}