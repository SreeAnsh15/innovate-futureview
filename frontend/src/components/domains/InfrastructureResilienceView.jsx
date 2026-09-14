import React, { useState } from "react";
import { 
  Building2, Zap, ShieldAlert, GitBranch, 
  Activity, RefreshCw, Sparkles, Navigation, Clock, AlertTriangle 
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";

export function InfrastructureResilienceView() {
  const { 
    domainResults,
    runDomainSimulation, 
    onApplyRecommendation,
    showToast 
  } = useFutureView();

  const [failedNode, setFailedNode] = useState("substation_4");
  const [loadSurge, setLoadSurge] = useState(35);
  const [maintenanceDelayed, setMaintenanceDelayed] = useState(true);

  const res = domainResults || {};
  const metrics = res.metrics || {
    compromised_nodes: { current: 0, proposed: 7, delta: 7, unit: "nodes", status: "bad" },
    grid_stress: { current: 42, proposed: 90, delta: 48, unit: "%", status: "bad" },
    cascade_depth: { current: 1, proposed: 4, delta: 3, unit: "levels", status: "bad" },
    resilience_score: { current: 88, proposed: 36, delta: -52, unit: "/100", status: "bad" }
  };

  const handleSimulate = () => {
    runDomainSimulation("infrastructure", "power-water-grid", {}, {
      failed_node_id: failedNode,
      grid_load_surge_pct: loadSurge,
      maintenance_delayed: maintenanceDelayed
    });
    showToast(`Infrastructure Cascade Simulation: ${failedNode.toUpperCase()}`, "info");
  };

  return (
    <div className="modulePage">
      {/* 1. Header Ribbon */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge amber">
            <Building2 size={14} />
            <span>DOMAIN 08 &bull; INFRASTRUCTURE ORACLE</span>
          </div>
          <h2 className="moduleTitle">Infrastructure Resilience & Failure Propagation DAG</h2>
          <span className="moduleSubtitle">
            Evaluate interconnected power, water treatment, and transit dependency graphs to test cascade-stopping isolation switches.
          </span>
        </div>

        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>COMPROMISED NODES</small>
            <b className="red">{metrics.compromised_nodes?.proposed || 7} Offline</b>
          </div>
          <div className="headerStatBox">
            <small>SYSTEM GRID STRESS</small>
            <b className="red">{metrics.grid_stress?.proposed || 90}% Overload</b>
          </div>
          <div className="headerStatBox">
            <small>CASCADE DEPTH</small>
            <b className="amber">{metrics.cascade_depth?.proposed || 4} Levels</b>
          </div>
          <div className="headerStatBox">
            <small>RESILIENCE VERDICT</small>
            <b className={res.verdict === "RECOMMENDED" ? "green" : "red"}>{res.verdict || "CRITICAL (AVOID)"}</b>
          </div>
        </div>
      </div>

      {/* 2. Timeline Scrubber */}
      <UniversalTimelineScrubber className="my-2" />

      {/* 3. Parameter Controls */}
      <div className="domainControlsCard">
        <div className="controlsGrid">
          <div className="controlItem">
            <label>Grid Transmission Load Surge: <b>+{loadSurge}%</b></label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5" 
              value={loadSurge} 
              onChange={(e) => setLoadSurge(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem flexRow">
            <label>Primary Tripped Node:</label>
            <div className="weatherButtonsRow">
              {[
                { id: "substation_4", label: "Substation 04" },
                { id: "pumping_station_2", label: "Pumping Stn 02" },
                { id: "hospital_feeder", label: "Hospital Feeder" }
              ].map((n) => (
                <button
                  key={n.id}
                  className={`smallTabBtn ${failedNode === n.id ? "active" : ""}`}
                  onClick={() => setFailedNode(n.id)}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div className="controlItem flexRow">
            <label>Preventive Maintenance Backlog:</label>
            <button 
              className={`togglePill ${maintenanceDelayed ? "activeRed" : "activeGreen"}`}
              onClick={() => setMaintenanceDelayed(!maintenanceDelayed)}
            >
              {maintenanceDelayed ? "DEFERRED (HIGH VULNERABILITY)" : "SERVICED (RESILIENT)"}
            </button>
          </div>

          <div className="controlActions">
            <button className="primaryBtn fullWidth" onClick={handleSimulate}>
              <RefreshCw size={14} />
              <span>Simulate Failure Propagation DAG</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Causal Cascade Graph */}
      <CausalCascadeGraph />
    </div>
  );
}
