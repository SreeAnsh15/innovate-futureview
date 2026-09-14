import React from "react";
import {
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Flame,
  ShieldCheck
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function DemandSurgeSimulator() {
  const {
    currentEnv,
    proposalPosition,
    demandLevel,
    setDemandLevel,
    simulationResult,
    effectiveUsersPerHour,
    onApplyRecommendation
  } = useFutureView();

  const demandPresets = [
    {
      id: "NORMAL",
      label: "NORMAL DEMAND",
      rate: "420 users / hr",
      uph: 420,
      description: "Standard daily design capacity. Balanced circulation and minimal queue delays.",
      queueLength: "4 - 6 people",
      waitTime: "01:45 min",
      congestion: "32 / 100",
      saturation: "48%",
      color: "#38bdf8"
    },
    {
      id: "PEAK",
      label: "PEAK SURGE (LUNCH/SHIFT)",
      rate: "800 users / hr",
      uph: 800,
      description: "2.0x surge during lunch and clinical shift changes. High queue formation in foyers.",
      queueLength: "14 - 18 people",
      waitTime: "04:20 min",
      congestion: "72 / 100",
      saturation: "86%",
      color: "#f59e0b"
    },
    {
      id: "EXTREME",
      label: "EXTREME STRESS SPIKE",
      rate: "1,500 users / hr",
      uph: 1500,
      description: "3.5x critical stress spike during public emergency, transit delays, or mega-events.",
      queueLength: "38 - 45 people (Corridor Spillover)",
      waitTime: "09:50 min",
      congestion: "98 / 100",
      saturation: "99%",
      color: "#f43f5e"
    }
  ];

  const currentPreset = demandPresets.find((d) => d.id === demandLevel) || demandPresets[0];

  const hourlyFlow = [
    { hour: "08:00 AM", flow: Math.round(effectiveUsersPerHour * 0.45) },
    { hour: "10:00 AM", flow: Math.round(effectiveUsersPerHour * 0.75) },
    { hour: "12:30 PM", flow: Math.round(effectiveUsersPerHour * 1.0) },
    { hour: "03:00 PM", flow: Math.round(effectiveUsersPerHour * 0.65) },
    { hour: "05:30 PM", flow: Math.round(effectiveUsersPerHour * 0.85) },
    { hour: "08:00 PM", flow: Math.round(effectiveUsersPerHour * 0.35) }
  ];

  const maxFlow = Math.max(...hourlyFlow.map((h) => h.flow));

  return (
    <div className="modulePage">
      {/* 1. Module Top Bar */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge amber">
            <TrendingUp size={14} />
            <span>MODULE 07</span>
          </div>
          <h2 className="moduleTitle">Demand Surge & Peak Stress Simulator</h2>
          <span className="moduleSubtitle">
            Stress-test facility resilience against surges from 420 to 1,500 users/hour to identify breaking points and queue spillover.
          </span>
        </div>

        {/* Live Surge Ribbon */}
        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>CURRENT INJECTION RATE</small>
            <b className="amber">{effectiveUsersPerHour} Users/Hr</b>
          </div>
          <div className="headerStatBox">
            <small>EXPECTED QUEUE</small>
            <b className={demandLevel === "EXTREME" ? "bad" : demandLevel === "PEAK" ? "warning" : "good"}>
              {currentPreset.queueLength}
            </b>
          </div>
          <div className="headerStatBox">
            <small>ESTIMATED WAIT</small>
            <b className={demandLevel === "EXTREME" ? "bad" : demandLevel === "PEAK" ? "warning" : "good"}>
              {currentPreset.waitTime}
            </b>
          </div>
          <div className="headerStatBox">
            <small>SATURATION INDEX</small>
            <b className={demandLevel === "EXTREME" ? "bad" : "good"}>
              {currentPreset.saturation}
            </b>
          </div>
        </div>
      </div>

      {/* 2. Three High-Contrast Demand Buttons */}
      <div className="demandPresetsGrid">
        {demandPresets.map((dp) => {
          const isSelected = demandLevel === dp.id;
          return (
            <div
              key={dp.id}
              className={`demandPresetCard ${isSelected ? "selected" : ""}`}
              onClick={() => setDemandLevel(dp.id)}
            >
              <div className="dpCardTop">
                <span className="dpRateBadge" style={{ borderColor: dp.color, color: dp.color }}>
                  {dp.rate}
                </span>
                <strong className="dpLabel">{dp.label}</strong>
              </div>

              <p className="dpDesc">{dp.description}</p>

              <div className="dpStatsMiniGrid">
                <div>
                  <small>Congestion</small>
                  <b>{dp.congestion}</b>
                </div>
                <div>
                  <small>Avg Wait</small>
                  <b>{dp.waitTime}</b>
                </div>
                <div>
                  <small>Resource Saturation</small>
                  <b>{dp.saturation}</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Surge Analysis: Flow Profiles & Spillover Warnings */}
      <div className="moduleWorkspaceGrid">
        {/* Left 65%: Hourly Load Profile & Resource Curve */}
        <div className="accessibilityLeftCol">
          <div className="accessCard">
            <div className="cardHead">
              <Activity size={16} className="iconCyan" />
              <b>Hourly Human Flow & Congestion Distribution ({effectiveUsersPerHour} People / Hr)</b>
            </div>

            <div className="flowChartWrapper">
              <div className="flowBarsContainer">
                {hourlyFlow.map((h, i) => {
                  const pct = Math.round((h.flow / maxFlow) * 100);
                  const isPeak = pct > 80;
                  return (
                    <div key={i} className="flowBarCol">
                      <span className="flowBarVal">{h.flow}</span>
                      <div className="flowBarTrack">
                        <div
                          className={`flowBarFill ${isPeak ? "peak" : ""}`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="flowBarLabel">{h.hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Spillover Bottleneck Zones */}
          <div className="accessCard">
            <div className="cardHead">
              <AlertTriangle size={16} className="iconAmber" />
              <b>Surge Bottleneck & Hallway Spillover Zones</b>
            </div>

            <div className="spilloverGrid">
              <div className={`spilloverItem ${demandLevel === "EXTREME" ? "critical" : ""}`}>
                <div className="spilloverHead">
                  <b>1. Registration Foyer Queue Overflow</b>
                  <span className="severityPill">{demandLevel === "EXTREME" ? "CRITICAL" : "MODERATE"}</span>
                </div>
                <p>
                  At {effectiveUsersPerHour} users/hr, the queue exceeds the 12m barrier stanchions and spills into the primary clinical transit hallway.
                </p>
              </div>

              <div className={`spilloverItem ${demandLevel === "EXTREME" || demandLevel === "PEAK" ? "warning" : ""}`}>
                <div className="spilloverHead">
                  <b>2. Waiting Area Seating Saturation</b>
                  <span className="severityPill">{demandLevel === "EXTREME" ? "OVERFLOW" : "HIGH"}</span>
                </div>
                <p>
                  80 seats fully occupied within 25 minutes of surge onset. Unseated visitors congregate around corridor thresholds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 35%: AI Surge Mitigation Recommendation */}
        <div className="moduleSidePanel">
          <div className="sidePanelCard aiSurgeCard">
            <div className="cardHead">
              <Sparkles size={16} className="iconCyan" />
              <b>AI Surge Mitigation Strategy</b>
            </div>

            <div className="aiSurgeText">
              <p>
                {demandLevel === "EXTREME"
                  ? `CRITICAL SATURATION: Under 1,500 users/hr, the proposed layout creates a total circulation lockup in the East Corridor. Recommended Interventions: (1) Open 2 auxiliary check-in kiosks at the main entrance, (2) Activate secondary queue staging lines.`
                  : demandLevel === "PEAK"
                  ? `PEAK FRICTION DETECTED: Queue delays reach 4m 20s. Repositioning the desk to (28%, 40%) cuts queue interference by 54%.`
                  : `NORMAL FLOW: System operating within optimal ergonomic and circulation parameters.`}
              </p>
            </div>

            <button
              className="primaryBtn fullWidth"
              onClick={() => onApplyRecommendation({ x: 28.0, y: 40.0 })}
            >
              <Sparkles size={14} />
              <span>Apply AI Surge-Resistant Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
