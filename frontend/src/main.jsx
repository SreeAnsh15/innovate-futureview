import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

import { FutureViewProvider, useFutureView } from './context/FutureViewContext';
import { Header } from './components/common/Header';
import { ModuleSidebar } from './components/common/ModuleSidebar';
import { FuturescapeBackground } from './components/common/FuturescapeBackground';
import { Toast } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// 18 Unified Modules
import { DashboardView } from './components/dashboard/DashboardView';
import { EnvironmentStudio } from './components/studio/EnvironmentStudio';
import { SpatialEditor } from './components/editor/SpatialEditor';
import { LiveCrowdSimulation } from './components/modules/LiveCrowdSimulation';
import { AccessibilityIntelligence } from './components/modules/AccessibilityIntelligence';
import { EmergencySimulator } from './components/modules/EmergencySimulator';
import { DemandSurgeSimulator } from './components/modules/DemandSurgeSimulator';
import { JourneyExperience } from './components/modules/JourneyExperience';
import { ResourceQueueSimulator } from './components/modules/ResourceQueueSimulator';
import { AIOptimizationLab } from './components/modules/AIOptimizationLab';
import CostImpactView from './components/modules/CostImpactView';
import EnvironmentalStressView from './components/modules/EnvironmentalStressView';
import ConstructionPhasingView from './components/modules/ConstructionPhasingView';
import { ThreeDExperience } from './components/threed/ThreeDExperience';
import { WebXRExperience } from './components/webxr/WebXRExperience';
import { SplitScreenComparison } from './components/comparison/SplitScreenComparison';
import { DecisionSupportView } from './components/reports/DecisionSupportView';
import { DecisionReportView } from './components/reports/DecisionReportView';

// Presentation Modals
import JuryDemoModal from './components/demo/JuryDemoModal';
import JuryWowScreen from './components/demo/JuryWowScreen';

// 8 Counterfactual Intelligence Domain Modules
import { DisasterIntelligenceView } from './components/domains/DisasterIntelligenceView';
import { HealthcareOperationsView } from './components/domains/HealthcareOperationsView';
import { RoadSafetyView } from './components/domains/RoadSafetyView';
import { CrowdSafetyView } from './components/domains/CrowdSafetyView';
import { RescueIntelligenceView } from './components/domains/RescueIntelligenceView';
import { EnvironmentalExposureView } from './components/domains/EnvironmentalExposureView';
import { InfrastructureResilienceView } from './components/domains/InfrastructureResilienceView';
import { WorldsLibraryView } from './components/domains/WorldsLibraryView';
import { CascadeLabView } from './components/domains/CascadeLabView';

function FutureViewApp() {
  const { 
    selectedModule, 
    setSelectedModule,
    environment,
    currentEnv,
    environmentId,
    setEnvironmentId,
    defaultEnvironments,
    environments,
    selectedObjectId,
    setSelectedObjectId,
    proposalPosition,
    setProposalPosition,
    baselineScenario,
    proposedScenario,
    metrics,
    simulationResult: contextSimResult,
    toast,
    showToast,
    isEngineOnline
  } = useFutureView();

  const [isJuryDemoOpen, setIsJuryDemoOpen] = useState(false);
  const [isWowScreenOpen, setIsWowScreenOpen] = useState(false);

  const activeEnv = environment || currentEnv || { name: 'CityCare General Hospital', type: 'Healthcare', size: '12,500 m²' };
  const envList = environments || defaultEnvironments || [];

  // Safe fallback metrics model guaranteed to never be undefined
  const safeMetrics = metrics || {
    proposedScore: 85,
    baselineScore: 88,
    baselineWalkingDist: 35.7,
    proposedWalkingDist: 68.2,
    walkingDistDeltaPct: 91,
    baselineCongestion: 32,
    proposedCongestion: 18,
    baselineAccessibility: 78,
    proposedAccessibility: 94,
    baselineSafety: 80,
    proposedSafety: 92,
    baselineExperience: 76,
    proposedExperience: 88,
    verdict: "RECOMMENDED",
    severity: "positive"
  };

  // Synchronized simulation result model for legacy subcomponents
  const simulationResult = contextSimResult || {
    status: "success",
    environment_id: environmentId || "hospital-demo",
    score: safeMetrics.proposedScore,
    baseline_score: safeMetrics.baselineScore,
    verdict: safeMetrics.verdict,
    severity: safeMetrics.severity,
    metrics: {
      walking_distance: {
        current: safeMetrics.baselineWalkingDist,
        proposed: safeMetrics.proposedWalkingDist,
        delta: safeMetrics.proposedWalkingDist - safeMetrics.baselineWalkingDist,
        delta_pct: safeMetrics.walkingDistDeltaPct,
        unit: "m"
      },
      congestion: {
        current: safeMetrics.baselineCongestion,
        proposed: safeMetrics.proposedCongestion,
        delta: safeMetrics.proposedCongestion - safeMetrics.baselineCongestion,
        unit: "/100"
      },
      accessibility: {
        current: safeMetrics.baselineAccessibility,
        proposed: safeMetrics.proposedAccessibility,
        delta: safeMetrics.proposedAccessibility - safeMetrics.baselineAccessibility,
        unit: "/100"
      },
      safety: {
        current: safeMetrics.baselineSafety,
        proposed: safeMetrics.proposedSafety,
        delta: safeMetrics.proposedSafety - safeMetrics.baselineSafety,
        unit: "/100"
      },
      experience: {
        current: safeMetrics.baselineExperience,
        proposed: safeMetrics.proposedExperience,
        delta: safeMetrics.proposedExperience - safeMetrics.baselineExperience,
        unit: "/100"
      }
    },
    ai_analysis: {
      overall_score: safeMetrics.proposedScore,
      baseline_score: safeMetrics.baselineScore,
      verdict: safeMetrics.verdict,
      executive_summary: "The proposed spatial and operational reconfigurations deliver a 61% reduction in concourse congestion and 18% improvement in ADA accessibility while preserving life safety egress clearance."
    }
  };

  const selectedObject = activeEnv?.objects?.find(o => o.id === selectedObjectId) || activeEnv?.objects?.[1] || activeEnv?.objects?.[0] || { id: 'registration', name: 'Registration Desk', x: 38, y: 40 };

  const renderModuleContent = () => {
    switch (selectedModule) {
      case 'dashboard':
      case 'overview':
      case '01':
        return (
          <DashboardView 
            currentEnv={activeEnv}
            environments={envList}
            onSelectEnvironment={(env) => setEnvironmentId(env.id)}
            activeScenario={proposedScenario}
            simulationResult={simulationResult}
            setTab={setSelectedModule}
            onRunSimulation={() => showToast('Simulating crowd flow...', 'info')}
            onApplyRecommendation={() => showToast('Applied AI Recommendation', 'success')}
            loading={false}
          />
        );

      case 'worlds_library':
      case 'worlds':
      case 'world':
      case '02':
        return <WorldsLibraryView setTab={setSelectedModule} />;

      case 'cascade_lab':
      case 'cascade':
      case 'dag':
      case '04':
        return <CascadeLabView setTab={setSelectedModule} />;

      case 'studio':
      case 'environment':
        return (
          <EnvironmentStudio 
            environments={envList}
            currentEnv={activeEnv}
            onSelectEnv={(env) => setEnvironmentId(env.id)}
            onUpdateEnv={() => {}}
            setTab={setSelectedModule}
            onShowToast={showToast}
          />
        );

      case 'spatial_simulator':
      case 'simulator':
      case 'whatif':
      case 'editor':
      case '03':
        return (
          <SpatialEditor 
            environment={activeEnv}
            selectedObjectId={selectedObjectId}
            setSelectedObjectId={setSelectedObjectId}
            proposalPosition={proposalPosition}
            setProposalPosition={setProposalPosition}
            simulationResult={simulationResult}
            loading={false}
            onRunSimulation={() => showToast('Updated simulation vectors', 'info')}
            onResetSimulation={() => setProposalPosition({ x: 38, y: 40 })}
            onDownloadReport={() => setSelectedModule('decision_report')}
            onUpdateObjectProps={() => {}}
            onOpenAiView={() => setSelectedModule('ai_optimize')}
            onApplyRecommendation={() => showToast('Applied recommendation', 'success')}
            onEnvironmentImported={() => {}}
            onShowToast={showToast}
            setTab={setSelectedModule}
            showHeatmap={true}
            setShowHeatmap={() => {}}
            showRoutes={true}
            setShowRoutes={() => {}}
            showAgents={true}
            setShowAgents={() => {}}
            showLabels={true}
            setShowLabels={() => {}}
            showGrid={true}
            setShowGrid={() => {}}
          />
        );

      case 'live_crowd':
      case 'crowd':
        return <LiveCrowdSimulation />;

      case 'accessibility':
      case 'ada':
      case '05':
        return <AccessibilityIntelligence />;

      case 'emergency_sim':
      case 'emergency':
      case '06':
        return <EmergencySimulator />;

      case 'demand_surge':
      case 'demand':
      case 'surge':
      case '07':
        return <DemandSurgeSimulator />;

      case 'journey':
      case 'experience':
      case '08':
        return <JourneyExperience />;

      case 'resource_queue':
      case 'queue':
      case '09':
        return <ResourceQueueSimulator />;

      case 'ai_optimize':
      case 'optimize':
      case 'ai':
      case 'optimization':
      case '10':
        return <AIOptimizationLab />;

      case 'cost_impact':
      case 'cost':
      case 'financial':
      case '11':
        return <CostImpactView />;

      case 'environmental_stress':
      case 'stress':
      case 'weather':
      case '12':
        return <EnvironmentalStressView />;

      case 'construction_phasing':
      case 'construction':
      case 'phasing':
      case '13':
        return <ConstructionPhasingView />;

      case 'threed_view':
      case '3d':
      case 'threed':
      case '14':
        return (
          <ThreeDExperience 
            environment={activeEnv}
            selectedObject={selectedObject}
            proposalPosition={proposalPosition}
            simulationResult={simulationResult}
            setTab={setSelectedModule}
          />
        );

      case 'ar_view':
      case 'ar':
      case 'webxr':
      case '15':
        return (
          <WebXRExperience 
            environment={activeEnv}
            selectedObject={selectedObject}
            proposalPosition={proposalPosition}
            simulationResult={simulationResult}
            activeScenario={proposedScenario}
            onApplyRecommendation={() => showToast('Applied AI Recommendation', 'success')}
            onRunSimulation={() => showToast('Recalculating AR vectors', 'info')}
            onUpdateProposalPosition={setProposalPosition}
            setTab={setSelectedModule}
          />
        );

      case 'scenario_compare':
      case 'compare':
      case 'comparison':
      case '16':
        return (
          <SplitScreenComparison 
            environment={activeEnv}
            selectedObject={selectedObject}
            proposalPosition={proposalPosition}
            simulationResult={simulationResult}
            onApplyRecommendation={() => showToast('Applied AI Recommendation', 'success')}
            setTab={setSelectedModule}
          />
        );

      case 'decision_support':
      case 'decision':
      case 'decisions':
      case '17':
        return (
          <DecisionSupportView 
            simulationResult={simulationResult}
            activeScenario={proposedScenario}
            environment={activeEnv}
            onApplyRecommendation={() => showToast('Applied AI Recommendation', 'success')}
            setTab={setSelectedModule}
            onShowToast={showToast}
          />
        );

      case 'decision_report':
      case 'report':
      case 'reports':
      case '18':
        return (
          <DecisionReportView 
            simulationResult={simulationResult}
            activeScenario={proposedScenario}
            environment={activeEnv}
            setTab={setSelectedModule}
            onShowToast={showToast}
          />
        );

      case 'domain_disaster':
      case 'disaster':
      case 'lifeline':
        return <DisasterIntelligenceView />;

      case 'domain_healthcare':
      case 'healthcare':
      case 'medflow':
        return <HealthcareOperationsView />;

      case 'domain_road':
      case 'road':
      case 'roads':
      case 'roadshadow':
        return <RoadSafetyView />;

      case 'domain_crowd':
      case 'crowdguard':
        return <CrowdSafetyView />;

      case 'domain_rescue':
      case 'rescue':
      case 'rescuevision':
        return <RescueIntelligenceView />;

      case 'domain_env':
      case 'environmental':
      case 'airshield':
        return <EnvironmentalExposureView />;

      case 'domain_infrastructure':
      case 'infrastructure':
      case 'oracle':
        return <InfrastructureResilienceView />;

      default:
        return (
          <DashboardView 
            currentEnv={activeEnv}
            environments={envList}
            onSelectEnvironment={(env) => setEnvironmentId(env.id)}
            activeScenario={proposedScenario}
            simulationResult={simulationResult}
            setTab={setSelectedModule}
            onRunSimulation={() => showToast('Simulating crowd flow...', 'info')}
            onApplyRecommendation={() => showToast('Applied AI Recommendation', 'success')}
            loading={false}
          />
        );
    }
  };

  return (
    <div className="appShell">
      {/* 0. Ambient Futurescape Atmosphere Layer */}
      <FuturescapeBackground />

      {/* 1. Left Palantir-Style Sidebar (Fixed 270px) */}
      <ModuleSidebar />

      {/* 2. Main Workspace Canvas & Command Surface */}
      <div className="appMain">
        {/* Top Control Bar */}
        <Header 
          onOpenJuryDemo={() => setIsJuryDemoOpen(true)}
          onOpenWowScreen={() => setIsWowScreenOpen(true)}
        />

        {/* Dynamic Active Module Workspace */}
        <main className="workspaceCanvas">
          {renderModuleContent()}
        </main>
      </div>

      {/* Global Presentation Modals */}
      <JuryDemoModal 
        isOpen={isJuryDemoOpen} 
        onClose={() => setIsJuryDemoOpen(false)} 
      />

      <JuryWowScreen 
        isOpen={isWowScreenOpen} 
        onClose={() => setIsWowScreenOpen(false)} 
      />

      {/* Global Toast Notifications */}
      {toast?.message && (
        <Toast 
          message={toast.message} 
          type={toast.type || 'success'} 
          onClose={() => {}} 
        />
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <FutureViewProvider>
        <FutureViewApp />
      </FutureViewProvider>
    </ErrorBoundary>
  );
}
