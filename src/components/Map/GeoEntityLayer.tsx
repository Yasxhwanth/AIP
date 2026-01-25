import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../../rendering3d/SceneManager';
import { Entity } from '../../ontology/types';
import { LocationEntity } from '../../ontology/geo-types';
import { GeoProjectionEngine } from '../../engine/GeoProjectionEngine';

interface GeoEntityLayerProps {
    sceneManager: SceneManager | null;
    entities: Entity[];
    locations: Map<string, LocationEntity>;
}

export const GeoEntityLayer: React.FC<GeoEntityLayerProps> = ({ sceneManager, entities, locations }) => {
    // Keep track of meshes to update them instead of recreating
    const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const groupRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        if (!sceneManager) return;

        const scene = sceneManager.getScene();
        const group = new THREE.Group();
        groupRef.current = group;
        scene.add(group);

        return () => {
            scene.remove(group);
            // Cleanup meshes
            meshesRef.current.forEach(mesh => {
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
            });
            meshesRef.current.clear();
        };
    }, [sceneManager]);

    // Update Loop
    useEffect(() => {
        if (!groupRef.current) return;

        const group = groupRef.current;
        const meshes = meshesRef.current;
        const unusedIds = new Set(meshes.keys());

        entities.forEach(entity => {
            const location = locations.get(entity.id);

            // Only render if we have a location
            if (location) {
                unusedIds.delete(entity.id);

                let mesh = meshes.get(entity.id);

                // Create if not exists
                if (!mesh) {
                    const geometry = new THREE.SphereGeometry(2, 16, 16); // Size 2 units
                    const material = new THREE.MeshBasicMaterial({ color: getEntityColor(entity.entity_type_id) });
                    mesh = new THREE.Mesh(geometry, material);

                    // Add UserData for raycasting
                    mesh.userData = { entityId: entity.id };

                    group.add(mesh);
                    meshes.set(entity.id, mesh);
                }

                // Update Position
                const pos = GeoProjectionEngine.project(
                    location.coordinates.latitude,
                    location.coordinates.longitude,
                    location.coordinates.altitude || 0
                );

                mesh.position.copy(pos);
            }
        });

        // Remove unused
        unusedIds.forEach(id => {
            const mesh = meshes.get(id);
            if (mesh) {
                group.remove(mesh);
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
                meshes.delete(id);
            }
        });

    }, [entities, locations]); // Re-run when data changes

    return null;
};

// Helper for colors
function getEntityColor(type: string): number {
    switch (type) {
        case 'Aircraft': return 0x3b82f6; // Blue
        case 'Vessel': return 0x10b981; // Green
        case 'Facility': return 0xf59e0b; // Orange
        default: return 0x94a3b8; // Gray
    }
}
