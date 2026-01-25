import React, { useEffect } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../../rendering3d/SceneManager';

interface GeoMapBaseLayerProps {
    sceneManager: SceneManager | null;
}

export const GeoMapBaseLayer: React.FC<GeoMapBaseLayerProps> = ({ sceneManager }) => {
    useEffect(() => {
        if (!sceneManager) return;

        const scene = sceneManager.getScene();
        const group = new THREE.Group();
        scene.add(group);

        // 1. Create Base Plane (The World)
        // Width = 360 * Scale (~1000)
        // Height = ~1000 (Mercator is roughly square for usable lat)
        const width = 1000;
        const height = 1000;

        const geometry = new THREE.PlaneGeometry(width, height, 64, 64);

        // Dark tech-style map material
        const material = new THREE.MeshBasicMaterial({
            color: 0x0f172a, // Slate 900
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; // Lay flat on X-Z plane
        group.add(plane);

        // 2. Grid Helper
        const gridHelper = new THREE.GridHelper(width, 20, 0x334155, 0x1e293b);
        // gridHelper is already flat on X-Z
        group.add(gridHelper);

        // 3. Equator Line
        const equatorGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-width / 2, 0.1, 0),
            new THREE.Vector3(width / 2, 0.1, 0)
        ]);
        const equatorMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
        const equator = new THREE.Line(equatorGeo, equatorMat);
        group.add(equator);

        // 4. Prime Meridian
        const meridianGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.1, -height / 2),
            new THREE.Vector3(0, 0.1, height / 2)
        ]);
        const meridianMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5 });
        const meridian = new THREE.Line(meridianGeo, meridianMat);
        group.add(meridian);

        return () => {
            scene.remove(group);
            geometry.dispose();
            material.dispose();
            equatorGeo.dispose();
            equatorMat.dispose();
            meridianGeo.dispose();
            meridianMat.dispose();
        };
    }, [sceneManager]);

    return null; // This component renders to the Three.js scene, not DOM
};
