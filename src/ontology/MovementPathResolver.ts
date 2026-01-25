import { QueryClient } from '../adapters/query/QueryClient';
import { RELATIONSHIP_TYPE_LOCATED_AT, ENTITY_TYPE_LOCATION } from './types';
import { LocationEntity } from './geo-types';

export interface GeoPoint {
    lat: number;
    lng: number;
    alt: number;
    time: Date;
}

export class MovementPathResolver {
    /**
     * Resolves the historical movement path for an entity.
     * 
     * @param entityId The entity to track
     * @param asOf Current simulation time
     * @param historyWindowHours How far back to look (default 24h)
     * @param tenantId Current tenant
     */
    public static resolvePath(
        entityId: string,
        asOf: Date,
        historyWindowHours: number = 24,
        tenantId: string
    ): GeoPoint[] {
        // 1. Get Relationship History for LOCATED_AT
        const history = QueryClient.getRelationshipHistory(
            entityId,
            RELATIONSHIP_TYPE_LOCATED_AT,
            asOf,
            tenantId
        );

        const windowStart = new Date(asOf.getTime() - (historyWindowHours * 60 * 60 * 1000));

        // 2. Filter and Map to Points
        const points: GeoPoint[] = [];

        for (const relVer of history) {
            if (relVer.valid_from < windowStart) continue;

            // Get the Relationship object to find the target location
            const rel = QueryClient.getRelationship(relVer.relationship_id);
            if (!rel) continue;

            // Ensure this entity is the SOURCE (moved TO a location)
            if (rel.source_entity_id !== entityId) continue;

            const locationId = rel.target_entity_id;

            // Resolve Location Entity
            // We need the snapshot of the location AT THAT TIME.
            // But usually locations don't move. Let's assume static location for now.
            // Or use current snapshot if it exists.
            const locationSnapshot = QueryClient.getEntitySnapshot(locationId, asOf, tenantId);

            if (locationSnapshot && locationSnapshot.type === ENTITY_TYPE_LOCATION) {
                const loc = locationSnapshot as unknown as LocationEntity;
                if (loc.coordinates) {
                    points.push({
                        lat: loc.coordinates.latitude,
                        lng: loc.coordinates.longitude,
                        alt: loc.coordinates.altitude || 0,
                        time: relVer.valid_from
                    });
                }
            }
        }

        // Sort by time ascending (oldest to newest) for drawing the line
        return points.sort((a, b) => a.time.getTime() - b.time.getTime());
    }
}
