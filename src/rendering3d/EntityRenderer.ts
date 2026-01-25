import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { ModelRegistry } from './ModelRegistry';

export class EntityRenderer {
    private scene: THREE.Scene;
    private meshes: Map<string, THREE.Mesh> = new Map();

    constructor(sceneManager: SceneManager) {
        this.scene = sceneManager.getScene();
    }

    public update(
        entities: { entityId: string; type: string; status: string; x: number; y: number }[],
        selectedEntityId: string | null
    ) {
        const currentIds = new Set<string>();

        entities.forEach(entity => {
            currentIds.add(entity.entityId);

            let mesh = this.meshes.get(entity.entityId);

            if (!mesh) {
                // Create new mesh
                mesh = ModelRegistry.createMesh(entity.type, entity.status);
                mesh.userData = { entityId: entity.entityId }; // For raycasting
                this.scene.add(mesh);
                this.meshes.set(entity.entityId, mesh);
            }

            // Update Position
            // Invert Y to match SVG coordinate system (0 is top)
            // Map Height is 600.
            // 3D Y = 600 - Data Y
            mesh.position.set(entity.x, 600 - entity.y, 0);

            // Update Status/Selection
            ModelRegistry.updateMaterial(mesh, entity.status, entity.entityId === selectedEntityId);
        });

        // Remove stale meshes
        for (const [id, mesh] of this.meshes) {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => m.dispose());
                } else {
                    mesh.material.dispose();
                }
                this.meshes.delete(id);
            }
        }
    }

    public getMesh(entityId: string): THREE.Mesh | undefined {
        return this.meshes.get(entityId);
    }

    // -------------------------------------------------------------------------
    // PROJECTION LAYER
    // -------------------------------------------------------------------------
    private projectionLines: THREE.Line[] = [];

    public updateProjections(paths: { points: { x: number; y: number; t: Date }[] }[]) {
        this.clearProjections();

        paths.forEach(path => {
            if (path.points.length < 2) return;

            const points = path.points.map(p => new THREE.Vector3(p.x, 600 - p.y, 0));
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            const material = new THREE.LineDashedMaterial({
                color: 0x00FFFF, // Cyan for future
                linewidth: 1,
                scale: 1,
                dashSize: 10,
                gapSize: 5,
                opacity: 0.35,
                transparent: true
            });

            const line = new THREE.Line(geometry, material);
            line.computeLineDistances(); // Required for dashed lines

            this.scene.add(line);
            this.projectionLines.push(line);
        });
    }

    public clearProjections() {
        this.projectionLines.forEach(line => {
            this.scene.remove(line);
            line.geometry.dispose();
            if (Array.isArray(line.material)) {
                line.material.forEach(m => m.dispose());
            } else {
                line.material.dispose();
            }
        });
        this.projectionLines = [];
    }
}
