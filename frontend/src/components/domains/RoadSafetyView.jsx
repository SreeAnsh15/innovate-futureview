import React, { useState } from "react";
import { 
  ShieldAlert, Car, CloudRain, Eye, AlertTriangle, 
  Activity, RefreshCw, Sparkles, Navigation, Clock 
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";

export function RoadSafetyView() {
  const { 
    domainResults,
    runDomainSimulation, 
    onApplyRecommendation,
    showToast 
  } = useFutureView();

  const [trafficSurge, setTrafficSurge] = useState(40);
  const [weatherCondition, setWeatherCondition] = useState("RAIN");
  const [signalCycle, setSignalCycle] = useState(45);

  const res = domainResults || {};
  const metrics = res.metrics || {
    near_miss_risk: { current: 4.2, proposed: 10.4, delta: 6.2, unit: "events/hr", status: "bad" },
    conflict_hotspots: { current: 2, proposed: 5, delta: 3, unit: "zones", status: "bad" },
    pedestrian_exposure: { current: 14.0, proposed: 14.0, delta: 0.0, unit: "sec", status: "good" },
    road_safety_score: { current: 85, proposed: 48, delta: -37, unit: "/100", status: "bad" }
  };

  const handleSimulate = () => {
    runDomainSimulation("road", "city-intersection", {}, {
      traffic_surge_pct: trafficSurge,
      weather_condition: weatherCondition,
      signal_cycle_sec: signalCycle
    });
    showToast(`Road Safety Simulation Executed: ${weatherCondition} Condition`, "info");
  };

  return (
    <div className="modulePage">
      {/* 1. Header Ribbon */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge green">
            <ShieldAlert size={14} />
            <span>DOMAIN 04 &bull; ROADSHADOW</span>
          </div>
          <h2 className="moduleTitle">Road Safety Intelligence & Digital Near-Miss Simulator</h2>
          <span className="moduleSubtitle">
            Simulate vehicle-pedestrian conflict zones, near-miss risk indices under weather friction, and adaptive signal timing.
          </span>
        </div>

        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>SIMULATED NEAR-MISSES</small>
            <b className="red">{metrics.near_miss_risk?.proposed || 10.4} events/hr</b>
          </div>
          <div className="headerStatBox">
            <small>CONFLICT HOTSPOTS</small>
            <b className="amber">{metrics.conflict_hotspots?.proposed || 5} Active</b>
          </div>
          <div className="headerStatBox">
            <small>CROSSWALK EXPOSURE</small>
            <b className="cyan">{metrics.pedestrian_exposure?.proposed || 14.0} sec</b>
          </div>
          <div className="headerStatBox">
            <small>ROAD SAFETY VERDICT</small>
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
            <label>Vehicle Traffic Volume Surge: <b>+{trafficSurge}%</b></label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5" 
              value={trafficSurge} 
              onChange={(e) => setTrafficSurge(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem">
            <label>Signal Cycle Time: <b>{signalCycle} seconds</b></label>
            <input 
              type="range" 
              min="25" 
              max="90" 
              step="5" 
              value={signalCycle} 
              onChange={(e) => setSignalCycle(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem flexRow">
            <label>Weather & Surface Friction:</label>
            <div className="weatherButtonsRow">
              {["CLEAR", "RAIN", "FOG", "NIGHT"].map((cond) => (
                <button
                  key={cond}
                  className={`smallTabBtn ${weatherCondition === cond ? "active" : ""}`}
                  onClick={() => setWeatherCondition(cond)}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          <div className="controlActions">
            <button className="primaryBtn fullWidth" onClick={handleSimulate}>
              <RefreshCw size={14} />
              <span>Simulate Road Conflict Vectors</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Causal Cascade Graph */}
      <CausalCascadeGraph />
    </div>
  );
}
