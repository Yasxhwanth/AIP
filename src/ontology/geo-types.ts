import { Entity, Brand } from './types';

// =============================================================================
// GEOGRAPHIC PRIMITIVES
// =============================================================================

export type GeoCoordinateSystem = 'WGS84';

export interface GeoCoordinate {
    latitude: number;
    longitude: number;
    altitude?: number;
}

export interface GeoBoundary {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][]; // GeoJSON standard
}

// =============================================================================
// GEOGRAPHIC ENTITIES
// =============================================================================

/**
 * Represents a physical location on Earth.
 * This is a first-class ontological entity.
 */
export interface LocationEntity extends Entity {
    // Specific attributes (materialized view)
    name: string;
    coordinates: GeoCoordinate;
    coordinateSystem: GeoCoordinateSystem;
}

export type RegionType = 'COUNTRY' | 'STATE' | 'ZONE' | 'SITE';

/**
 * Represents a defined region on Earth.
 * This is a first-class ontological entity.
 */
export interface RegionEntity extends Entity {
    // Specific attributes (materialized view)
    name: string;
    boundary: GeoBoundary;
    regionType: RegionType;
}

// =============================================================================
// RELATIONSHIP TYPES
// =============================================================================

// These are the string IDs for the relationship types
export const REL_LOCATED_AT = 'LOCATED_AT';
export const REL_WITHIN = 'WITHIN';
