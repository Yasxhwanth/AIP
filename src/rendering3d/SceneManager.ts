import * as THREE from 'three';

export class SceneManager {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private container: HTMLElement;
    private animationId: number | null = null;
    private onFrame: ((time: number) => void) | null = null;

    constructor(container: HTMLElement) {
        this.container = container;

        // Initialize Scene
        this.scene = new THREE.Scene();
        
        // Add world map texture as background
        const loader = new THREE.TextureLoader();
        // Using a simple world map texture - in production, use a proper world map image
        // For now, create a procedural world map plane
        const worldMapGeometry = new THREE.PlaneGeometry(2000, 1200);
        const worldMapMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a3a52, // Ocean blue
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const worldMapPlane = new THREE.Mesh(worldMapGeometry, worldMapMaterial);
        worldMapPlane.rotation.x = Math.PI / 2;
        worldMapPlane.position.set(500, 300, -50);
        this.scene.add(worldMapPlane);
        
        // Add continent outlines using simple geometry
        this.addContinentOutlines();
        
        this.scene.background = new THREE.Color('#0A0B0D'); // Dark background

        // Initialize Camera
        // View 1000x600 plane. Center is 500, 300.
        // Camera at 500, 300, 800 to see the whole map comfortably.
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            5000
        );
        this.camera.position.set(500, 300, 800);
        this.camera.lookAt(500, 300, 0);

        // Initialize Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Add Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(200, 500, 400);
        this.scene.add(directionalLight);

        // Add Grid Helper (Visual Reference)
        // 1000x600 map. Let's make a grid slightly larger.
        const gridHelper = new THREE.GridHelper(2000, 40, 0x333333, 0x111111);
        gridHelper.rotation.x = Math.PI / 2; // Rotate to match 2D map plane (XY plane)
        gridHelper.position.set(500, 300, -10); // Slightly behind entities
        this.scene.add(gridHelper);

        // Handle Resize
        window.addEventListener('resize', this.handleResize);
    }

    private handleResize = () => {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    public start(onFrame: (time: number) => void) {
        this.onFrame = onFrame;
        if (!this.animationId) {
            this.animate();
        }
    }

    public stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate);

        const time = performance.now();
        if (this.onFrame) {
            this.onFrame(time);
        }

        this.renderer.render(this.scene, this.camera);
    };

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getCamera(): THREE.Camera {
        return this.camera;
    }

    public getRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }

    private addContinentOutlines() {
        // Simple continent representation using basic shapes
        // In production, use proper world map data or texture
        
        // North America (simplified)
        const naShape = new THREE.Shape();
        naShape.moveTo(100, 200);
        naShape.lineTo(300, 150);
        naShape.lineTo(350, 250);
        naShape.lineTo(200, 300);
        naShape.lineTo(100, 200);
        const naGeometry = new THREE.ShapeGeometry(naShape);
        const naMaterial = new THREE.MeshBasicMaterial({
            color: 0x2d5016,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
        const naMesh = new THREE.Mesh(naGeometry, naMaterial);
        naMesh.rotation.x = Math.PI / 2;
        naMesh.position.set(500, 300, -40);
        this.scene.add(naMesh);

        // Europe (simplified)
        const euShape = new THREE.Shape();
        euShape.moveTo(450, 150);
        euShape.lineTo(550, 120);
        euShape.lineTo(600, 200);
        euShape.lineTo(500, 250);
        euShape.lineTo(450, 150);
        const euGeometry = new THREE.ShapeGeometry(euShape);
        const euMaterial = new THREE.MeshBasicMaterial({
            color: 0x2d5016,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
        const euMesh = new THREE.Mesh(euGeometry, euMaterial);
        euMesh.rotation.x = Math.PI / 2;
        euMesh.position.set(500, 300, -40);
        this.scene.add(euMesh);

        // Asia (simplified)
        const asiaShape = new THREE.Shape();
        asiaShape.moveTo(600, 100);
        asiaShape.lineTo(850, 80);
        asiaShape.lineTo(900, 200);
        asiaShape.lineTo(700, 280);
        asiaShape.lineTo(600, 100);
        const asiaGeometry = new THREE.ShapeGeometry(asiaShape);
        const asiaMaterial = new THREE.MeshBasicMaterial({
            color: 0x2d5016,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
        const asiaMesh = new THREE.Mesh(asiaGeometry, asiaMaterial);
        asiaMesh.rotation.x = Math.PI / 2;
        asiaMesh.position.set(500, 300, -40);
        this.scene.add(asiaMesh);
    }

    public dispose() {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
        this.container.removeChild(this.renderer.domElement);
        this.renderer.dispose();
    }
}
