/**
 * =============================================================================
 * ONTOLOGY DIFF VIEWER
 * =============================================================================
 * 
 * Renders structured diff between two ontology versions.
 * Pure structural diff with no AI summarization.
 * 
 * RULES:
 * - No prose
 * - No AI summarization
 * - Pure structural diff
 * - Read-only display
 */

import React from 'react';
import { OntologyDiff } from '../../ontology/definition/OntologyDiffEngine';

interface OntologyDiffViewerProps {
    diff: OntologyDiff;
}

export const OntologyDiffViewer: React.FC<OntologyDiffViewerProps> = ({ diff }) => {
    const renderFieldChanges = (changes: any[]) => {
        return (
            <ul className="space-y-1">
                {changes.map((change, idx) => (
                    <li key={idx} className="text-sm flex items-start">
                        <span className="font-medium text-gray-700 mr-2">{change.field_name}:</span>
                        <span className="text-gray-600">
                            <span className="line-through text-red-500">{String(change.old_value)}</span>
                            {' → '}
                            <span className="text-green-600">{String(change.new_value)}</span>
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderElementList = (elements: any[], title: string, keyField: string, nameField: string) => {
        if (!elements || elements.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
                <ul className="space-y-1">
                    {elements.map((element, idx) => (
                        <li key={idx} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-800">
                                {element[nameField]} ({element[keyField]})
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderModificationList = (modifications: any[], title: string) => {
        if (!modifications || modifications.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
                <ul className="space-y-3">
                    {modifications.map((mod, idx) => (
                        <li key={idx} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium text-gray-800 mb-1">
                                {mod.name} ({mod.object_type_id || mod.attribute_id || mod.relationship_id || mod.metric_id})
                            </div>
                            {renderFieldChanges(mod.changes)}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="ontology-diff-viewer bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ontology Version Diff
            </h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">From Version:</span>{' '}
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {diff.from_version_id}
                        </code>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">To Version:</span>{' '}
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {diff.to_version_id}
                        </code>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Computed:</span>{' '}
                        {new Date(diff.computed_at).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Object Types Diff */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Object Types</h3>
                {renderElementList(diff.object_types.added, 'Added', 'id', 'name')}
                {renderElementList(diff.object_types.removed, 'Removed', 'id', 'name')}
                {renderModificationList(diff.object_types.modified, 'Modified')}
            </div>

            {/* Attributes Diff */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attributes</h3>
                {renderElementList(diff.attributes.added, 'Added', 'id', 'name')}
                {renderElementList(diff.attributes.removed, 'Removed', 'id', 'name')}
                {renderModificationList(diff.attributes.modified, 'Modified')}
            </div>

            {/* Relationships Diff */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationships</h3>
                {renderElementList(diff.relationships.added, 'Added', 'id', 'name')}
                {renderElementList(diff.relationships.removed, 'Removed', 'id', 'name')}
                {renderModificationList(diff.relationships.modified, 'Modified')}
            </div>

            {/* Metrics Diff */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h3>
                {renderElementList(diff.metrics.added, 'Added', 'id', 'name')}
                {renderElementList(diff.metrics.removed, 'Removed', 'id', 'name')}
                {renderModificationList(diff.metrics.modified, 'Modified')}
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded">
                <h4 className="text-md font-semibold text-gray-900 mb-2">Diff Summary</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Object Types:</span>
                        <div className="ml-2">
                            +{diff.object_types.added.length} -{diff.object_types.removed.length}
                        </div>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Attributes:</span>
                        <div className="ml-2">
                            +{diff.attributes.added.length} -{diff.attributes.removed.length}
                        </div>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Relationships:</span>
                        <div className="ml-2">
                            +{diff.relationships.added.length} -{diff.relationships.removed.length}
                        </div>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Metrics:</span>
                        <div className="ml-2">
                            +{diff.metrics.added.length} -{diff.metrics.removed.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
