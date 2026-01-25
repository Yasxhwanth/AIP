import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from '../../rendering3d/SceneManager';
import { CameraController } from '../../rendering3d/CameraController';
import { useOntologyQuery } from '../../adapters/query/useOntologyQuery';
import { useScenario } from '../../context/ScenarioContext';
import { TenantContextManager } from '../../tenant/TenantContext';
import { ScenarioAwareQueryResolver } from '../../ontology/ScenarioAwareQueryResolver';
import {
    ENTITY_TYPE_LOCATION,
    ENTITY_TYPE_REGION
} from '../../ontology/types';
import { LocationEntity, RegionEntity } from '../../ontology/geo-types';

import { GeoMapBaseLayer } from './GeoMapBaseLayer';
import { GeoEntityLayer } from './GeoEntityLayer';
import { GeoRegionLayer } from './GeoRegionLayer';
import { GeoMovementLayer } from './GeoMovementLayer';
import { OverlayControlPanel } from './OverlayControlPanel';
import { OverlayType } from '../../visualization/OverlayTypes';

const GeoMapRenderer: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);
    const cameraControllerRef = useRef<CameraController | null>(null);
    const [activeOverlays, setActiveOverlays] = useState<OverlayType[]>([]);

    const { entities, asOf } = useOntologyQuery();
    const { activeScenarioId } = useScenario();
    const tenantId = TenantContextManager.getContext().tenantId;
    const CURRENT_ONTOLOGY_VERSION = "v1.0.0";

    // Initialize Scene
    useEffect(() => {
        if (!containerRef.current) return;

        const sm = new SceneManager(containerRef.current);
        setSceneManager(sm);

        // Setup Camera
        const cc = new CameraController(
            sm.getCamera(),
            sm.getRenderer().domElement
        );
        cameraControllerRef.current = cc;

        // Adjust camera for flat map view
        // Look down from Y
        sm.getCamera().position.set(0, 200, 200);
        sm.getCamera().lookAt(0, 0, 0);

        // Start Loop
        sm.start(() => {
            cc.update();
        });

        return () => {
            sm.dispose();
            cc.dispose();
        };
    }, []);

    // Prepare Data for Layers
    const regions = entities.filter(e => e.entity_type_id === ENTITY_TYPE_REGION) as unknown as RegionEntity[];

    // Resolve Locations
    const locationMap = new Map<string, LocationEntity>();
    entities.forEach(e => {
        if (e.entity_type_id === ENTITY_TYPE_LOCATION || e.entity_type_id === ENTITY_TYPE_REGION) return;

        const loc = ScenarioAwareQueryResolver.getEntityLocation(
            e.id,
            asOf,
            activeScenarioId,
            CURRENT_ONTOLOGY_VERSION,
            tenantId
        );

        if (loc) {
            locationMap.set(e.id, loc);
        }
    });

    const toggleOverlay = (type: OverlayType) => {
        setActiveOverlays(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                opacity: 0.7,
                pointerEvents: 'none',
                zIndex: 10
            }}>
                PHASE 33C: GEOGRAPHIC MOVEMENT HISTORY
            </div>

            <OverlayControlPanel
                activeOverlays={activeOverlays}
                onToggleOverlay={toggleOverlay}
            />

            {/* Render Layers */}
            {sceneManager && (
                <>
                    <GeoMapBaseLayer sceneManager={sceneManager} />
                    <GeoRegionLayer sceneManager={sceneManager} regions={regions} />
                    <GeoEntityLayer sceneManager={sceneManager} entities={entities} locations={locationMap} />
                    <GeoMovementLayer
                        sceneManager={sceneManager}
                        entities={entities}
                        asOf={asOf}
                        showMovement={activeOverlays.includes(OverlayType.MOVEMENT_HISTORY)}
                    />
                </>
            )}
        </div>
    );
};

export default GeoMapRenderer;
