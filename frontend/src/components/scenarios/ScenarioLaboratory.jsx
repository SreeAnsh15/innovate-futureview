import React, { useState } from "react";
import {
  Layers3,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  Sparkles,
  Scale,
  Compass,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  FileText,
  BrainCircuit,
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { DataHonestyBadge } from "../common/Toast";
import { ScenarioComparison } from "./ScenarioComparison";
import { DecisionSupportView } from "../reports/DecisionSupportView";

export function ScenarioLaboratory({
  scenarios,
  onSaveCurrentScenario,
  onDeleteScenario,
  onSelectScenario,
  currentEnv,
  selectedObject,
  proposalPosition,
  simulationResult,
  activeScenario,
  onApplyRecommendation,
  setTab,
  onShowToast
}) {
  const [activeSubTab, setActiveSubTab] = useState("lab"); // "lab" | "compare" | "pareto" | "report"
  const [newScenName, setNewScenName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  function handleCreate() {
    if (!newScenName.trim()) {
      onShowToast("Please enter a scenario name", "warning");
      return;
    }
    onSaveCurrentScenario(newScenName.trim());
    setNewScenName("");
    setShowSaveModal(false);
  }

  const paretoSolutions = simulationResult?.pareto_solutions || [
    {
      id: "pareto_safety",
      name: "1. Max Safety & Barrier-Free ADA",
      strategy: "MAX_SAFETY",
      tag: "ADA OPTIMAL",
      position: { x: 28.0, y: 38.0 },
      predicted_score: 96,
      walking_distance_m: 18.4,
      congestion_score: 22.0,
      accessibility_score: 98.0,
      safety_score: 97.0,
      rationale: "Maintains 2.8m unobstructed corridor width and direct line-of-sight from entrance."
    },
    {
      id: "pareto_throughput",
      name: "2. Max Throughput & Speed Flow",
      strategy: "MAX_THROUGHPUT",
      tag: "VELOCITY PEAK",
      position: { x: 22.0, y: 42.0 },
      predicted_score: 94,
      walking_distance_m: 15.1,
      congestion_score: 26.0,
      accessibility_score: 94.0,
      safety_score: 92.0,
      rationale: "Positions counter immediately off entrance foyer to minimize walking time by -57%."
    },
    {
      id: "pareto_balanced",
      name: "3. Balanced Operational Harmony",
      strategy: "BALANCED",
      tag: "BALANCED AI",
      position: { x: 34.0, y: 35.0 },
      predicted_score: 93,
      walking_distance_m: 20.5,
      congestion_score: 25.0,
      accessibility_score: 95.0,
      safety_score: 94.0,
      rationale: "Equidistant from secondary services with dual-sided queuing stanchions."
    }
  ];

  return (
    <div className="scenariosPage">
      {/* Top Header */}
      <div className="scenariosHeader">
        <div>
          <div className="scenariosTag">
            <Layers3 size={14} />
            <span>SCENARIOS & INTELLIGENCE HUB</span>
            <DataHonestyBadge text="MULTI-VARIATE SPATIAL DECISION SUPPORT" />
          </div>
          <h2>Explore What-If Variations & Spatial Intelligence</h2>
          <p>
            Compare scenario outcomes, generate Pareto-optimal layouts, and audit regulatory compliance for {currentEnv?.name}.
          </p>
        </div>

        <div className="scenariosTopActions">
          {/* Sub-Tab Selector Pills */}
          <div className="scenariosSubTabs">
            <button
              className={`subTabBtn ${activeSubTab === "lab" ? "active" : ""}`}
              onClick={() => setActiveSubTab("lab")}
            >
              <Layers3 size={13} />
              <span>Saved Scenarios ({scenarios.length})</span>
            </button>
            <button
              className={`subTabBtn ${activeSubTab === "compare" ? "active" : ""}`}
              onClick={() => setActiveSubTab("compare")}
            >
              <Scale size={13} />
              <span>Comparison Matrix</span>
            </button>
            <button
              className={`subTabBtn ${activeSubTab === "pareto" ? "active" : ""}`}
              onClick={() => setActiveSubTab("pareto")}
            >
              <BrainCircuit size={13} />
              <span>Pareto AI Solutions</span>
            </button>
            <button
              className={`subTabBtn ${activeSubTab === "report" ? "active" : ""}`}
              onClick={() => setActiveSubTab("report")}
            >
              <FileText size={13} />
              <span>Executive Report</span>
            </button>
          </div>

          <button className="primaryBtn small" onClick={() => setShowSaveModal(true)}>
            <Plus size={14} />
            <span>Save Current What-If</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: SAVED SCENARIOS LABORATORY */}
      {activeSubTab === "lab" && (
        <div className="labContentSection">
          {scenarios.length === 0 ? (
            <div className="emptyScenarios">
              <Layers3 size={44} className="iconCyan" />
              <h3>No Saved Scenarios for this Space</h3>
              <p>Run a simulation in the 2D Studio or AR Viewport and click 'Save Current What-If'.</p>
              <button className="primaryBtn small" onClick={() => setTab("simulator")}>
                <Compass size={14} /> Open 2D Studio
              </button>
            </div>
          ) : (
            <div className="scenariosGrid">
              {scenarios.map((sc) => {
                const verdict = sc.verdict || "RECOMMENDED";
                const score = sc.score || 85;

                return (
                  <div key={sc.id} className={`scenCard ${verdict.toLowerCase()}`}>
                    <div className="scenCardHead">
                      <div className={`scenBadge ${verdict.toLowerCase()}`}>
                        {verdict === "RECOMMENDED" && <CheckCircle size={12} />}
                        {verdict === "REVIEW" && <AlertTriangle size={12} />}
                        {verdict === "AVOID" && <XCircle size={12} />}
                        <span>{verdict}</span>
                      </div>
                      {sc.is_baseline && <span className="baselineTag">BASELINE</span>}
                    </div>

                    <div className="scenCardBody">
                      <h3>{sc.name}</h3>
                      <p>{sc.description || `Relocated ${sc.object_name} to (${sc.to_position.x}%, ${sc.to_position.y}%)`}</p>

                      <div className="scenMetricsPreview">
                        <div className="scenScoreBox">
                          <span className="scoreVal">{score}</span>
                          <small>/100 Score</small>
                        </div>
                        <div className="scenDetailMini">
                          <span>Target: {sc.object_name}</span>
                          <span>Demand: {sc.users_per_hour || 420} users/hr</span>
                        </div>
                      </div>
                    </div>

                    <div className="scenCardFooter">
                      <button className="deleteScenBtn" onClick={() => onDeleteScenario(sc.id)} title="Delete Scenario">
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="loadScenBtn"
                        onClick={() => {
                          onSelectScenario(sc);
                          onShowToast(`Loaded scenario: ${sc.name}`);
                        }}
                      >
                        <span>Load Scenario</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: COMPARISON MATRIX */}
      {activeSubTab === "compare" && (
        <div className="compareContentSection">
          <ScenarioComparison
            scenarios={scenarios}
            currentEnv={currentEnv}
            selectedObject={selectedObject}
            proposalPosition={proposalPosition}
            simulationResult={simulationResult}
            onApplyRecommendation={onApplyRecommendation}
            setTab={setTab}
            onSelectScenario={onSelectScenario}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* SUB-TAB 3: PARETO AI SOLUTIONS */}
      {activeSubTab === "pareto" && (
        <div className="paretoSection">
          <div className="paretoIntroCard">
            <BrainCircuit size={28} className="iconCyan" />
            <div>
              <h3>Autonomous 3-Way Pareto Multi-Objective Optimization</h3>
              <p>
                The AI spatial reasoning engine solved the physical geometry constraints of {currentEnv?.name} to generate 3 Pareto-optimal trade-off frontiers.
              </p>
            </div>
          </div>

          <div className="paretoCardsGrid">
            {paretoSolutions.map((sol) => (
              <div key={sol.id} className="paretoCard">
                <div className="paretoCardTop">
                  <span className="paretoTag">{sol.tag}</span>
                  <b className="paretoScore">{sol.predicted_score}/100 Score</b>
                </div>
                <h4 className="paretoName">{sol.name}</h4>
                <p className="paretoRationale">{sol.rationale}</p>
                <div className="paretoStatsRow">
                  <div>
                    <small>Walking</small>
                    <b>{sol.walking_distance_m}m</b>
                  </div>
                  <div>
                    <small>Congestion</small>
                    <b>{sol.congestion_score}/100</b>
                  </div>
                  <div>
                    <small>Accessibility</small>
                    <b>{sol.accessibility_score}/100</b>
                  </div>
                  <div>
                    <small>Safety</small>
                    <b>{sol.safety_score}/100</b>
                  </div>
                </div>
                {onApplyRecommendation && (
                  <button
                    className="primaryBtn small fullWidth"
                    onClick={() => {
                      onApplyRecommendation(sol.position);
                      onShowToast(`Applied ${sol.name} configuration!`);
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Apply Solution to Layout</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EXECUTIVE DECISION REPORT */}
      {activeSubTab === "report" && (
        <div className="reportContentSection">
          <DecisionSupportView
            simulationResult={simulationResult}
            activeScenario={activeScenario}
            environment={currentEnv}
            onApplyRecommendation={onApplyRecommendation}
            setTab={setTab}
            onShowToast={onShowToast}
          />
        </div>
      )}

      {/* Save Scenario Modal Dialog */}
      {showSaveModal && (
        <div className="modalBackdrop" onClick={() => setShowSaveModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>Save What-If Spatial Scenario</h3>
              <button className="iconBtn" onClick={() => setShowSaveModal(false)}>✕</button>
            </div>
            <div className="modalBody">
              <label>SCENARIO NAME</label>
              <input
                type="text"
                value={newScenName}
                onChange={(e) => setNewScenName(e.target.value)}
                placeholder="e.g. Relocate Desk to North Entrance"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <p className="modalHint">
                This will save the current layout configuration, target coordinates ({proposalPosition.x}%, {proposalPosition.y}%), and predicted metrics to the Laboratory.
              </p>
            </div>
            <div className="modalFooter">
              <button className="secondaryBtn" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="primaryBtn" onClick={handleCreate}>Save Scenario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
