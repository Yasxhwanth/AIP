/**
 * =============================================================================
 * ONTOLOGY VERSION MANAGER
 * =============================================================================
 * 
 * Professional schema versioning interface.
 * Lists all ontology versions with status and metadata.
 * 
 * RULES:
 * - No editing of ACTIVE versions
 * - All writes via OntologyDefinitionStore
 * - Compare before publish
 */

import React, { useState, useEffect } from 'react';
import { ontologyDefinitionStore } from '../../ontology/definition/OntologyDefinitionStore';
import { OntologyVersion, OntologyVersionStatus } from '../../ontology/definition/ontology-definition-types';

interface OntologyVersionManagerProps {
    tenantId: string;
    onSelectVersion?: (versionId: string) => void;
    onCompareVersions?: (fromVersionId: string, toVersionId: string) => void;
}

export const OntologyVersionManager: React.FC<OntologyVersionManagerProps> = ({
    tenantId,
    onSelectVersion,
    onCompareVersions
}) => {
    const [versions, setVersions] = useState<OntologyVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [activeVersion, setActiveVersion] = useState<OntologyVersion | null>(null);

    useEffect(() => {
        loadVersions();
    }, [tenantId]);

    const loadVersions = () => {
        // Get all versions for tenant (need to implement listVersions helper)
        const allVersions: OntologyVersion[] = [];
        // For now, just get active version
        const active = ontologyDefinitionStore.getActiveVersion(tenantId);
        if (active) {
            allVersions.push(active);
        }
        setVersions(allVersions);
        setActiveVersion(active);
    };

    const handleCreateDraft = () => {
        if (!activeVersion) {
            alert('No active version to copy from');
            return;
        }

        const newVersion = ontologyDefinitionStore.createOntologyVersion(
            tenantId,
            `Draft from ${activeVersion.version_number}`,
            activeVersion.id as any,
            'system' // TODO: Replace with actual user ID
        );

        loadVersions();
        setSelectedVersion(newVersion.id);
    };

    const handleCompareWithActive = (versionId: string) => {
        if (!activeVersion) {
            alert('No active version to compare with');
            return;
        }
        if (onCompareVersions) {
            onCompareVersions(activeVersion.id, versionId);
        }
    };

    const getStatusBadgeColor = (status: OntologyVersionStatus): string => {
        switch (status) {
            case OntologyVersionStatus.ACTIVE:
                return 'bg-green-100 text-green-800 border-green-300';
            case OntologyVersionStatus.DRAFT:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case OntologyVersionStatus.DEPRECATED:
                return 'bg-gray-100 text-gray-800 border-gray-300';
            case OntologyVersionStatus.ARCHIVED:
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="ontology-version-manager bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ontology Versions</h2>
                <button
                    onClick={handleCreateDraft}
                    disabled={!activeVersion}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Create Draft Version
                </button>
            </div>

            {versions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No ontology versions found. Create your first version to get started.
                </div>
            ) : (
                <div className="space-y-3">
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            className={`border rounded-lg p-4 cursor-pointer hover:border-blue-400 transition ${selectedVersion === version.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                            onClick={() => {
                                setSelectedVersion(version.id);
                                if (onSelectVersion) {
                                    onSelectVersion(version.id);
                                }
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Version {version.version_number}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 text-xs font-medium border rounded-full ${getStatusBadgeColor(
                                                version.status
                                            )}`}
                                        >
                                            {version.status}
                                        </span>
                                        {version.status === OntologyVersionStatus.ACTIVE && (
                                            <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded">
                                                CURRENT
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Version ID:</span>{' '}
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {version.id.substring(0, 12)}...
                                            </code>
                                        </div>
                                        <div>
                                            <span className="font-medium">Created:</span>{' '}
                                            {new Date(version.created_at).toLocaleString()}
                                        </div>
                                        {version.created_by && (
                                            <div>
                                                <span className="font-medium">Created By:</span> {version.created_by}
                                            </div>
                                        )}
                                        {version.activated_at && (
                                            <div>
                                                <span className="font-medium">Activated:</span>{' '}
                                                {new Date(version.activated_at).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    {version.description && (
                                        <p className="mt-2 text-sm text-gray-700">{version.description}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    {version.status === OntologyVersionStatus.DRAFT && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCompareWithActive(version.id);
                                            }}
                                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                        >
                                            Compare with Active
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                    <strong>⚠️ Warning:</strong> ACTIVE versions cannot be edited. Create a DRAFT version to make
                    changes.
                </p>
            </div>
        </div>
    );
};
