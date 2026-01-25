import React, { useState, useEffect } from 'react';
import { useOntology } from '../context/OntologyContext';
import { TenantContextManager } from '../tenant/TenantContext';
import { TruthAdmissionEngine } from '../ontology/admission/TruthAdmissionEngine';
import { DecisionJournalManager } from '../../src/decision/DecisionJournalManager';

interface AdmissionReviewProps { }

interface AdmissionCase {
  id: string;
  entity_type_id: string;
  proposed_data: Record<string, any>;
  source_event_id: string;
  created_at: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const AdmissionReview: React.FC<AdmissionReviewProps> = () => {
  const { compiledOntology, isLoading: ontologyLoading, error: ontologyError } = useOntology();
  const [admissionCases, setAdmissionCases] = useState<AdmissionCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<AdmissionCase | null>(null);

  useEffect(() => {
    loadAdmissionCases();
  }, []);

  const loadAdmissionCases = async () => {
    setLoading(true);
    setError(null);

    try {
      const tenantId = TenantContextManager.getContext().tenantId;

      // In a real implementation, this would fetch from the admission engine
      // For now, we'll simulate with mock data
      const mockCases: AdmissionCase[] = [
        {
          id: 'case-001',
          entity_type_id: 'object-type-1',
          proposed_data: { name: 'Sample Entity', status: 'pending', location: 'Zone A' },
          source_event_id: 'event-001',
          created_at: new Date(),
          status: 'PENDING'
        }
      ];

      setAdmissionCases(mockCases);
    } catch (err: any) {
      console.error('Error loading admission cases:', err);
      setError(err.message || 'Failed to load admission cases');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (caseId: string) => {
    try {
      // In a real implementation, this would call the admission engine
      // const result = await TruthAdmissionEngine.approve(caseId, decision);

      // Simulate approval
      setAdmissionCases(prev =>
        prev.map(c => c.id === caseId ? { ...c, status: 'APPROVED' } : c)
      );

      // Also remove from the list since it's been processed
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
      }

      // Add to decision journal
      // DecisionJournalManager.recordDecision(...)

      alert('Case approved successfully!');
    } catch (err: any) {
      console.error('Error approving case:', err);
      setError(err.message || 'Failed to approve case');
    }
  };

  const handleReject = async (caseId: string) => {
    try {
      // In a real implementation, this would call the admission engine
      // const result = await TruthAdmissionEngine.reject(caseId, rejectionReason);

      // Simulate rejection
      setAdmissionCases(prev =>
        prev.map(c => c.id === caseId ? { ...c, status: 'REJECTED' } : c)
      );

      // Also remove from the list since it's been processed
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
      }

      alert('Case rejected successfully!');
    } catch (err: any) {
      console.error('Error rejecting case:', err);
      setError(err.message || 'Failed to reject case');
    }
  };

  if (ontologyLoading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ontologyError) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <h3 className="text-red-800 font-medium">Ontology Error</h3>
          <p className="text-red-600">{ontologyError}</p>
        </div>
      </div>
    );
  }

  // Get pending cases only
  const pendingCases = admissionCases.filter(c => c.status === 'PENDING');

  return (
    <div className="admission-review">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Admission Review Queue</h2>
        <p className="text-gray-600 text-sm">Review and approve candidate truths before they become permanent</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">Pending Cases ({pendingCases.length})</h3>
            </div>

            {loading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ) : pendingCases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No pending admission cases
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingCases.map((admissionCase) => {
                  const objectType = compiledOntology?.snapshot.object_types.get(admissionCase.entity_type_id as any);

                  return (
                    <div
                      key={admissionCase.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedCase?.id === admissionCase.id ? 'bg-blue-50' : ''
                        }`}
                      onClick={() => setSelectedCase(admissionCase)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {objectType?.display_name || 'Unknown Type'}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {admissionCase.proposed_data.name || 'Unnamed Entity'}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(admissionCase.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Case Detail */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="bg-white border border-gray-200 rounded-md">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">Case Details</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {selectedCase.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Case ID</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedCase.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submitted</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedCase.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Source Event</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedCase.source_event_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Entity Type</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {compiledOntology?.snapshot.object_types.get(selectedCase.entity_type_id as any)?.display_name || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Proposed Data</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <pre className="text-sm text-gray-800 overflow-x-auto">
                      {JSON.stringify(selectedCase.proposed_data, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(selectedCase.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedCase.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-md p-12 text-center">
              <p className="text-gray-500">Select an admission case to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmissionReview;