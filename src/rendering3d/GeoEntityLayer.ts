import * as THREE from 'three';
import { Entity } from '../ontology/types';
import { LocationEntity } from '../ontology/geo-types';
import { SceneManager } from './SceneManager';

export class GeoEntityLayer {
    private sceneManager: SceneManager;
    private group: THREE.Group;
    private meshes: Map<string, THREE.Mesh> = new Map();
    private EARTH_RADIUS = 100; // Units

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.group = new THREE.Group();
        this.sceneManager.getScene().add(this.group);
    }

    public update(entities: Entity[], locations: Map<string, LocationEntity>) {
        const unusedIds = new Set(this.meshes.keys());

        for (const entity of entities) {
            // Find location for this entity
            // In a real system, we'd query the relationship. 
            // Here we assume 'locations' map is passed pre-resolved or we resolve it.
            // For this layer, we expect the caller to provide the resolved location.

            // If the entity IS a location, render it directly? 
            // Or if the entity is LOCATED_AT a location.

            let location: LocationEntity | undefined;

            // Case 1: Entity IS a Location
            if ((entity as any).coordinates) {
                location = entity as unknown as LocationEntity;
            }
            // Case 2: Entity is located at a location (handled by caller passing map)
            else {
                // This requires the caller to map EntityID -> LocationEntity
                // We'll assume the 'locations' map provides this.
                location = locations.get(entity.id);
            }

            if (location) {
                unusedIds.delete(entity.id);
                this.renderEntity(entity, location);
            }
        }

        // Remove unused
        for (const id of unusedIds) {
            const mesh = this.meshes.get(id);
            if (mesh) {
                this.group.remove(mesh);
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
                this.meshes.delete(id);
            }
        }
    }

    private renderEntity(entity: Entity, location: LocationEntity) {
        let mesh = this.meshes.get(entity.id);
        const pos = this.latLonToVector3(location.coordinates.latitude, location.coordinates.longitude, this.EARTH_RADIUS);

        if (!mesh) {
            const geometry = new THREE.SphereGeometry(1, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
            mesh = new THREE.Mesh(geometry, material);
            this.group.add(mesh);
            this.meshes.set(entity.id, mesh);
        }

        mesh.position.copy(pos);
        mesh.lookAt(0, 0, 0); // Orient towards center (or away?)
    }

    private latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));

        return new THREE.Vector3(x, y, z);
    }

    public clear() {
        this.group.clear();
        this.meshes.clear();
    }
}
