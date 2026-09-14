import React, { useState } from "react";
import { 
  GitCommit, ArrowDown, AlertTriangle, CheckCircle2, 
  Sparkles, Zap, ShieldAlert, Clock, Info, ShieldCheck, 
  Flame, Activity, Compass, ArrowRight, CornerDownRight
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function CausalCascadeGraph({ cascadeData = null, whatBreaksFirst = null, explanation = null }) {
  const { 
    activeDomain, 
    domainResults,
    onApplyRecommendation,
    showToast
  } = useFutureView();

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isInterventionActive, setIsInterventionActive] = useState(false);

  const activeCascade = cascadeData || domainResults?.cascade || [
    {
      id: "c1",
      label: "Intervention Input Trigger",
      severity: "info",
      time_min: 0,
      impact: "Mutation applied to baseline operational state.",
      evidence: "Physical coordinate / demand variation."
    },
    {
      id: "c2",
      label: "Primary Vector Disruption",
      severity: "warning",
      time_min: 8,
      impact: "Flow impedance concentrates around primary arterial bottleneck.",
      evidence: "Velocity drag telemetry marker."
    },
    {
      id: "c3",
      label: "Secondary Capacity Saturation",
      severity: "critical",
      time_min: 19,
      impact: "Downstream resources absorb 70% excess demand surge.",
      evidence: "Queue length & saturation threshold."
    },
    {
      id: "c4",
      label: "Systemic Metric Impact",
      severity: "critical",
      time_min: 35,
      impact: "Composite decision score degraded below optimal tolerance.",
      evidence: "Multi-criteria Pareto evaluation."
    }
  ];

  const activeBreaks = whatBreaksFirst || domainResults?.what_breaks_first || [
    { rank: 1, failure_name: "Primary Ingress Corridor", time_min: 8, severity: "CRITICAL", affected_entity: "Main Concourse", impact_summary: "Density exceeds ergonomic threshold." },
    { rank: 2, failure_name: "Secondary Service Node", time_min: 16, severity: "HIGH", affected_entity: "Triage Intake", impact_summary: "Queue spillback into circulation aisle." },
    { rank: 3, failure_name: "Egress Transition Apron", time_min: 27, severity: "MEDIUM", affected_entity: "South Gate", impact_summary: "Clearance delay increases by 38%." }
  ];

  const activeExp = explanation || domainResults?.explanation || {
    cause: "Counterfactual parameter change applied to active system.",
    primary_effect: "Direct physical & flow redistribution across connected nodes.",
    secondary_effect: "Bottleneck pressure shifts to secondary feeder pathways.",
    tertiary_effect: "Downstream service capacities become saturated.",
    final_impact: "Systemic performance verdict calculated by simulation physics."
  };

  const selectedNode = activeCascade.find((n) => n.id === selectedNodeId) || activeCascade[1] || activeCascade[0];

  return (
    <div className="causalCascadeContainer">
      {/* 1. Header Ribbon */}
      <div className="cascadeTopHeader">
        <div className="cascadeHeaderLeft">
          <div className="moduleBadge cyan">
            <GitCommit size={14} />
            <span>CAUSAL GRAPH & CASCADING CONSEQUENCES</span>
          </div>
          <h3 className="cascadeTitle">Autonomous Causal Propagation Graph</h3>
          <span className="cascadeSubtitle">
            Deterministic cascade tracking from initial trigger to multi-order systemic consequences.
          </span>
        </div>

        {/* Intervention Toggle Button */}
        <button
          className={`primaryBtn small ${isInterventionActive ? "activeInterventionBtn" : "glowBtn"}`}
          onClick={() => {
            const nextState = !isInterventionActive;
            setIsInterventionActive(nextState);
            if (nextState) {
              if (onApplyRecommendation) onApplyRecommendation();
              showToast("Applied Cascade Isolation Intervention! Secondary stress mitigated.", "success");
            } else {
              showToast("Reset to Unmitigated Counterfactual Cascade.", "info");
            }
          }}
        >
          <Sparkles size={14} />
          <span>{isInterventionActive ? "INTERVENTION ENGAGED (CASCADE HALTED)" : "TEST CASCADE-STOPPING INTERVENTION"}</span>
        </button>
      </div>

      {/* 2. Main Two-Column View: Cascade Graph Nodes + Telemetry Inspector */}
      <div className="cascadeMainGrid">
        {/* Left: Dynamic Causal DAG Flow */}
        <div className="cascadeFlowColumn">
          <div className="cascadeNodesList">
            {activeCascade.map((node, index) => {
              const isSelected = selectedNodeId === node.id || (!selectedNodeId && index === 1);
              const isHalted = isInterventionActive && index >= 2;

              return (
                <div key={node.id} className="cascadeStepWrapper">
                  <div
                    className={`cascadeCard ${node.severity} ${isSelected ? "selected" : ""} ${isHalted ? "halted" : ""}`}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <div className="cascadeCardHead">
                      <div className="cascadeTimeBadge">
                        <Clock size={12} />
                        <span>T+{node.time_min} MIN</span>
                      </div>
                      <span className={`cascadeSeverityPill ${node.severity}`}>
                        {isHalted ? "INTERCEPTED" : node.severity.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="cascadeNodeLabel">{node.label}</h4>
                    <p className="cascadeNodeImpact">{node.impact}</p>

                    <div className="cascadeNodeFoot">
                      <span className="cascadeEvidenceTag">Evidence: {node.evidence}</span>
                    </div>
                  </div>

                  {index < activeCascade.length - 1 && (
                    <div className={`cascadeConnectorArrow ${isHalted ? "halted" : ""}`}>
                      <ArrowDown size={16} />
                      <span className="connectorLabel">
                        {isHalted ? "CASCADE BLOCKED" : `PROPAGATES (+${activeCascade[index + 1].time_min - node.time_min}m)`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: "What Breaks First?" & Causal Explanation Dossier */}
        <div className="cascadeSideColumn">
          {/* A. What Breaks First Card */}
          <div className="whatBreaksCard">
            <div className="whatBreaksHead">
              <ShieldAlert size={16} className="iconRed" />
              <h4>WHAT BREAKS FIRST?</h4>
              <span className="breaksSub">Ranked by Time-to-Failure</span>
            </div>

            <div className="breaksList">
              {activeBreaks.map((b) => (
                <div key={b.rank} className={`breakItem ${b.severity.toLowerCase()}`}>
                  <div className="breakRank">{b.rank < 10 ? `0${b.rank}` : b.rank}</div>
                  <div className="breakDetails">
                    <div className="breakItemTop">
                      <b className="breakName">{b.failure_name}</b>
                      <span className="breakTime">T+{b.time_min} min</span>
                    </div>
                    <span className="breakEntity">Target: {b.affected_entity}</span>
                    <p className="breakSummary">{b.impact_summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. Causal Explanation (WHY?) */}
          <div className="causalExplanationCard">
            <div className="expCardHead">
              <Info size={15} className="iconCyan" />
              <h4>ROOT CAUSE & TELEMETRY CHAIN (WHY?)</h4>
            </div>

            <div className="expChainList">
              <div className="expStep">
                <small className="cyan">01. ROOT CAUSE</small>
                <p>{activeExp.cause}</p>
              </div>
              <div className="expStep">
                <small className="amber">02. PRIMARY EFFECT</small>
                <p>{activeExp.primary_effect}</p>
              </div>
              <div className="expStep">
                <small className="red">03. SECONDARY EFFECT</small>
                <p>{activeExp.secondary_effect}</p>
              </div>
              <div className="expStep">
                <small className="purple">04. TERTIARY EFFECT</small>
                <p>{activeExp.tertiary_effect}</p>
              </div>
              <div className="expStep">
                <small className="green">05. FINAL CONSEQUENCE</small>
                <p>{activeExp.final_impact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
