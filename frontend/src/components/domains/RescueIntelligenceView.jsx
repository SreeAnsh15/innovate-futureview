import React, { useState } from "react";
import { 
  Zap, Flame, ShieldAlert, HeartHandshake, 
  MapPin, Activity, RefreshCw, Sparkles, Navigation, Clock 
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";

export function RescueIntelligenceView() {
  const { 
    domainResults,
    runDomainSimulation, 
    onApplyRecommendation,
    showToast 
  } = useFutureView();

  const [staircaseBlocked, setStaircaseBlocked] = useState(true);
  const [smokeSpeed, setSmokeSpeed] = useState("FAST");
  const [trappedOccupants, setTrappedOccupants] = useState(14);

  const res = domainResults || {};
  const metrics = res.metrics || {
    rescue_time: { current: 11.5, proposed: 36.0, delta: 24.5, unit: "min", status: "bad" },
    responder_risk: { current: 25, proposed: 85, delta: 60, unit: "/100", status: "bad" },
    survivability_index: { current: 95, proposed: 33, delta: -62, unit: "%", status: "bad" },
    mission_viability: { current: 84, proposed: 31, delta: -53, unit: "/100", status: "bad" }
  };

  const handleSimulate = () => {
    runDomainSimulation("rescue", "highrise-rescue", {}, {
      staircase_b_blocked: staircaseBlocked,
      smoke_spread_rate: smokeSpeed,
      trapped_occupants: trappedOccupants
    });
    showToast(`Pre-Rescue Simulation Executed: ${trappedOccupants} Occupants`, "info");
  };

  return (
    <div className="modulePage">
      {/* 1. Header Ribbon */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge purple">
            <Zap size={14} />
            <span>DOMAIN 06 &bull; RESCUEVISION</span>
          </div>
          <h2 className="moduleTitle">Rescue Intelligence & Pre-Rescue Simulation Lab</h2>
          <span className="moduleSubtitle">
            Compute the safest feasible rescue extraction vector considering dynamic smoke spread, stairwell blockages, and responder hazard.
          </span>
        </div>

        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>EXTRACTION DURATION</small>
            <b className="red">{metrics.rescue_time?.proposed || 36.0} min</b>
          </div>
          <div className="headerStatBox">
            <small>RESPONDER HAZARD</small>
            <b className="red">{metrics.responder_risk?.proposed || 85}/100 Critical</b>
          </div>
          <div className="headerStatBox">
            <small>SURVIVABILITY INDEX</small>
            <b className="red">{metrics.survivability_index?.proposed || 33}% Window</b>
          </div>
          <div className="headerStatBox">
            <small>MISSION VIABILITY</small>
            <b className={res.verdict === "RECOMMENDED" ? "green" : "red"}>{res.verdict || "AVOID"}</b>
          </div>
        </div>
      </div>

      {/* 2. Timeline Scrubber */}
      <UniversalTimelineScrubber className="my-2" />

      {/* 3. Parameter Controls */}
      <div className="domainControlsCard">
        <div className="controlsGrid">
          <div className="controlItem">
            <label>Trapped Occupants (Floor 4): <b>{trappedOccupants} people</b></label>
            <input 
              type="range" 
              min="2" 
              max="40" 
              step="1" 
              value={trappedOccupants} 
              onChange={(e) => setTrappedOccupants(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem flexRow">
            <label>Stairwell B Smoke Condition:</label>
            <button 
              className={`togglePill ${staircaseBlocked ? "activeRed" : "activeGreen"}`}
              onClick={() => setStaircaseBlocked(!staircaseBlocked)}
            >
              {staircaseBlocked ? "BLOCKED (TOXIC FLASHOVER)" : "CLEAR (PRESSURIZED)"}
            </button>
          </div>

          <div className="controlItem flexRow">
            <label>Smoke Progression Velocity:</label>
            <div className="weatherButtonsRow">
              {["SLOW", "MODERATE", "FAST"].map((spd) => (
                <button
                  key={spd}
                  className={`smallTabBtn ${smokeSpeed === spd ? "active" : ""}`}
                  onClick={() => setSmokeSpeed(spd)}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          <div className="controlActions">
            <button className="primaryBtn fullWidth" onClick={handleSimulate}>
              <RefreshCw size={14} />
              <span>Simulate Extraction Corridor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Causal Cascade Graph */}
      <CausalCascadeGraph />
    </div>
  );
}
