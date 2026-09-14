import React, { useState } from 'react';
import { 
  CloudRain, Sun, Droplets, Wind, ShieldAlert, 
  Activity, AlertTriangle, CheckCircle2, ArrowRight, Gauge, Users, RefreshCw
} from 'lucide-react';
import { useFutureView } from '../../context/FutureViewContext';

export default function EnvironmentalStressView() {
  const { 
    activeStressCondition, setActiveStressCondition, 
    agentCount, simulationSpeed, showToast, isBharatMode 
  } = useFutureView();

  const [stressIntensity, setStressIntensity] = useState('HIGH');

  const conditions = [
    {
      id: 'CLEAR',
      name: 'Normal Weather',
      icon: Sun,
      color: 'amber',
      speedMult: 1.0,
      indoorClustering: 0,
      detourRate: 0,
      blockedRoutes: 'None',
      waitingLoad: '+0%',
      desc: 'Standard ambient conditions with nominal walking speeds and unobstructed outdoor pathways.'
    },
    {
      id: 'HEAVY_RAIN',
      name: isBharatMode ? 'Monsoon Downpour' : 'Heavy Rain & Storm',
      icon: CloudRain,
      color: 'blue',
      speedMult: 0.68,
      indoorClustering: +64,
      detourRate: +38,
      blockedRoutes: 'North Courtyard & Uncovered Ramp',
      waitingLoad: '+45%',
      desc: 'Severe precipitation causes 32% walking speed reduction, entrance canopy bottlenecks, and reroutes through covered verandas.'
    },
    {
      id: 'EXTREME_HEAT',
      name: isBharatMode ? 'Summer Heatwave (44°C)' : 'Extreme Heatwave (42°C)',
      icon: Sun,
      color: 'orange',
      speedMult: 0.76,
      indoorClustering: +52,
      detourRate: +22,
      blockedRoutes: 'Direct Sunlit Plaza',
      waitingLoad: '+70%',
      desc: 'Elevated temperatures increase indoor shaded path preference by 80% and overloads air-conditioned waiting lounges.'
    },
    {
      id: 'FLOOD',
      name: isBharatMode ? 'Urban Waterlogging' : 'Localized Flash Flood',
      icon: Droplets,
      color: 'cyan',
      speedMult: 0.45,
      indoorClustering: +90,
      detourRate: +85,
      blockedRoutes: 'Low-Lying West Entrance & Ground Ramp',
      waitingLoad: '+95%',
      desc: 'Waterlogging submerges ground-level accessibility ramps, forcing wheelchair users to detour 120m through service elevators.'
    },
    {
      id: 'POOR_AIR_QUALITY',
      name: isBharatMode ? 'Severe Winter Smog (AQI 390)' : 'Hazardous Air Quality (AQI 340)',
      icon: Wind,
      color: 'rose',
      speedMult: 0.82,
      indoorClustering: +40,
      detourRate: +15,
      blockedRoutes: 'Outdoor Waiting Pavilions',
      waitingLoad: '+35%',
      desc: 'High particulate matter pushes all waiting patients into closed HVAC corridors, accelerating airborne congestion.'
    }
  ];

  const currentConfig = conditions.find(c => c.id === activeStressCondition) || conditions[0];

  const handleSelectCondition = (id) => {
    setActiveStressCondition(id);
    showToast(`Activated Environmental Stress Condition: ${id}`, 'info');
  };

  return (
    <div className="moduleContainer">
      {/* Header */}
      <div className="moduleHeaderRow">
        <div>
          <div className="moduleTagBlock">
            <span className="moduleTagPill">MODULE 12 • CLIMATE RESILIENCE</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Atmospheric & Environmental Stress Physics</span>
          </div>
          <h1 className="moduleTitleText">Environmental Stress Simulator</h1>
          <p className="moduleDescText">
            Evaluate how harsh weather, monsoon flooding, severe heatwaves, and smog alter pedestrian speeds and cluster density.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(8, 18, 31, 0.8)", padding: "4px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>INTENSITY:</span>
          {['MODERATE', 'HIGH', 'SEVERE'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setStressIntensity(lvl)}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "10.5px",
                fontWeight: 600,
                background: stressIntensity === lvl ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: stressIntensity === lvl ? "var(--cyan-bright)" : "var(--text-muted)",
                border: stressIntensity === lvl ? "1px solid var(--cyan)" : "none"
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Selector Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
        {conditions.map(c => {
          const Icon = c.icon;
          const isActive = activeStressCondition === c.id;
          return (
            <div
              key={c.id}
              onClick={() => handleSelectCondition(c.id)}
              style={{
                padding: "14px",
                borderRadius: "var(--radius-sm)",
                border: isActive ? "1px solid var(--cyan)" : "1px solid var(--border-subtle)",
                background: isActive ? "rgba(8, 18, 31, 0.95)" : "rgba(8, 18, 31, 0.4)",
                cursor: "pointer",
                boxShadow: isActive ? "0 0 16px rgba(56, 189, 248, 0.15)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: isActive ? "rgba(56, 189, 248, 0.18)" : "rgba(0, 0, 0, 0.3)",
                  display: "grid",
                  placeItems: "center",
                  color: isActive ? "var(--cyan-bright)" : "var(--text-muted)"
                }}>
                  <Icon size={16} />
                </div>
                {isActive && (
                  <span style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--cyan-bright)",
                    boxShadow: "0 0 6px var(--cyan-bright)"
                  }} />
                )}
              </div>
              <div>
                <b style={{ fontSize: "11.5px", color: "#ffffff", display: "block" }}>{c.name}</b>
                <p style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px", lineHeight: "1.3" }}>
                  {c.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="moduleMetricsRow">
        <div className="moduleMetricCard">
          <span className="metricCardLabel">Speed Retardation</span>
          <div className="metricCardVal" style={{ color: "var(--red)" }}>
            -{Math.round((1 - currentConfig.speedMult) * 100)}%
          </div>
          <span className="metricCardSub">Effective velocity: {(1.2 * currentConfig.speedMult).toFixed(2)} m/s</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Indoor Canopy Surge</span>
          <div className="metricCardVal" style={{ color: "var(--amber)" }}>
            {currentConfig.indoorClustering > 0 ? `+${currentConfig.indoorClustering}%` : 'Nominal'}
          </div>
          <span className="metricCardSub">Foyer & veranda density</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Vulnerable Detour Rate</span>
          <div className="metricCardVal" style={{ color: "var(--violet)" }}>
            {currentConfig.detourRate > 0 ? `+${currentConfig.detourRate}%` : 'Nominal'}
          </div>
          <span className="metricCardSub">Elderly & wheelchair impact</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Waiting Hall Pressure</span>
          <div className="metricCardVal" style={{ color: "var(--cyan)" }}>
            {currentConfig.waitingLoad}
          </div>
          <span className="metricCardSub">Peak seat occupancy</span>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="moduleWorkspaceGrid">
        <div className="panelDark">
          <div className="panelDarkTitle">
            <Activity size={14} className="iconCyan" />
            <span>ENVIRONMENTAL STRESS BOTTLENECK MAPPING</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "12px", borderRadius: "var(--radius-xs)", background: "rgba(0, 0, 0, 0.3)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Submerged / Inaccessible Pathways</span>
                <p style={{ fontSize: "11px", color: "var(--red)", marginTop: "2px" }}>{currentConfig.blockedRoutes}</p>
              </div>
              <span className="navItemBadge badgeRed">
                {currentConfig.id === 'CLEAR' ? 'ALL OPEN' : 'RESTRICTED'}
              </span>
            </div>

            <div style={{ padding: "12px", borderRadius: "var(--radius-xs)", background: "rgba(0, 0, 0, 0.3)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Entrance Canopy Crush Risk</span>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Under {currentConfig.name}, {Math.round(agentCount * 0.42)} of {agentCount} pedestrians converge on covered portals.
                </p>
              </div>
              <span className="navItemBadge badgeAmber">
                {currentConfig.id === 'CLEAR' ? 'LOW' : 'HIGH CRUSH RISK'}
              </span>
            </div>
          </div>
        </div>

        <div className="panelDark">
          <div className="panelDarkTitle">
            <ShieldAlert size={14} className="iconGreen" />
            <span>AI CLIMATE RESILIENCE ACTION</span>
          </div>

          <div style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: "1.5"
          }}>
            <b style={{ color: "var(--green)", display: "block", marginBottom: "4px" }}>
              Recommended Physical Mitigation:
            </b>
            {currentConfig.id === 'FLOOD' || currentConfig.id === 'HEAVY_RAIN' ? (
              <span>
                1. Deploy elevated modular covered gangways connecting West Entrance to Core Diagnostics.<br />
                2. Install rain canopy extensions (+12m) to prevent foyer spillback.
              </span>
            ) : currentConfig.id === 'EXTREME_HEAT' ? (
              <span>
                1. Activate secondary shaded East Arcade to distribute 45% of pedestrian load away from sunlit courtyard.<br />
                2. Reposition mobile hydration kiosks to mid-corridor rest nodes.
              </span>
            ) : (
              <span>
                Nominal weather conditions. Baseline layout provides adequate throughput with 0% weather-induced detour penalty.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
