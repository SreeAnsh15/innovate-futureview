import React, { useState } from "react";
import { 
  Wind, CloudRain, AlertTriangle, Activity, 
  MapPin, RefreshCw, Sparkles, Navigation, Clock, ShieldCheck 
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";

export function EnvironmentalExposureView() {
  const { 
    domainResults,
    runDomainSimulation, 
    onApplyRecommendation,
    showToast 
  } = useFutureView();

  const [windDir, setWindDir] = useState("EAST");
  const [trafficEmissions, setTrafficEmissions] = useState(50);
  const [plumeActive, setPlumeActive] = useState(true);

  const res = domainResults || {};
  const metrics = res.metrics || {
    pm25_level: { current: 32.0, proposed: 76.8, delta: 44.8, unit: "µg/m³", status: "bad" },
    exposure_zone_pct: { current: 15, proposed: 49, delta: 34, unit: "%", status: "bad" },
    pedestrian_dose: { current: 18.0, proposed: 51.8, delta: 33.8, unit: "µg", status: "bad" },
    air_quality_score: { current: 86, proposed: 46, delta: -40, unit: "/100", status: "bad" }
  };

  const handleSimulate = () => {
    runDomainSimulation("environmental", "industrial-district", {}, {
      wind_direction: windDir,
      traffic_emission_surge_pct: trafficEmissions,
      industrial_plume_active: plumeActive
    });
    showToast(`Environmental Plume Simulation: Wind ${windDir}`, "info");
  };

  return (
    <div className="modulePage">
      {/* 1. Header Ribbon */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge green">
            <Wind size={14} />
            <span>DOMAIN 07 &bull; AIRSHIELD</span>
          </div>
          <h2 className="moduleTitle">Environmental Exposure & Personal Exposure Twin</h2>
          <span className="moduleSubtitle">
            Simulate dynamic PM2.5/NO2 particulate plume dispersion and track accumulated pedestrian respiratory dosage over time.
          </span>
        </div>

        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>AMBIENT PM2.5</small>
            <b className="red">{metrics.pm25_level?.proposed || 76.8} µg/m³</b>
          </div>
          <div className="headerStatBox">
            <small>HIGH-EXPOSURE ZONE</small>
            <b className="amber">{metrics.exposure_zone_pct?.proposed || 49}% Sidewalks</b>
          </div>
          <div className="headerStatBox">
            <small>PEDESTRIAN DOSAGE</small>
            <b className="red">{metrics.pedestrian_dose?.proposed || 51.8} µg</b>
          </div>
          <div className="headerStatBox">
            <small>AIR QUALITY VERDICT</small>
            <b className={res.verdict === "RECOMMENDED" ? "green" : "red"}>{res.verdict || "UNHEALTHY (AVOID)"}</b>
          </div>
        </div>
      </div>

      {/* 2. Timeline Scrubber */}
      <UniversalTimelineScrubber className="my-2" />

      {/* 3. Parameter Controls */}
      <div className="domainControlsCard">
        <div className="controlsGrid">
          <div className="controlItem">
            <label>Heavy Vehicle Traffic Emission Surge: <b>+{trafficEmissions}%</b></label>
            <input 
              type="range" 
              min="0" 
              max="150" 
              step="10" 
              value={trafficEmissions} 
              onChange={(e) => setTrafficEmissions(Number(e.target.value))} 
            />
          </div>

          <div className="controlItem flexRow">
            <label>Wind Vector Direction:</label>
            <div className="weatherButtonsRow">
              {["NORTH", "SOUTH", "EAST", "WEST"].map((dir) => (
                <button
                  key={dir}
                  className={`smallTabBtn ${windDir === dir ? "active" : ""}`}
                  onClick={() => setWindDir(dir)}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          <div className="controlItem flexRow">
            <label>Industrial Stack Emission:</label>
            <button 
              className={`togglePill ${plumeActive ? "activeRed" : "activeGreen"}`}
              onClick={() => setPlumeActive(!plumeActive)}
            >
              {plumeActive ? "ACTIVE (PARTICULATE PLUME)" : "SCRUBBED (ZERO PLUME)"}
            </button>
          </div>

          <div className="controlActions">
            <button className="primaryBtn fullWidth" onClick={handleSimulate}>
              <RefreshCw size={14} />
              <span>Simulate Plume Dispersion</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Interactive Causal Cascade Graph */}
      <CausalCascadeGraph />
    </div>
  );
}
