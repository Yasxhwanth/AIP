import { ProjectionEngine } from '../src/ontology/ProjectionEngine';
import { SpatialSnapshot } from '../src/ontology/MovementEngine';

console.log('Running ProjectionEngine Verification...');

const mockSnapshots: SpatialSnapshot[] = [
    { time: new Date('2026-01-23T10:00:00Z'), x: 0, y: 0 },
    { time: new Date('2026-01-23T10:01:00Z'), x: 10, y: 10 }
];

const asOf = new Date('2026-01-23T10:01:00Z');
const horizonMinutes = 10;

const bundle = ProjectionEngine.project('TEST-ENTITY', mockSnapshots, asOf, horizonMinutes);

console.log('Projection Bundle:', JSON.stringify(bundle, null, 2));

if (bundle.paths.length !== 1) {
    console.error('FAIL: Expected 1 path projection');
    process.exit(1);
}

const path = bundle.paths[0];
const lastPoint = path.points[path.points.length - 1];

// Velocity is (10, 10) per minute.
// Horizon is 10 minutes.
// Expected end position: (10 + 10*10, 10 + 10*10) = (110, 110)

const expectedX = 110;
const expectedY = 110;

if (Math.abs(lastPoint.x - expectedX) < 0.01 && Math.abs(lastPoint.y - expectedY) < 0.01) {
    console.log('SUCCESS: Projection logic is correct.');
} else {
    console.error(`FAIL: Expected (${expectedX}, ${expectedY}), got (${lastPoint.x}, ${lastPoint.y})`);
    process.exit(1);
}
