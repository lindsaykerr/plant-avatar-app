import * as THREE from 'three';

/**
 * Creates a directional lighting rig to aid setting up lighting in the scene.
 * 
 * @param {THREE.Scene} scene
 * @param {THREE.DirectionalLight} DirectionalLight
 * @param {boolean} sceneChange
 */

export class DirectionalLightRig {
    
    constructor(scene, DirectionalLight, sceneChange) {


        this.DirectionalLight = DirectionalLight;
        this.lightHelper = new THREE.DirectionalLightHelper(this.DirectionalLight, 3, 0x000000);
        scene.add(this.lightHelper);
        this.DirectionalLight.lookAt(0, 3, 0);
        this.DirectionalLight.position.set(-5, 5, 5);
        this.lightHelper.update();
        scene.add(this.DirectionalLight);
        this.DirectionalLight.updateMatrixWorld();
        this.sceneChange = sceneChange;
    }

    setLightPosition(x, y, z){
        this.sceneChange = true;
        this.DirectionalLight.position.set(x, y, z);
    }
    setLightTarget(x, y, z){
        this.sceneChange = true;
        this.DirectionalLight.lookAt(x, y, z);
    }
    setLightIntensity(intensity){
        this.sceneChange = true;
        this.DirectionalLight.intensity = intensity;
    }
    setLightColor(color){
        this.sceneChange = true;
        this.DirectionalLight.color = color;
    }
    setLightHelperSize(size){
        this.sceneChange = true;
        this.lightHelper.scale.set(size, size, size);
    }
    helperOff(){
        
        this.lightHelper.visible = false;
    }
    helperOn(){
        this.lightHelper.visible = true;
    }
    update(){
        
        this.DirectionalLight.updateMatrixWorld();
        this.lightHelper.update();
    }
    getLight(){
        return this.DirectionalLight;
    }
}