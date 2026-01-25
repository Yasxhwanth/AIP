import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../../rendering3d/SceneManager';
import { RegionEntity } from '../../ontology/geo-types';
import { GeoProjectionEngine } from '../../engine/GeoProjectionEngine';

interface GeoRegionLayerProps {
    sceneManager: SceneManager | null;
    regions: RegionEntity[];
}

export const GeoRegionLayer: React.FC<GeoRegionLayerProps> = ({ sceneManager, regions }) => {
    const groupRef = useRef<THREE.Group | null>(null);

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

    // Update Regions
    useEffect(() => {
        if (!groupRef.current) return;

        const group = groupRef.current;
        group.clear(); // Re-draw all regions when list changes (optimization: diffing later)

        regions.forEach(region => {
            if (!region.boundary) return;

            // Handle GeoJSON Geometry
            const geometry = region.boundary;

            if (geometry.type === 'Polygon') {
                drawPolygon(group, geometry.coordinates as unknown as number[][][]);
            } else if (geometry.type === 'MultiPolygon') {
                (geometry.coordinates as unknown as number[][][][]).forEach(polygonCoords => {
                    drawPolygon(group, polygonCoords);
                });
            }
        });

    }, [regions]);

    const drawPolygon = (group: THREE.Group, coordinates: number[][][]) => {
        // GeoJSON Polygon: Array of rings. First is exterior, others are holes.
        // We'll just draw lines for now.

        coordinates.forEach(ring => {
            const points: THREE.Vector3[] = [];

            ring.forEach(([lng, lat]) => {
                const pos = GeoProjectionEngine.project(lat, lng, 0);
                // Lift slightly above base layer to avoid z-fighting
                pos.y = 0.2;
                points.push(pos);
            });

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xef4444, // Red-ish for boundaries
                transparent: true,
                opacity: 0.6
            });

            const line = new THREE.Line(geometry, material);
            group.add(line);
        });
    };

    return null;
};
