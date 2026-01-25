import * as THREE from 'three';

export class ModelRegistry {
    private static geometries: Record<string, THREE.BufferGeometry> = {
        'Transport': new THREE.BoxGeometry(20, 10, 10),
        'Logistics Hub': new THREE.CylinderGeometry(30, 30, 10, 32),
        'Critical Infrastructure': new THREE.ConeGeometry(20, 40, 32),
        'Route': new THREE.SphereGeometry(5, 16, 16), // Routes might be lines, but nodes are spheres
        'default': new THREE.BoxGeometry(10, 10, 10)
    };

    private static materials: Record<string, THREE.Material> = {
        'Operational': new THREE.MeshStandardMaterial({ color: 0x10B981 }), // Green
        'Degraded': new THREE.MeshStandardMaterial({ color: 0xF59E0B }), // Orange
        'Construction': new THREE.MeshStandardMaterial({ color: 0x3B82F6 }), // Blue
        'In Transit': new THREE.MeshStandardMaterial({ color: 0x8B5CF6 }), // Purple
        'Arrived': new THREE.MeshStandardMaterial({ color: 0x10B981 }), // Green
        'default': new THREE.MeshStandardMaterial({ color: 0x6B7280 }) // Gray
    };

    public static createMesh(type: string, status: string): THREE.Mesh {
        const geometry = this.geometries[type] || this.geometries['default'];
        const material = (this.materials[status] || this.materials['default']).clone(); // Clone to allow individual highlighting

        const mesh = new THREE.Mesh(geometry, material);

        // Orient correctly (Three.js Y is up, but our map is XY plane)
        // Actually, if we use XY as ground, Z is up.
        // But our MapView uses SVG coordinates where Y is down.
        // In 3D, let's keep X right, Y up (standard 2D graph), but SVG Y is down.
        // To match SVG:
        // X -> X
        // Y -> -Y (invert Y)
        // Z -> Altitude

        // However, SceneManager set camera to look at 500, 300, 0.
        // If we want 0,0 to be top-left (SVG style), we need to invert Y rendering or camera.
        // Let's stick to standard Cartesian for 3D: Y is Up.
        // But our data (0-600) assumes 0 is top (screen coords).
        // So y=600 is bottom.
        // In Cartesian, y=600 is high up.
        // We should probably invert Y when positioning: y = 600 - data.y

        return mesh;
    }

    public static updateMaterial(mesh: THREE.Mesh, status: string, isSelected: boolean) {
        const baseMaterial = this.materials[status] || this.materials['default'];
        const material = mesh.material as THREE.MeshStandardMaterial;

        material.color.copy((baseMaterial as THREE.MeshStandardMaterial).color);

        if (isSelected) {
            material.emissive.setHex(0xffffff);
            material.emissiveIntensity = 0.5;
        } else {
            material.emissive.setHex(0x000000);
            material.emissiveIntensity = 0;
        }
    }
}
