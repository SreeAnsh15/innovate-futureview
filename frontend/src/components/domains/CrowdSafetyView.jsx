import React, { useState } from "react";
import { 
  Users, AlertCircle, ShieldAlert, DoorClosed, 
  DoorOpen, Activity, RefreshCw, Sparkles, Clock, AlertTriangle 
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";

export function CrowdSafetyView() {
  const { 
    domainResults,
    runDomainSimulation, 
    onApplyRecommendation,
    showToast 
  } = useFutureView();

  const [gateAClosed, setGateAClosed] = useState(true);
  const [ingressRate, setIngressRate] = useState(850);

  const res = domainResults || {};
  const metrics = res.metrics || {
    peak_density: { current: 1.2, proposed: 4.8, delta: 3.6, unit: "ped/m²", status: "bad" },
    crowd_phase_num: { current: 1, proposed: 4, delta: 3, unit: "Phase 4 (Compression)", status: "bad" },
    turbulence_index: { current: 18, proposed: 78, delta: 60, unit: "/100", status: "bad" },
    evac_clearance_time: { current: 14.0, proposed: 25.2, delta: 11.2, unit: "min", status: "bad" }
  };

  const handleSimulate = () => {
    runDomainSimulation("crowd", "stadium-arena", {}, {
      gate_a_closed: gateAClosed,
      ingress_rate_per_min: ingressRate
    });
    showToast(`Crowd Phase Simulation Executed: ${ingressRate} ped/min`, "info");
  };

  return (
    <div className="modulePage">
      {/* 1. Header Ribbon */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge cyan">
            <Users size={14} />
            <span>DOMAIN 05 &bull; CROWDGUARD</span>
          </div>
          <h2 className="moduleTitle">Crowd Safety Intelligence & 5-Phase State Engine</h2>
          <span className="moduleSubtitle">
            Analyze transitions from Normal Flow to Instability and Compression Risk during arena gate interventions.
          </span>
        </div>

        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>PEAK CONCOURSE DENSITY</small>
            <b className="red">{metrics.peak_density?.proposed || 4.8} ped/m²</b>
          </div>
          <div className="headerStatBox">
            <small>CROWD STATE</small>
            <b className="red">{metrics.crowd_phase_num?.unit || "Phase 4 (Compression)"}</b>
          </div>
          <div className="headerStatBox">
            <small>TURBULENCE INDEX</small>
            <b className="amber">{metrics.turbulence_index?.proposed || 78}/100 High</b>
          </div>
          <div className="headerStatBox">
            <small>CLEARANCE DURATION</small>
            <b className="red">{metrics.evac_clearance_time?.proposed || 25.2} min</b>
          </div>
        </div>
      </div>

      {/* 2. Timeline Scrubber */}
      <UniversalTimelineScrubber className="my-2" />

      {/* 3. Parameter Controls */}
      <div className="domainControlsCard">
        <div className="controlsGrid">
          <div className="controlItem">
            <label>Pedestrian Ingress Influx Rate: <b>{ingressRate} visitors / minute</b></label>
            <input 
              type="range" 
              min="200" 
              max="1600" 
              step="50" 
              value={ingressRate} 
              onChange={(e) => setIngressRate(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem flexRow">
            <label>Primary Gate A Turnstile Status:</label>
            <button 
              className={`togglePill ${gateAClosed ? "activeRed" : "activeGreen"}`}
              onClick={() => setGateAClosed(!gateAClosed)}
            >
              {gateAClosed ? "CLOSED (RESTRICTED)" : "OPEN (NORMAL FLOW)"}
            </button>
          </div>

          <div className="controlActions">
            <button className="primaryBtn fullWidth" onClick={handleSimulate}>
              <RefreshCw size={14} />
              <span>Simulate Crowd Phase Transitions</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Causal Cascade Graph */}
      <CausalCascadeGraph />
    </div>
  );
}
