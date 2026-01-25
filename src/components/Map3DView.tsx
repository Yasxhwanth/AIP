import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../rendering3d/SceneManager';
import { CameraController } from '../rendering3d/CameraController';
import { EntityRenderer } from '../rendering3d/EntityRenderer';
import { OverlayRenderer } from '../rendering3d/OverlayRenderer';
import { useOntologyQuery } from '../adapters/query/useOntologyQuery';
import { usePlayback } from '../state/playback/PlaybackContext';
import { useEntities } from '../state/entities/useEntities';
import { MovementEngine } from '../ontology/MovementEngine';
import { useProjection } from '../context/ProjectionContext';
import { ProjectionEngine } from '../ontology/ProjectionEngine';
import ViewControls from './ViewControls';
import { OverlayControlPanel } from './Map/OverlayControlPanel';
import { OverlayType } from '../visualization/OverlayTypes';
import { overlayResolver } from '../visualization/OverlayResolver';

const Map3DView: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);
    const entityRendererRef = useRef<EntityRenderer | null>(null);
    const overlayRendererRef = useRef<OverlayRenderer | null>(null);
    const cameraControllerRef = useRef<CameraController | null>(null);

    // Overlay State
    const [activeOverlays, setActiveOverlays] = useState<OverlayType[]>([]);

    // Access Data (Refs to avoid stale closures in loop)
    const { entities, getSpatialSnapshots } = useOntologyQuery();
    const { renderTime } = usePlayback();
    const { selectEntity, selectedEntityId } = useEntities();
    const { enabled, horizonMinutes } = useProjection();

    // Refs for loop access
    const dataRef = useRef({
        entities,
        getSpatialSnapshots,
        renderTime,
        selectedEntityId,
        activeOverlays
    });

    const projectionRef = useRef({
        enabled,
        horizonMinutes
    });

    // Update refs when React state changes
    useEffect(() => {
        dataRef.current = { entities, getSpatialSnapshots, renderTime, selectedEntityId, activeOverlays };
        projectionRef.current = { enabled, horizonMinutes };
    }, [entities, getSpatialSnapshots, renderTime, selectedEntityId, enabled, horizonMinutes, activeOverlays]);

    // Initialize Scene
    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Setup Scene
        const sceneManager = new SceneManager(containerRef.current);
        sceneManagerRef.current = sceneManager;

        // 2. Setup Camera Controls
        const cameraController = new CameraController(
            sceneManager.getCamera(),
            sceneManager.getRenderer().domElement
        );
        cameraControllerRef.current = cameraController;

        // 3. Setup Entity Renderer
        const entityRenderer = new EntityRenderer(sceneManager);
        entityRendererRef.current = entityRenderer;

        // 4. Setup Overlay Renderer
        const overlayRenderer = new OverlayRenderer(sceneManager);
        overlayRendererRef.current = overlayRenderer;

        // 5. Start Loop
        sceneManager.start((time) => {
            // Update Camera Controls
            cameraController.update();

            // Fetch latest data from Ref
            const { entities, getSpatialSnapshots, renderTime, selectedEntityId, activeOverlays } = dataRef.current;

            // Compute Interpolated Positions
            const projectedEntities = entities.map(entity => {
                const snapshots = getSpatialSnapshots(entity.id);
                const position = MovementEngine.interpolate(snapshots, renderTime);

                if (!position) return null;

                return {
                    entityId: entity.id,
                    type: entity.type,
                    status: entity.status,
                    x: position.x,
                    y: position.y
                };
            }).filter((e): e is { entityId: string; type: string; status: string; x: number; y: number } => e !== null);

            // Update Entity Renderer
            entityRenderer.update(projectedEntities, selectedEntityId);

            // ------------------------------------------------------------
            // PHASE 33: OVERLAY LAYER
            // ------------------------------------------------------------
            if (activeOverlays.length > 0) {
                // Resolve Overlays
                const overlays = overlayResolver.resolveOverlays({
                    asOf: renderTime,
                    visibleTypes: activeOverlays
                }, entities);

                // Map entity positions for overlay placement
                const entityPositions = new Map<string, THREE.Vector3>();
                projectedEntities.forEach(e => {
                    entityPositions.set(e.entityId, new THREE.Vector3(e.x, 0, e.y));
                });

                // Render Overlays
                overlayRenderer.update(overlays, entityPositions);
            } else {
                overlayRenderer.clear();
            }

            // ------------------------------------------------------------
            // PHASE 13: PROJECTION LAYER
            // ------------------------------------------------------------
            const { enabled, horizonMinutes } = projectionRef.current;

            // Clear previous projections if disabled
            if (!enabled) {
                entityRenderer.clearProjections();
            } else {
                // Compute Projections
                const projections = entities.flatMap(entity => {
                    const snapshots = getSpatialSnapshots(entity.id);
                    const bundle = ProjectionEngine.project(entity.id, snapshots, renderTime, horizonMinutes);
                    return bundle.paths;
                });

                // Render Projections
                entityRenderer.updateProjections(projections);
            }
        });

        // Cleanup
        return () => {
            sceneManager.dispose();
            cameraController.dispose();
        };
    }, []); // Run once on mount

    // Handle Click (Raycasting)
    const handleClick = (event: React.MouseEvent) => {
        if (!sceneManagerRef.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(
            new THREE.Vector2(x, y),
            sceneManagerRef.current.getCamera()
        );

        const intersects = raycaster.intersectObjects(sceneManagerRef.current.getScene().children);

        // Find first intersected object that has entityId
        for (const intersect of intersects) {
            const entityId = intersect.object.userData.entityId;
            if (entityId) {
                selectEntity(entityId);
                return;
            }
        }

        // Deselect if clicked empty space? Optional.
        // selectEntity(null); 
    };

    const toggleOverlay = (type: OverlayType) => {
        setActiveOverlays(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Overlay Info */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                opacity: 0.7,
                pointerEvents: 'none'
            }}>
                PHASE 33: AUTHORITY OVERLAYS
            </div>

            <ViewControls />

            <OverlayControlPanel
                activeOverlays={activeOverlays}
                onToggleOverlay={toggleOverlay}
            />

            <div style={{
                position: 'absolute',
                top: '24px',
                right: '64px', // Shift left to make room for ViewControls
                backgroundColor: 'rgba(10, 11, 13, 0.9)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '12px',
                width: '240px',
                backdropFilter: 'blur(4px)',
                pointerEvents: 'none'
            }}>
                <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>TEMPORAL STATE</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {renderTime.toISOString().replace('T', ' ').split('.')[0]} UTC
                </div>
            </div>
        </div>
    );
};

export default Map3DView;
