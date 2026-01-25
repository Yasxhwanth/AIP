import * as THREE from 'three';
import { RegionEntity } from '../ontology/geo-types';
import { SceneManager } from './SceneManager';

export class GeoBoundaryLayer {
    private sceneManager: SceneManager;
    private group: THREE.Group;
    private meshes: Map<string, THREE.Line> = new Map();
    private EARTH_RADIUS = 100.5; // Slightly larger than Earth to avoid z-fighting

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.group = new THREE.Group();
        this.sceneManager.getScene().add(this.group);
    }

    public update(regions: RegionEntity[]) {
        const unusedIds = new Set(this.meshes.keys());

        for (const region of regions) {
            unusedIds.delete(region.id);
            this.renderRegion(region);
        }

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

    private renderRegion(region: RegionEntity) {
        if (this.meshes.has(region.id)) return; // Static for now

        if (region.boundary && region.boundary.type === 'Polygon') {
            const points: THREE.Vector3[] = [];
            // GeoJSON Polygon: array of rings. First ring is exterior.
            const ring = region.boundary.coordinates[0];

            for (const [lon, lat] of ring) {
                points.push(this.latLonToVector3(lat, lon, this.EARTH_RADIUS));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0xffaa00 });
            const line = new THREE.Line(geometry, material);

            this.group.add(line);
            this.meshes.set(region.id, line);
        }
    }

    private latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));

        return new THREE.Vector3(x, y, z);
    }
}
