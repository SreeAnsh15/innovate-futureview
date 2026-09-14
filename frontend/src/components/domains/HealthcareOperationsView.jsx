import React, { useState } from "react";
import { 
  Activity, HeartPulse, UserPlus, Stethoscope, 
  Bed, ShieldAlert, Sparkles, RefreshCw, Clock, AlertTriangle 
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";

export function HealthcareOperationsView() {
  const { 
    domainResults,
    runDomainSimulation, 
    onApplyRecommendation,
    showToast 
  } = useFutureView();

  const [erSurge, setErSurge] = useState(45);
  const [scannerOffline, setScannerOffline] = useState(true);
  const [nurseShortage, setNurseShortage] = useState(2);

  const res = domainResults || {};
  const metrics = res.metrics || {
    hospital_stress_index: { current: 38, proposed: 84, delta: 46, unit: "/100", status: "bad" },
    triage_wait_time: { current: 12.5, proposed: 39.5, delta: 27.0, unit: "min", status: "bad" },
    bed_occupancy: { current: 72, proposed: 94, delta: 22, unit: "%", status: "bad" },
    icu_stress: { current: 68, proposed: 92, delta: 24, unit: "%", status: "bad" }
  };

  const handleSimulate = () => {
    runDomainSimulation("healthcare", "hospital-demo", {}, {
      er_surge_pct: erSurge,
      scanner_offline: scannerOffline,
      nurse_shortage: nurseShortage
    });
    showToast(`Healthcare Stress Simulation: +${erSurge}% ER Surge`, "info");
  };

  return (
    <div className="modulePage">
      {/* 1. Header Ribbon */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge amber">
            <Activity size={14} />
            <span>DOMAIN 03 &bull; MEDFLOW</span>
          </div>
          <h2 className="moduleTitle">Healthcare Operational Intelligence & Hospital Stress Engine</h2>
          <span className="moduleSubtitle">
            Simulate emergency patient surges, CT diagnostic downtime, nurse deficits, and ICU bed saturation.
          </span>
        </div>

        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>HOSPITAL STRESS INDEX</small>
            <b className="red">{metrics.hospital_stress_index?.proposed || 84}/100 Critical</b>
          </div>
          <div className="headerStatBox">
            <small>TRIAGE WAIT TIME</small>
            <b className="amber">{metrics.triage_wait_time?.proposed || 39.5} min</b>
          </div>
          <div className="headerStatBox">
            <small>BED OCCUPANCY</small>
            <b className="red">{metrics.bed_occupancy?.proposed || 94}% Saturation</b>
          </div>
          <div className="headerStatBox">
            <small>ICU STRESS</small>
            <b className="red">{metrics.icu_stress?.proposed || 92}% Strained</b>
          </div>
        </div>
      </div>

      {/* 2. Timeline Scrubber */}
      <UniversalTimelineScrubber className="my-2" />

      {/* 3. Parameter Controls */}
      <div className="domainControlsCard">
        <div className="controlsGrid">
          <div className="controlItem">
            <label>Emergency Arrival Surge: <b>+{erSurge}%</b></label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5" 
              value={erSurge} 
              onChange={(e) => setErSurge(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem">
            <label>Nurse Deficit: <b>{nurseShortage} staff down</b></label>
            <input 
              type="range" 
              min="0" 
              max="6" 
              step="1" 
              value={nurseShortage} 
              onChange={(e) => setNurseShortage(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem flexRow">
            <label>CT Scanner Lab 01 Status:</label>
            <button 
              className={`togglePill ${scannerOffline ? "activeRed" : "activeGreen"}`}
              onClick={() => setScannerOffline(!scannerOffline)}
            >
              {scannerOffline ? "OFFLINE (HARDWARE TRIP)" : "ONLINE (FUNCTIONAL)"}
            </button>
          </div>

          <div className="controlActions">
            <button className="primaryBtn fullWidth" onClick={handleSimulate}>
              <RefreshCw size={14} />
              <span>Simulate Hospital Future</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Causal Cascade Graph */}
      <CausalCascadeGraph />
    </div>
  );
}
