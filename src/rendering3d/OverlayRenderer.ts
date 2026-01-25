import * as THREE from 'three';
import { OverlayDescriptor, OverlayType } from '../visualization/OverlayTypes';
import { SceneManager } from './SceneManager';

export class OverlayRenderer {
    private sceneManager: SceneManager;
    private overlayGroup: THREE.Group;
    private meshes: Map<string, THREE.Mesh> = new Map();

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.overlayGroup = new THREE.Group();
        this.sceneManager.getScene().add(this.overlayGroup);
    }

    public update(overlays: OverlayDescriptor[], entityPositions: Map<string, THREE.Vector3>) {
        // 1. Mark all existing meshes as unused
        const unusedIds = new Set(this.meshes.keys());

        // 2. Create or Update meshes
        for (const overlay of overlays) {
            unusedIds.delete(overlay.id);

            if (overlay.geometry.type === 'entity_highlight' && overlay.geometry.entityId) {
                const position = entityPositions.get(overlay.geometry.entityId);
                if (position) {
                    this.renderEntityHighlight(overlay, position);
                }
            }
            // Add region handling here if needed
        }

        // 3. Remove unused meshes
        for (const id of unusedIds) {
            const mesh = this.meshes.get(id);
            if (mesh) {
                this.overlayGroup.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material instanceof THREE.Material) mesh.material.dispose();
                this.meshes.delete(id);
            }
        }
    }

    private renderEntityHighlight(overlay: OverlayDescriptor, position: THREE.Vector3) {
        let mesh = this.meshes.get(overlay.id);

        if (!mesh) {
            // Create new mesh
            const radius = overlay.geometry.radius || 10;
            const geometry = new THREE.RingGeometry(radius, radius + 2, 32);
            const material = new THREE.MeshBasicMaterial({
                color: overlay.style.strokeColor || '#FFFFFF',
                side: THREE.DoubleSide,
                transparent: true,
                opacity: overlay.style.fillOpacity || 0.5
            });

            mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2; // Lie flat
            mesh.position.y = 1; // Slightly above ground

            this.overlayGroup.add(mesh);
            this.meshes.set(overlay.id, mesh);
        }

        // Update position
        mesh.position.set(position.x, 1, position.z); // Assuming y is up, map is xz

        // Update style if needed (simplified for now)
        const material = mesh.material as THREE.MeshBasicMaterial;
        if (overlay.style.strokeColor) material.color.set(overlay.style.strokeColor);
    }

    public clear() {
        for (const mesh of this.meshes.values()) {
            this.overlayGroup.remove(mesh);
            mesh.geometry.dispose();
            if (mesh.material instanceof THREE.Material) mesh.material.dispose();
        }
        this.meshes.clear();
    }
}
