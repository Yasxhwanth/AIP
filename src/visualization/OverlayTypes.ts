export enum OverlayType {
    AUTHORITY_COVERAGE = 'AUTHORITY_COVERAGE',
    POLICY_CONSTRAINT = 'POLICY_CONSTRAINT',
    AUTHORITY_GAP = 'AUTHORITY_GAP',
    EMERGENCY_AUTHORITY = 'EMERGENCY_AUTHORITY',
    MOVEMENT_HISTORY = 'MOVEMENT_HISTORY',
    AI_ANALYZED = 'AI_ANALYZED'
}

export interface OverlayStyle {
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
    pattern?: 'solid' | 'hashed' | 'pulse';
    pulseColor?: string;
}

export interface OverlayDescriptor {
    id: string;
    type: OverlayType;
    geometry: {
        type: 'region' | 'entity_highlight';
        points?: { x: number; y: number }[]; // For regions (polygon)
        entityId?: string; // For entity highlights
        radius?: number; // For circular regions around entities
    };
    style: OverlayStyle;
    explanation: string;
    sourceIds: string[]; // Policy IDs or Authority Edge IDs
    validAt: string; // ISO Date
}

export interface OverlayContext {
    asOf: Date;
    visibleTypes: OverlayType[];
}
