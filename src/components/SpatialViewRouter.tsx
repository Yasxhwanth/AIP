import React from 'react';
import { useVisualization } from '../context/VisualizationContext';
import Map3DView from './Map3DView';
import GeoMapRenderer from './Map/GeoMapRenderer';

const SpatialViewRouter: React.FC = () => {
    const { mapMode } = useVisualization();

    if (mapMode === 'GEOGRAPHIC') {
        return <GeoMapRenderer />;
    }

    return <Map3DView />;
};

export default SpatialViewRouter;
