import React, { useState } from "react";
import { 
  Flame, ShieldAlert, Waves, MapPin, Activity, 
  ArrowRight, Sparkles, Building2, Truck, CheckCircle2,
  AlertTriangle, RotateCcw, Clock, RefreshCw
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";

export function DisasterIntelligenceView() {
  const { 
    currentEnv, 
    timelineT, 
    domainResults,
    runDomainSimulation, 
    onApplyRecommendation,
    showToast 
  } = useFutureView();

  const [floodLevel, setFloodLevel] = useState(1.8);
  const [bridgeBlocked, setBridgeBlocked] = useState(true);
  const [evacSurge, setEvacSurge] = useState(65);

  const res = domainResults || {};
  const metrics = res.metrics || {
    road_closure: { current: 0, proposed: 64, delta: 64, unit: "%", status: "bad" },
    ambulance_delay: { current: 6.2, proposed: 17.5, delta: 11.3, unit: "min", status: "bad" },
    hospital_intake: { current: 48, proposed: 89, delta: 41, unit: "%", status: "bad" },
    resilience_score: { current: 82, proposed: 42, delta: -40, unit: "/100", status: "bad" }
  };

  const handleSimulate = () => {
    runDomainSimulation("disaster", "urban-disaster", {}, {
      flood_level_m: floodLevel,
      blocked_bridge: bridgeBlocked,
      evacuation_surge_pct: evacSurge
    });
    showToast(`Disaster Simulation Executed: ${floodLevel}m Flood Scenario`, "info");
  };

  return (
    <div className="modulePage">
      {/* 1. Header Ribbon */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge red">
            <Flame size={14} />
            <span>DOMAIN 02 &bull; LIFELINE AI</span>
          </div>
          <h2 className="moduleTitle">Disaster Intelligence & Crisis Cascade Simulator</h2>
          <span className="moduleSubtitle">
            Simulate flash flood propagation, arterial bridge severed vectors, ambulance rerouting delay, and hospital triage surge.
          </span>
        </div>

        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>ROADS SUBMERGED</small>
            <b className="red">{metrics.road_closure?.proposed || 64}% Closed</b>
          </div>
          <div className="headerStatBox">
            <small>AMBULANCE DELAY</small>
            <b className="amber">+{metrics.ambulance_delay?.delta || 11.3} min</b>
          </div>
          <div className="headerStatBox">
            <small>SHELTER & ER LOAD</small>
            <b className="red">{metrics.hospital_intake?.proposed || 89}% Critical</b>
          </div>
          <div className="headerStatBox">
            <small>RESILIENCE VERDICT</small>
            <b className={res.verdict === "RECOMMENDED" ? "green" : "red"}>{res.verdict || "CRITICAL AVOID"}</b>
          </div>
        </div>
      </div>

      {/* 2. Timeline Scrubber */}
      <UniversalTimelineScrubber className="my-2" />

      {/* 3. Parameter Controls & Interactive What-If Canvas */}
      <div className="domainControlsCard">
        <div className="controlsGrid">
          <div className="controlItem">
            <label>Flood Inundation Level: <b>{floodLevel.toFixed(1)} meters</b></label>
            <input 
              type="range" 
              min="0.5" 
              max="4.0" 
              step="0.1" 
              value={floodLevel} 
              onChange={(e) => setFloodLevel(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem">
            <label>Evacuation Demand Surge: <b>+{evacSurge}%</b></label>
            <input 
              type="range" 
              min="10" 
              max="150" 
              step="5" 
              value={evacSurge} 
              onChange={(e) => setEvacSurge(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem flexRow">
            <label>North River Bridge Status:</label>
            <button 
              className={`togglePill ${bridgeBlocked ? "activeRed" : "activeGreen"}`}
              onClick={() => setBridgeBlocked(!bridgeBlocked)}
            >
              {bridgeBlocked ? "CUTOFF (SUBMERGED)" : "CLEAR (OPERATIONAL)"}
            </button>
          </div>

          <div className="controlActions">
            <button className="primaryBtn fullWidth" onClick={handleSimulate}>
              <RefreshCw size={14} />
              <span>Simulate Disaster Cascade</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Causal Cascade Graph */}
      <CausalCascadeGraph />
    </div>
  );
}
