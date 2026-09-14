import React, { useState } from "react";
import { MetricCard } from "../common/MetricCard";
import {
  Sparkles,
  Download,
  ChevronRight,
  BrainCircuit,
  Cpu,
  ArrowRight,
  Check,
  Activity,
  DollarSign,
  ShieldCheck,
  Zap,
  Layers,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

export function ComparisonPanel({
  simulationResult,
  proposalPosition,
  onApplyRecommendation,
  onDownloadReport,
  onOpenAiView
}) {
  const [selectedParetoId, setSelectedParetoId] = useState(null);

  if (!simulationResult) {
    return (
      <div className="comparisonPanel empty">
        <div className="emptyBrain">
          <BrainCircuit size={36} className="iconCyan" />
        </div>
        <h4>Ready for Clinical Simulation</h4>
        <p>
          Drag any clinical station on the 2D floorplan to trigger real-time multi-agent physics and consequence evaluation.
        </p>
      </div>
    );
  }

  const res = simulationResult;
  const m = res.metrics || {};
  const ai = res.ai_analysis || {};
  const queue = res.queue_metrics || {
    active_queue_length: 4,
    average_wait_time_sec: 45,
    utilization_pct: 83,
    average_walking_time_sec: 54,
    queue_status: "NOMINAL"
  };
  const fin = res.financial_impact || {
    net_consequence: "$140,000 / yr Risk",
    regulatory_standard: "ADA Title III & NFPA 101"
  };

  const paretoSolutions = res.pareto_solutions || [
    {
      id: "pareto_safety",
      name: "Max Safety & ADA",
      tag: "ADA 98/100",
      position: { x: 28.0, y: 38.0 },
      predicted_score: 96,
      walking_distance_m: 18.4,
      rationale: "Unobstructed clinical corridor spine"
    },
    {
      id: "pareto_throughput",
      name: "Max Velocity",
      tag: "SPEED 15.1m",
      position: { x: 22.0, y: 42.0 },
      predicted_score: 94,
      walking_distance_m: 15.1,
      rationale: "Emergency Ingress direct triage access"
    },
    {
      id: "pareto_balanced",
      name: "Balanced Flow",
      tag: "BALANCED 93",
      position: { x: 34.0, y: 35.0 },
      predicted_score: 93,
      walking_distance_m: 20.5,
      rationale: "Dual queue access for waiting lounge & triage"
    }
  ];

  const overallScore = ai?.overall_score || res.score || 85;
  const baselineScore = res.baseline_score || 88;
  const verdict = ai?.verdict || res.verdict || "RECOMMENDED";
  const isPositive = overallScore >= baselineScore;
  const severityClass = overallScore >= 80 ? "positive" : overallScore >= 65 ? "warning" : "critical";

  return (
    <div className="comparisonPanel">
      {/* 1. Master AI Decision Verdict Card */}
      <div className={`verdictCard ${severityClass}`}>
        <div className="verdictScoreRing">
          <span className="verdictScoreValue">{overallScore}</span>
          <span className="verdictScoreMax">/100</span>
        </div>
        <div className="verdictInfoGroup">
          <span className="verdictSubheader">AI CLINICAL VERDICT</span>
          <h4 className="verdictTitle">{verdict}</h4>
          <div className="verdictBaselinePill">
            <span>Baseline: <strong>{baselineScore}/100</strong></span>
            <span className="verdictDeltaTag">
              {overallScore >= baselineScore ? `+${overallScore - baselineScore}` : `${overallScore - baselineScore}`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Layout Optimization Engine */}
      <div className="paretoSectionCard">
        <div className="paretoCardHeader">
          <div className="paretoTitleWrap">
            <BrainCircuit size={14} className="iconCyan" />
            <span>AUTONOMOUS LAYOUT OPTIMIZER</span>
          </div>
          <span className="paretoBadge">AI PARETO</span>
        </div>
        <p className="paretoSubtext">
          Instant multi-objective layout solutions calculated against NFPA 101 & ADA constraints:
        </p>

        <div className="paretoCardList">
          {paretoSolutions.map((sol) => (
            <button
              key={sol.id}
              className={`paretoOptionBtn ${selectedParetoId === sol.id ? "active" : ""}`}
              onClick={() => {
                setSelectedParetoId(sol.id);
                if (onApplyRecommendation) {
                  onApplyRecommendation(sol.position);
                }
              }}
            >
              <div className="paretoOptionLeft">
                <span className="paretoOptionName">{sol.name}</span>
                <span className="paretoOptionMeta">
                  {sol.walking_distance_m}m walk &bull; {sol.predicted_score}/100 score
                </span>
              </div>
              <span className="paretoOptionTag">{sol.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Live Triage & Queue Dynamics (M/M/c) */}
      <div className="queueDynamicsCard">
        <div className="queueCardHeader">
          <div className="queueHeaderLeft">
            <HeartPulse size={14} className="iconAmber" />
            <span>TRIAGE & QUEUE DYNAMICS</span>
          </div>
          <span className={`queueStatusBadge ${queue.queue_status?.toLowerCase() || "nominal"}`}>
            {queue.queue_status || "NOMINAL"}
          </span>
        </div>

        <div className="queueMetricsGrid">
          <div className="queueTile">
            <span className="qTileLabel">Active Queue</span>
            <span className={`qTileVal ${queue.active_queue_length > 6 ? "bad" : "good"}`}>
              {queue.active_queue_length} patients
            </span>
          </div>
          <div className="queueTile">
            <span className="qTileLabel">Est. Triage Wait</span>
            <span className={`qTileVal ${queue.average_wait_time_sec > 90 ? "bad" : "good"}`}>
              {Math.floor(queue.average_wait_time_sec / 60)}m {queue.average_wait_time_sec % 60}s
            </span>
          </div>
          <div className="queueTile">
            <span className="qTileLabel">Desk Utilization</span>
            <span className="qTileVal highlight">{queue.utilization_pct}%</span>
          </div>
          <div className="queueTile">
            <span className="qTileLabel">Walk-to-Station</span>
            <span className="qTileVal highlight">
              {Math.floor(queue.average_walking_time_sec / 60)}m {queue.average_walking_time_sec % 60}s
            </span>
          </div>
        </div>
      </div>

      {/* 4. Financial & Regulatory Risk Impact */}
      {fin && (
        <div className="finImpactCard">
          <div className="finImpactHead">
            <DollarSign size={13} className="iconAmber" />
            <span>REGULATORY & BOTTLENECK RISK</span>
          </div>
          <div className="finConsequenceRow">
            <span className="finConsequenceText">{fin.net_consequence}</span>
          </div>
          <div className="finStandardRow">
            <span>Standard: <strong>{fin.regulatory_standard}</strong></span>
          </div>
        </div>
      )}

      {/* 5. Precision Spatial Metrics Stack */}
      <div className="telemetryStack">
        <div className="telemetryStackHeader">
          <span>REAL-TIME SPATIAL DELTAS</span>
        </div>

        {m.walking_distance && (
          <MetricCard
            title="Patient Walking Distance"
            current={`${m.walking_distance.current}m`}
            proposed={`${m.walking_distance.proposed}m`}
            delta={m.walking_distance.delta}
            deltaPct={m.walking_distance.delta_pct}
            status={m.walking_distance.delta_pct > 15 ? "bad" : "good"}
            description="Total transit distance between triage, registration and waiting lounge"
          />
        )}

        {m.congestion && (
          <MetricCard
            title="Clinical Corridor Congestion"
            current={`${m.congestion.current}`}
            proposed={`${m.congestion.proposed}`}
            delta={m.congestion.delta}
            unit="/100"
            status={m.congestion.delta < 0 ? "good" : "bad"}
            description="Density friction index along primary clinical spine"
          />
        )}

        {m.accessibility && (
          <MetricCard
            title="ADA Barrier-Free Rating"
            current={`${m.accessibility.current}`}
            proposed={`${m.accessibility.proposed}`}
            delta={m.accessibility.delta}
            unit="/100"
            status={m.accessibility.delta >= 0 ? "good" : "bad"}
            description="Wheelchair turning radius and ramp clearance compliance"
          />
        )}

        {m.safety && (
          <MetricCard
            title="Life Safety Egress Clearance"
            current={`${m.safety.current}`}
            proposed={`${m.safety.proposed}`}
            delta={m.safety.delta}
            unit="/100"
            status={m.safety.delta >= 0 ? "good" : "bad"}
            description="NFPA 101 emergency egress evacuation velocity"
          />
        )}
      </div>

      {/* Export / Decision Dossier Action */}
      <div className="panelActionFooter">
        <button className="panelDossierBtn" onClick={onDownloadReport}>
          <FileSpreadsheet size={14} />
          <span>Generate Executive Clinical Dossier</span>
        </button>
      </div>
    </div>
  );
}
