/**
 * =============================================================================
 * ONTOLOGY PUBLISH GUARD
 * =============================================================================
 * 
 * Safety check before activating an ontology version.
 * Runs impact analysis and requires explicit confirmation.
 * 
 * RULES:
 * - All writes via OntologyDefinitionStore
 * - Run impact analysis before activation
 * - Require explicit confirmation
 * - No auto-migration
 */

import React, { useState, useEffect } from 'react';
import { ontologyDefinitionStore } from '../../ontology/definition/OntologyDefinitionStore';
import { ontologyDiffEngine } from '../../ontology/definition/OntologyDiffEngine';
import { ontologyImpactAnalyzer } from '../../ontology/definition/OntologyImpactAnalyzer';
import { OntologyVersionId, OntologyVersion } from '../../ontology/definition/ontology-definition-types';

interface OntologyPublishGuardProps {
    tenantId: string;
    draftVersion: OntologyVersion;
    onPublishConfirmed: (versionId: OntologyVersionId) => void;
    onCancelled: () => void;
}

export const OntologyPublishGuard: React.FC<OntologyPublishGuardProps> = ({
    tenantId,
    draftVersion,
    onPublishConfirmed,
    onCancelled
}) => {
    const [activeVersion, setActiveVersion] = useState<OntologyVersion | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmChecked, setConfirmChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        loadAndAnalyze();
    }, []);

    const loadAndAnalyze = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const active = ontologyDefinitionStore.getActiveVersion(tenantId);
            setActiveVersion(active);

            if (!active) {
                setError('No active version found to compare with');
                setIsLoading(false);
                return;
            }

            // Compute diff between active and draft
            const diff = ontologyDiffEngine.computeDiff(
                active.id as any,
                draftVersion.id as any,
                new Date(),
                tenantId
            );

            // Analyze impact
            const impact = ontologyImpactAnalyzer.analyzeImpact(diff, tenantId);
            setAnalysis(impact);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze impact');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = () => {
        if (!confirmChecked) {
            alert('Please confirm that you understand the impact of this change.');
            return;
        }

        setPublishing(true);
        try {
            // Activate the version
            ontologyDefinitionStore.activateVersion(draftVersion.id as any, tenantId);
            onPublishConfirmed(draftVersion.id as any);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to publish version');
        } finally {
            setPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="ontology-publish-guard bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Publishing Analysis</h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Analyzing impact of changes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ontology-publish-guard bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Publish Analysis Error</h2>
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={onCancelled}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Back to Editor
                    </button>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="ontology-publish-guard bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Publish Analysis</h2>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-700">No analysis data available.</p>
                </div>
            </div>
        );
    }

    const breakingChanges = analysis.breaking_changes_count || 0;
    const totalAffected = analysis.affected_entities.length +
        analysis.affected_workflows.length +
        analysis.affected_metrics.length;

    return (
        <div className="ontology-publish-guard bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Publish Ontology Version</h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Draft Version:</span>{' '}
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {draftVersion.id.substring(0, 12)}...
                        </code>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Version Number:</span> {draftVersion.version_number}
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Created:</span>{' '}
                        {new Date(draftVersion.created_at).toLocaleString()}
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Active Version:</span>{' '}
                        {activeVersion ? activeVersion.version_number : 'None'}
                    </div>
                </div>
            </div>

            {/* Impact Summary */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Impact Summary</h3>

                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 rounded border">
                        <div className="text-2xl font-bold text-red-600">{breakingChanges}</div>
                        <div className="text-sm text-gray-600">Breaking Changes</div>
                    </div>
                    <div className="text-center p-3 rounded border">
                        <div className="text-2xl font-bold text-orange-600">{totalAffected}</div>
                        <div className="text-sm text-gray-600">Affected Items</div>
                    </div>
                    <div className="text-center p-3 rounded border">
                        <div className="text-2xl font-bold text-blue-600">{analysis.affected_entities.length}</div>
                        <div className="text-sm text-gray-600">Affected Entities</div>
                    </div>
                    <div className="text-center p-3 rounded border">
                        <div className="text-2xl font-bold text-purple-600">{analysis.affected_metrics.length}</div>
                        <div className="text-sm text-gray-600">Affected Metrics</div>
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="compatibility-check"
                        checked={analysis.replay_compatibility.is_compatible}
                        disabled
                        className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="compatibility-check" className="ml-2 text-sm text-gray-700">
                        {analysis.replay_compatibility.is_compatible
                            ? '✅ Replay compatible'
                            : '❌ Replay compatibility issues'}
                    </label>
                </div>

                {!analysis.replay_compatibility.is_compatible && (
                    <div className="mt-2 text-sm text-red-600">
                        <strong>Incompatibility reasons:</strong>
                        <ul className="list-disc list-inside mt-1">
                            {analysis.replay_compatibility.incompatibility_reasons.map((reason: string, idx: number) => (
                                <li key={idx}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Detailed Impact */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Impact</h3>

                {/* Affected Entities */}
                {analysis.affected_entities && analysis.affected_entities.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-800 mb-2">Affected Entities</h4>
                        <div className="space-y-2">
                            {analysis.affected_entities.map((entity: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded">
                                    <div>
                                        <div className="font-medium">{entity.object_type_name} ({entity.object_type_id})</div>
                                        <div className="text-sm text-gray-600">{entity.entity_count} entities affected</div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded ${entity.impact_level === 'BREAKING' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                                        {entity.impact_level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Affected Metrics */}
                {analysis.affected_metrics && analysis.affected_metrics.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-800 mb-2">Affected Metrics</h4>
                        <div className="space-y-2">
                            {analysis.affected_metrics.map((metric: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 border border-purple-100 rounded">
                                    <div>
                                        <div className="font-medium">{metric.metric_name} ({metric.metric_id})</div>
                                        <div className="text-sm text-gray-600">{metric.impact_reasons.join(', ')}</div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded ${metric.impact_level === 'BREAKING' ? 'bg-red-200 text-red-800' : 'bg-purple-200 text-purple-800'}`}>
                                        {metric.impact_level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmation Required</h3>
                <div className="flex items-start">
                    <input
                        type="checkbox"
                        id="confirmation"
                        checked={confirmChecked}
                        onChange={(e) => setConfirmChecked(e.target.checked)}
                        className="w-4 h-4 mt-1 text-blue-600"
                    />
                    <label htmlFor="confirmation" className="ml-2 text-sm text-gray-700">
                        <strong>I understand this ontology change may affect:</strong>
                        <ul className="list-disc list-inside mt-1 text-xs">
                            <li>Existing entities and their data</li>
                            <li>Historical replay compatibility</li>
                            <li>Metrics and analytics calculations</li>
                            <li>Workflows that depend on this schema</li>
                        </ul>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handlePublish}
                    disabled={!confirmChecked || publishing}
                    className={`px-6 py-2 rounded font-medium ${!confirmChecked || publishing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                >
                    {publishing ? 'Publishing...' : 'Publish Version (IRREVERSIBLE)'}
                </button>
                <button
                    onClick={onCancelled}
                    disabled={publishing}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
                <p>⚠️ This action will make the new ontology version active and affect all subsequent operations.</p>
                <p>Ensure all stakeholders are aware of the changes before proceeding.</p>
            </div>
        </div>
    );
};
