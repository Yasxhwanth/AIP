import * as THREE from 'three';

/**
 * GeoProjectionEngine
 * 
 * Deterministic Mercator projection engine.
 * Converts Latitude/Longitude to Vector3 (x, y, z).
 * 
 * Coordinate System:
 * X: Longitude (East/West)
 * Y: Latitude (North/South) - Projected via Mercator
 * Z: Altitude (Up/Down)
 * 
 * Origin (0,0,0) is at Lat 0, Lng 0 (Null Island).
 */
export class GeoProjectionEngine {
    // Scale factor to map earth coordinates to world units
    // 1 unit = 1 degree of longitude at equator approx? 
    // Let's pick a scale that makes the world map reasonable size.
    // Earth circumference ~40,000 km.
    // If we want the map to be say 1000 units wide.
    // 360 degrees = 1000 units => 1 degree = 2.77 units.
    private static readonly SCALE = 1000 / 360;
    private static readonly MAX_LAT = 85.051129; // Mercator cutoff

    /**
     * Projects Lat/Lng/Alt to Vector3
     * @param lat Latitude in degrees
     * @param lng Longitude in degrees
     * @param alt Altitude in meters (optional, default 0)
     */
    public static project(lat: number, lng: number, alt: number = 0): THREE.Vector3 {
        const x = lng * this.SCALE;

        // Mercator projection for Y
        // y = ln(tan(pi/4 + lat/2))
        // We clamp latitude to avoid infinity at poles
        const clampedLat = Math.max(Math.min(lat, this.MAX_LAT), -this.MAX_LAT);
        const latRad = clampedLat * (Math.PI / 180);
        const y = Math.log(Math.tan((Math.PI / 4) + (latRad / 2))) * (180 / Math.PI) * this.SCALE;

        // Z is altitude. We might need to scale this too if it's in meters.
        // Assuming 1 unit = ~40km (based on 1000 units width)
        // 1 meter is tiny. Let's just pass it through for now or scale it.
        // For visualization, we might want to exaggerate altitude.
        const z = alt * 0.001; // Scale meters to km-ish units? Or just keep it small.

        // In Three.js usually Y is up. But for a map, often Z is up or Y is North.
        // Let's stick to standard 3D: Y is Up.
        // So Map Plane is X-Z? Or X-Y?
        // If we want a flat map on the "ground", it should be X-Z plane.
        // X = Longitude
        // Z = -Latitude (North is -Z in standard 3D? or -Z is forward)
        // Let's use:
        // X = East (Lng)
        // Z = -North (Lat) -> North is negative Z (forward), South is positive Z
        // Y = Altitude

        return new THREE.Vector3(x, alt * 0.01, -y);
    }

    /**
     * Inverse projection from Vector3 to Lat/Lng
     */
    public static unproject(vector: THREE.Vector3): { lat: number, lng: number, alt: number } {
        const lng = vector.x / this.SCALE;
        const y = -vector.z / this.SCALE; // Invert Z back to projected Lat

        const latRad = (2 * Math.atan(Math.exp(y * (Math.PI / 180)))) - (Math.PI / 2);
        const lat = latRad * (180 / Math.PI);

        return { lat, lng, alt: vector.y / 0.01 };
    }
}
