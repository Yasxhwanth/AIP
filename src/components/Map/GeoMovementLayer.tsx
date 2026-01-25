import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../../rendering3d/SceneManager';
import { Entity } from '../../ontology/types';
import { MovementPathResolver, GeoPoint } from '../../ontology/MovementPathResolver';
import { GeoProjectionEngine } from '../../engine/GeoProjectionEngine';
import { TenantContextManager } from '../../tenant/TenantContext';

interface GeoMovementLayerProps {
    sceneManager: SceneManager | null;
    entities: Entity[];
    asOf: Date;
    showMovement: boolean;
}

export const GeoMovementLayer: React.FC<GeoMovementLayerProps> = ({ sceneManager, entities, asOf, showMovement }) => {
    const groupRef = useRef<THREE.Group | null>(null);
    const tenantId = TenantContextManager.getContext().tenantId;

    useEffect(() => {
        if (!sceneManager) return;

        const scene = sceneManager.getScene();
        const group = new THREE.Group();
        groupRef.current = group;
        scene.add(group);

        return () => {
            scene.remove(group);
        };
    }, [sceneManager]);

    useEffect(() => {
        if (!groupRef.current) return;
        const group = groupRef.current;
        group.clear();

        if (!showMovement) return;

        entities.forEach(entity => {
            // Resolve Path
            const path = MovementPathResolver.resolvePath(entity.id, asOf, 24, tenantId);

            if (path.length < 2) return;

            // Convert to Vector3
            const points = path.map(p => GeoProjectionEngine.project(p.lat, p.lng, p.alt));

            // Create Geometry
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            // Material (Fade out? For now just a line)
            // To do fade out, we need custom shader or vertex colors.
            // Let's use simple line for now.
            const material = new THREE.LineBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.5
            });

            const line = new THREE.Line(geometry, material);
            group.add(line);
        });

    }, [entities, asOf, showMovement, tenantId]);

    return null;
};
