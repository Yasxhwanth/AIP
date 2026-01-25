import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
    private controls: OrbitControls;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.controls = new OrbitControls(camera, domElement);

        // Configure Controls
    }

    public update() {
        this.controls.update();
    }

    public dispose() {
        this.controls.dispose();
    }
}
