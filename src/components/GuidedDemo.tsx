import React, { useState, useEffect } from 'react';
import { TenantContextManager } from '../tenant/TenantContext';
import { OntologyStore } from '../ontology/OntologyStore';
import { IngestionEngine } from '../ontology/ingestion/IngestionEngine';
import { TruthAdmissionEngine } from '../ontology/admission/TruthAdmissionEngine';
import { ScenarioManager } from '../ontology/ScenarioManager';
import { QueryClient } from '../adapters/query/QueryClient';
import { GeminiClient } from '../ai/GeminiClient';
import { AIAdvisoryService } from '../ai/AIAdvisoryService';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

const GuidedDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoData, setDemoData] = useState<any>(null);
  const [ontologyType, setOntologyType] = useState<'asset-location' | 'hospital' | 'logistics'>('asset-location');

  // Demo steps configuration
  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "Reality Before Ontology",
      description: "Data without ontology has no operational meaning.",
      component: <RealityBeforeOntology demoData={demoData} />
    },
    {
      id: 2,
      title: "Define Ontology",
      description: "This is not data. This is meaning.",
      component: <DefineOntology ontologyType={ontologyType} />
    },
    {
      id: 3,
      title: "Truth Admission",
      description: "Truth is governed, not assumed.",
      component: <TruthAdmission />
    },
    {
      id: 4,
      title: "Temporal Reasoning",
      description: "The system never forgets. Time is a first-class dimension.",
      component: <TemporalReasoning />
    },
    {
      id: 5,
      title: "Scenario Planning",
      description: "We can explore futures without corrupting reality.",
      component: <ScenarioPlanning />
    },
    {
      id: 6,
      title: "Semantic Query",
      description: "Queries operate on meaning, not tables.",
      component: <SemanticQuery />
    },
    {
      id: 7,
      title: "AI Advisory",
      description: "AI reasons over your ontology — not hallucinated business logic.",
      component: <AIAdvisory />
    },
    {
      id: 8,
      title: "Ontology Swap",
      description: "Only meaning changed. The platform stayed the same.",
      component: <OntologySwap setOntologyType={setOntologyType} />
    }
  ];

  // Initialize demo data based on selected ontology type
  useEffect(() => {
    initializeDemoData();
  }, [ontologyType]);

  const initializeDemoData = () => {
    // Mock data initialization based on ontology type
    let data;
    
    switch(ontologyType) {
      case 'hospital':
        data = {
          rawAssets: [
            { id: 'pat-001', type: 'Patient', name: 'John Doe', status: 'critical', roomId: 'ICU-101' },
            { id: 'doc-001', type: 'Doctor', name: 'Dr. Smith', specialty: 'Cardiology', availability: 'busy' },
            { id: 'eq-001', type: 'Ventilator', status: 'in-use', location: 'ICU-101' }
          ],
          ontology: {
            objectTypes: [
              { id: 'patient', name: 'Patient', attributes: ['name', 'status', 'roomId'] },
              { id: 'doctor', name: 'Doctor', attributes: ['name', 'specialty', 'availability'] },
              { id: 'equipment', name: 'Equipment', attributes: ['name', 'status', 'location'] }
            ],
            relationships: [
              { from: 'patient', to: 'room', type: 'located-in' },
              { from: 'doctor', to: 'patient', type: 'treating' },
              { from: 'equipment', to: 'patient', type: 'assisting' }
            ]
          }
        };
        break;
      case 'logistics':
        data = {
          rawAssets: [
            { id: 'trk-001', type: 'Truck', currentLocation: 'DC-01', status: 'loaded', destination: 'STORE-15' },
            { id: 'drv-001', type: 'Driver', name: 'Mike Johnson', status: 'on-duty', assigned_truck: 'trk-001' },
            { id: 'pkg-001', type: 'Package', weight: '5kg', origin: 'DC-01', destination: 'STORE-15' }
          ],
          ontology: {
            objectTypes: [
              { id: 'truck', name: 'Truck', attributes: ['currentLocation', 'status', 'destination'] },
              { id: 'driver', name: 'Driver', attributes: ['name', 'status', 'assigned_truck'] },
              { id: 'package', name: 'Package', attributes: ['weight', 'origin', 'destination'] }
            ],
            relationships: [
              { from: 'driver', to: 'truck', type: 'drives' },
              { from: 'package', to: 'truck', type: 'loaded-in' },
              { from: 'truck', to: 'location', type: 'at' }
            ]
          }
        };
        break;
      default: // asset-location
        data = {
          rawAssets: [
            { id: 'asset-001', type: 'Industrial Asset', name: 'Pump-Alpha', status: 'operational', location: 'Zone-A' },
            { id: 'loc-001', type: 'Location', name: 'Zone-A', capacity: 'high', zoneType: 'production' },
            { id: 'act-001', type: 'Activity', name: 'Maintenance', status: 'scheduled', target: 'Pump-Alpha' }
          ],
          ontology: {
            objectTypes: [
              { id: 'asset', name: 'Asset', attributes: ['name', 'status', 'location'] },
              { id: 'location', name: 'Location', attributes: ['name', 'capacity', 'zoneType'] },
              { id: 'activity', name: 'Activity', attributes: ['name', 'status', 'target'] }
            ],
            relationships: [
              { from: 'asset', to: 'location', type: 'located-in' },
              { from: 'activity', to: 'asset', type: 'targets' },
              { from: 'location', to: 'location', type: 'connected-to' }
            ]
          }
        };
    }
    
    setDemoData(data);
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setOntologyType('asset-location');
  };

  return (
    <div className="guided-demo-container p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="demo-header mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Enterprise Ontology Runtime Platform</h1>
          <p className="text-lg text-gray-600 mt-2">Guided Demo Experience</p>
          <div className="mt-4 flex justify-center space-x-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {ontologyType.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="demo-content bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="step-indicator mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">{demoSteps[currentStep].title}</h2>
              <span className="text-gray-500">Step {currentStep + 1} of {demoSteps.length}</span>
            </div>
            <p className="text-gray-600 mt-2">{demoSteps[currentStep].description}</p>
            
            <div className="progress-bar mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="step-content">
            {demoSteps[currentStep].component}
          </div>
        </div>

        <div className="demo-controls flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md ${
              currentStep === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Reset Demo
          </button>
          
          <button
            onClick={nextStep}
            disabled={currentStep === demoSteps.length - 1}
            className={`px-4 py-2 rounded-md ${
              currentStep === demoSteps.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Step Components
const RealityBeforeOntology: React.FC<{ demoData: any }> = ({ demoData }) => {
  return (
    <div className="reality-before-ontology">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Raw Incoming Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoData?.rawAssets?.map((item: any, index: number) => (
            <div key={index} className="border border-red-200 bg-red-50 p-4 rounded-md">
              <div className="font-mono text-sm text-red-800 break-all">
                {JSON.stringify(item, null, 2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <p className="text-yellow-800">
          <strong>No meaning.</strong> No relationships. No structure.
          These are just arbitrary data points with no operational significance.
        </p>
      </div>
    </div>
  );
};

const DefineOntology: React.FC<{ ontologyType: string }> = ({ ontologyType }) => {
  return (
    <div className="define-ontology">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Ontology Definition</h3>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
          <p className="text-blue-800 mb-4">
            This is not data. This is <strong>meaning</strong>.
          </p>
          
          <div className="ontology-structure">
            <h4 className="font-medium text-gray-700 mb-2">Object Types:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {ontologyType === 'hospital' && (
                <>
                  <li><strong>Patient</strong>: name, status, room</li>
                  <li><strong>Doctor</strong>: name, specialty, availability</li>
                  <li><strong>Equipment</strong>: name, status, location</li>
                </>
              )}
              {ontologyType === 'logistics' && (
                <>
                  <li><strong>Truck</strong>: location, status, destination</li>
                  <li><strong>Driver</strong>: name, status, assigned_truck</li>
                  <li><strong>Package</strong>: weight, origin, destination</li>
                </>
              )}
              {ontologyType !== 'hospital' && ontologyType !== 'logistics' && (
                <>
                  <li><strong>Asset</strong>: name, status, location</li>
                  <li><strong>Location</strong>: name, capacity, type</li>
                  <li><strong>Activity</strong>: name, status, target</li>
                </>
              )}
            </ul>
            
            <h4 className="font-medium text-gray-700 mt-4 mb-2">Relationships:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {ontologyType === 'hospital' && (
                <>
                  <li>Doctor <em>treats</em> Patient</li>
                  <li>Equipment <em>assists</em> Patient</li>
                  <li>Patient <em>located-in</em> Room</li>
                </>
              )}
              {ontologyType === 'logistics' && (
                <>
                  <li>Driver <em>drives</em> Truck</li>
                  <li>Package <em>loaded-in</em> Truck</li>
                  <li>Truck <em>at</em> Location</li>
                </>
              )}
              {ontologyType !== 'hospital' && ontologyType !== 'logistics' && (
                <>
                  <li>Asset <em>located-in</em> Location</li>
                  <li>Activity <em>targets</em> Asset</li>
                  <li>Location <em>connected-to</em> Location</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const TruthAdmission: React.FC = () => {
  return (
    <div className="truth-admission">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Truth Admission Process</h3>
        
        <div className="process-flow flex flex-wrap justify-center gap-4 mb-6">
          <div className="step bg-gray-100 p-4 rounded-lg w-32 text-center">
            <div className="text-lg font-bold text-gray-700">Raw</div>
            <div className="text-xs text-gray-500">Incoming Data</div>
          </div>
          
          <div className="flex items-center">
            <div className="text-gray-400">→</div>
          </div>
          
          <div className="step bg-yellow-100 p-4 rounded-lg w-32 text-center">
            <div className="text-lg font-bold text-yellow-700">Candidate</div>
            <div className="text-xs text-gray-500">Truth</div>
          </div>
          
          <div className="flex items-center">
            <div className="text-gray-400">→</div>
          </div>
          
          <div className="step bg-blue-100 p-4 rounded-lg w-32 text-center">
            <div className="text-lg font-bold text-blue-700">Decision</div>
            <div className="text-xs text-gray-500">Review</div>
          </div>
          
          <div className="flex items-center">
            <div className="text-gray-400">→</div>
          </div>
          
          <div className="step bg-green-100 p-4 rounded-lg w-32 text-center">
            <div className="text-lg font-bold text-green-700">Version</div>
            <div className="text-xs text-gray-500">Materialized</div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 p-4 rounded-md">
          <p className="text-green-800">
            <strong>Truth is governed, not assumed.</strong> Every piece of information goes through 
            a formal admission process with human oversight and decision journaling.
          </p>
        </div>
      </div>
    </div>
  );
};

const TemporalReasoning: React.FC = () => {
  return (
    <div className="temporal-reasoning">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Temporal Reasoning</h3>
        
        <div className="time-slider mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Past</span>
            <span>Present</span>
            <span>Future</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue="50" 
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        <div className="entity-evolution grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-300 p-4 rounded-md">
            <h4 className="font-medium text-gray-700">T-1 Day</h4>
            <p className="text-sm">Asset status: Operational</p>
            <p className="text-sm">Location: Zone-A</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-300 p-4 rounded-md">
            <h4 className="font-medium text-blue-700">Current</h4>
            <p className="text-sm">Asset status: <strong>Degraded</strong></p>
            <p className="text-sm">Location: Zone-A</p>
            <p className="text-xs text-blue-600 mt-2">Maintenance scheduled</p>
          </div>
          
          <div className="bg-green-50 border border-green-300 p-4 rounded-md">
            <h4 className="font-medium text-green-700">T+1 Day</h4>
            <p className="text-sm">Asset status: <strong>Maintenance</strong></p>
            <p className="text-sm">Location: Workshop</p>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-md">
        <p className="text-purple-800">
          <strong>The system never forgets.</strong> Time is a first-class dimension. 
          Every entity maintains its complete history of states and changes.
        </p>
      </div>
    </div>
  );
};

const ScenarioPlanning: React.FC = () => {
  return (
    <div className="scenario-planning">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Scenario Planning</h3>
        
        <div className="scenario-comparison grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-300 p-4 rounded-md">
            <h4 className="font-medium text-gray-700 mb-3">Real Truth</h4>
            <div className="space-y-2">
              <div className="p-2 bg-gray-100 rounded">Asset-001: Operational</div>
              <div className="p-2 bg-gray-100 rounded">Asset-002: Operational</div>
              <div className="p-2 bg-gray-100 rounded">Asset-003: Degraded</div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md">
            <h4 className="font-medium text-yellow-700 mb-3">Scenario: Planned Maintenance</h4>
            <div className="space-y-2">
              <div className="p-2 bg-blue-100 rounded">Asset-001: Operational</div>
              <div className="p-2 bg-green-100 rounded">Asset-002: <strong>Maintenance</strong></div>
              <div className="p-2 bg-red-100 rounded">Asset-003: <strong>Down</strong></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <p className="text-yellow-800">
          <strong>We can explore futures without corrupting reality.</strong> Scenarios exist 
          independently of truth, allowing safe exploration of potential outcomes.
        </p>
      </div>
    </div>
  );
};

const SemanticQuery: React.FC = () => {
  return (
    <div className="semantic-query">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Semantic Query</h3>
        
        <div className="query-input mb-4">
          <div className="bg-gray-800 text-green-400 p-4 rounded-md font-mono text-sm">
            SHOW ALL DEGRADED ASSETS CONNECTED TO SITE A
          </div>
        </div>
        
        <div className="query-results bg-green-50 border border-green-200 p-4 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Results:</h4>
          <div className="space-y-2">
            <div className="p-2 bg-white border border-green-300 rounded flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Asset-003: Pump-Alpha (Degraded)</span>
            </div>
            <div className="p-2 bg-white border border-green-300 rounded flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Asset-007: Valve-Beta (Failed)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 p-4 rounded-md">
        <p className="text-green-800">
          <strong>Queries operate on meaning, not tables.</strong> The system understands 
          entity types, attributes, and relationships to return semantically relevant results.
        </p>
      </div>
    </div>
  );
};

const AIAdvisory: React.FC = () => {
  return (
    <div className="ai-advisory">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">AI Advisory</h3>
        
        <div className="ai-question bg-gray-100 p-4 rounded-md mb-4">
          <p className="font-medium">User Question: "What is happening here?"</p>
        </div>
        
        <div className="ai-response bg-blue-50 border border-blue-200 p-4 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">AI Response:</h4>
          <p className="mb-3">
            The system shows three assets in operational status, one asset (Pump-Alpha) in degraded status 
            requiring maintenance, and one asset (Valve-Beta) that has failed completely. 
            The maintenance schedule indicates that Pump-Alpha will be moved to workshop status tomorrow.
          </p>
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This is advisory only - not a recommendation or decision.
          </p>
        </div>
        
        <div className="ai-context mt-4 p-4 bg-purple-50 border border-purple-200 rounded-md">
          <h4 className="font-medium text-purple-800 mb-2">AI Context:</h4>
          <p className="text-sm">
            The AI analyzed the current ontology schema, entity states, temporal information, 
            and relationships to provide this explanation based on the enterprise ontology model.
          </p>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <p className="text-blue-800">
          <strong>AI reasons over your ontology</strong> — not hallucinated business logic. 
          The AI understands your specific domain through the ontology schema.
        </p>
      </div>
    </div>
  );
};

const OntologySwap: React.FC<{ setOntologyType: (type: 'asset-location' | 'hospital' | 'logistics') => void }> = ({ setOntologyType }) => {
  return (
    <div className="ontology-swap">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-gray-800 mb-3">Ontology Swap</h3>
        
        <div className="ontology-options grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button 
            onClick={() => setOntologyType('asset-location')}
            className="bg-white border-2 border-gray-300 p-4 rounded-md hover:border-blue-500 transition-colors"
          >
            <h4 className="font-medium text-gray-800">Asset/Location</h4>
            <p className="text-sm text-gray-600">Industrial Assets</p>
          </button>
          
          <button 
            onClick={() => setOntologyType('hospital')}
            className="bg-white border-2 border-gray-300 p-4 rounded-md hover:border-blue-500 transition-colors"
          >
            <h4 className="font-medium text-gray-800">Hospital</h4>
            <p className="text-sm text-gray-600">Healthcare System</p>
          </button>
          
          <button 
            onClick={() => setOntologyType('logistics')}
            className="bg-white border-2 border-gray-300 p-4 rounded-md hover:border-blue-500 transition-colors"
          >
            <h4 className="font-medium text-gray-800">Logistics</h4>
            <p className="text-sm text-gray-600">Supply Chain</p>
          </button>
        </div>
        
        <div className="platform-unchanged bg-green-50 border border-green-200 p-4 rounded-md">
          <p className="text-green-800">
            <strong>Only meaning changed. The platform stayed the same.</strong> 
            The underlying system remains unchanged - only the ontology definition changed, 
            demonstrating the platform's ability to adapt to different domains.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuidedDemo;