import React, { useState } from 'react';
import { X, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Boxes,
    Network,
    Activity,
    GitBranch,
    UserCheck,
    Zap,
    Brain,
    LayoutDashboard,
    Map as MapIcon,
    List,
    Scale,
    FileText,
    TrendingUp,
    Eye,
    Settings,
    PlusCircle
} from 'lucide-react';
import Navigation from './components/Navigation';
import { useScenario } from './context/ScenarioContext';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import VisualizationControls from './components/VisualizationControls';
import SpatialViewRouter from './components/SpatialViewRouter';
import ContextPanel from './components/ContextPanel';
import EntityDetail from './components/EntityDetail';
import ScenarioPanel from './components/ScenarioPanel';
import ScenarioComparisonView from './components/ScenarioComparisonView';
import OperationsDashboard from './components/OperationsDashboard';
import SignalsDashboard from './components/SignalsDashboard';
import AttentionDashboard from './components/AttentionDashboard';
import { DecisionHistoryView } from './components/DecisionHistoryView';
import { ReplayTimelineView } from './components/ReplayTimelineView';
import { ReplayModeBanner } from './components/ReplayModeBanner';
import { useReplay } from './context/ReplayContext';
import { AIAdvisoryPanel } from './components/AIAdvisoryPanel';
import { useAIAdvisory } from './context/AIAdvisoryContext';
import { WorkflowManager } from './components/WorkflowManager';
import { MyTasksPanel } from './components/workflows/MyTasksPanel';
import DataEntryForm from './components/DataEntryForm';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
    collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button
        className={`sidebar-item ${active ? 'active' : ''}`}
        onClick={onClick}
        title={collapsed ? label : undefined}
        style={{
            width: collapsed ? '44px' : '100%',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 12px',
            borderRadius: '10px',
            color: active ? 'var(--accent)' : 'var(--text-secondary)',
            backgroundColor: active ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
            transition: 'var(--transition-smooth)',
            gap: '12px',
            border: active ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid transparent'
        }}
    >
        <Icon size={20} style={{ filter: active ? 'drop-shadow(0 0 8px var(--accent-glow))' : 'none' }} />
        {!collapsed && <span style={{ fontSize: '13px', fontWeight: active ? '600' : '500' }}>{label}</span>}
    </button>
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState('map');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const { activeScenario } = useScenario();
    const { isPanelOpen, currentSession, invokeAI, closePanel } = useAIAdvisory();
    const { isReplayMode } = useReplay();

    const handleAIInvoke = () => {
        invokeAI(
            'manual',
            'User requested analysis via Sidebar',
            {
                timestamp: new Date(),
                viewContext: 'manual',
                activeScenarioId: activeScenario?.scenarioId
            }
        );
    };

    return (
        <div className="app-container">
            {/* Sidebar - Collapsible & Glassmorphic */}
            <aside
                className={`sidebar glass-panel ${isReplayMode ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                style={{
                    width: isSidebarCollapsed ? '72px' : '240px',
                    transition: 'width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    padding: '16px 14px',
                    borderRight: '1px solid var(--border)',
                    background: 'var(--bg-surface)'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                    marginBottom: '32px',
                    width: '100%'
                }}>
                    <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Zap size={32} fill="currentColor" style={{ filter: 'drop-shadow(0 0 12px var(--accent-glow))' }} />
                        {!isSidebarCollapsed && <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.03em' }}>AIP.RUN</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <SidebarItem icon={MapIcon} label="Map View" active={activeTab === 'map'} onClick={() => setActiveTab('map')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={LayoutDashboard} label="Operations" active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={TrendingUp} label="Signals" active={activeTab === 'signals'} onClick={() => setActiveTab('signals')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={Eye} label="Attention" active={activeTab === 'attention'} onClick={() => setActiveTab('attention')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={PlusCircle} label="Data Entry" active={activeTab === 'data-entry'} onClick={() => setActiveTab('data-entry')} collapsed={isSidebarCollapsed} />

                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

                    <SidebarItem icon={Boxes} label="Entities" active={activeTab === 'entities'} onClick={() => setActiveTab('entities')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={Network} label="Ontology" active={activeTab === 'ontology'} onClick={() => setActiveTab('ontology')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={GitBranch} label="Workflows" active={activeTab === 'workflows'} onClick={() => setActiveTab('workflows')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={UserCheck} label="My Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} collapsed={isSidebarCollapsed} />

                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

                    <SidebarItem icon={Brain} label="AI Co-Pilot" active={isPanelOpen} onClick={handleAIInvoke} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={Scale} label="Compare" active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={FileText} label="Decisions" active={activeTab === 'decisions'} onClick={() => setActiveTab('decisions')} collapsed={isSidebarCollapsed} />
                    <SidebarItem icon={List} label="Audit Log" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} collapsed={isSidebarCollapsed} />
                </div>

                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SidebarItem icon={Settings} label="Settings" collapsed={isSidebarCollapsed} />
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="btn-ghost"
                        style={{ width: '100%', display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: '12px' }}
                    >
                        {isSidebarCollapsed ? <ChevronRight size={20} /> : <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><ChevronLeft size={20} /> <span>Collapse</span></div>}
                    </button>
                </div>
            </aside>

            <div className="layout-root">
                {/* Top Bar - Reality Mode Controls */}
                <TopBar />

                {/* Main Content Area */}
                <main className="layout-main">
                    {/* Replay Banner */}
                    <ReplayModeBanner />

                    {/* Replay Timeline */}
                    <ReplayTimelineView />


                    {/* AI Advisory Panel - Contextual Overlay */}
                    <AIAdvisoryPanel
                        isOpen={isPanelOpen}
                        onClose={closePanel}
                        session={currentSession}
                    />


                    {/* Full Page Views */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {activeTab === 'operations' && <OperationsDashboard />}
                        {activeTab === 'signals' && <SignalsDashboard />}
                        {activeTab === 'attention' && <AttentionDashboard />}
                        {activeTab === 'data-entry' && <DataEntryForm />}
                        {activeTab === 'comparison' && <ScenarioComparisonView onClose={() => setActiveTab('map')} />}

                        {activeTab === 'decisions' && (
                            <div className="glass-panel" style={{ position: 'absolute', inset: 0, zIndex: 950, display: 'flex', flexDirection: 'column' }}>
                                <div className="panel-header">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-accent" />
                                        <span className="text-gradient">Decision Journal</span>
                                    </div>
                                    <button onClick={() => setActiveTab('map')} className="btn-ghost"><X size={20} /></button>
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <DecisionHistoryView />
                                </div>
                            </div>
                        )}

                        {activeTab === 'workflows' && <WorkflowManager />}
                        {activeTab === 'tasks' && <MyTasksPanel />}

                        {/* Three Panel Layout (Map + Side Panels) */}
                        {['map', 'entities', 'ontology', 'audit'].includes(activeTab) && (
                            <div className="three-panel-container" style={{ width: '100%', height: '100%' }}>
                                <ContextPanel />
                                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <SpatialViewRouter />
                                    {/* Visualization Controls - Floating over the map only */}
                                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                                        <VisualizationControls />
                                    </div>
                                </div>
                                <EntityDetail entityId={selectedEntityId} />

                                {/* Scenario Panel - Floating Right Panel */}
                                {activeScenario && (
                                    <div className="animate-slide-in" style={{ position: 'absolute', top: '20px', right: '420px', bottom: '80px', width: '400px', zIndex: 900 }}>
                                        <ScenarioPanel />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Bottom Bar - Time Controls */}
                <BottomBar />
            </div>

        </div>
    );
};

export default AppLayout;
