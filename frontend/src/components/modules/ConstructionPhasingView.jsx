import React, { useState } from 'react';
import { 
  Hammer, Construction, Calendar, ShieldCheck, 
  AlertTriangle, ArrowRight, Layers, Clock, Users, CheckCircle2, Play
} from 'lucide-react';
import { useFutureView } from '../../context/FutureViewContext';

export default function ConstructionPhasingView() {
  const { setSelectedModule, showToast } = useFutureView();
  const [activePhase, setActivePhase] = useState(1);

  const phases = [
    {
      phase: 1,
      name: 'Phase 1: Site Isolation & Temporary Wayfinding',
      duration: 'Week 1 - 2',
      status: 'Ready',
      capacityRetention: '92%',
      egressClearance: '100%',
      accessPenalty: '+8m',
      riskLevel: 'Low',
      barricades: 'Central Foyer Dust Hoarding (12m x 4m)',
      tempMeasures: 'Deploy temporary registration kiosk near North Corridor; install directional floor decals.',
      description: 'Isolates central remodeling zone with fire-retardant dust screens while keeping both primary entrance gates active.'
    },
    {
      phase: 2,
      name: 'Phase 2: Structural Demolition & Ramp Excavation',
      duration: 'Week 3 - 6',
      status: 'Critical Transition',
      capacityRetention: '74%',
      egressClearance: '82%',
      accessPenalty: '+38m',
      riskLevel: 'Elevated',
      barricades: 'West Stairwell Enclosure & Main Concourse Trench',
      tempMeasures: 'Reroute wheelchair access through South Service Elevator; station dedicated safety marshals during peak intake.',
      description: 'Heavy construction phase where main corridor width is temporarily constrained to 1.8m. Peak congestion increases by 24%.'
    },
    {
      phase: 3,
      name: 'Phase 3: Fitout, Commissioning & Phased Handover',
      duration: 'Week 7 - 8',
      status: 'Finalizing',
      capacityRetention: '96%',
      egressClearance: '100%',
      accessPenalty: '0m (Ramp Active)',
      riskLevel: 'Very Low',
      barricades: 'Finishing partitions around new triage counter',
      tempMeasures: 'Open new 1:12 ADA Ramp for live trials; conduct staff walkthrough on newly widened concourse.',
      description: 'New accessibility ramp and relocated central registration desk become fully operational with 0 disruption to daily patients.'
    }
  ];

  const currentPhaseData = phases.find(p => p.phase === activePhase) || phases[0];

  const handleSimulatePhase = () => {
    showToast(`Loaded Phase ${activePhase} parameters into Live Crowd Engine!`, 'success');
    setSelectedModule('live_crowd');
  };

  return (
    <div className="moduleContainer">
      {/* Header */}
      <div className="moduleHeaderRow">
        <div>
          <div className="moduleTagBlock">
            <span className="moduleTagPill">MODULE 13 • TRANSITION PLANNING</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Zero-Disruption Phasing Analysis</span>
          </div>
          <h1 className="moduleTitleText">Construction Phasing & Business Continuity</h1>
          <p className="moduleDescText">
            Simulate temporary barricades, corridor constrictions, and patient detours during active remodeling phases.
          </p>
        </div>

        <button onClick={handleSimulatePhase} className="primaryBtn">
          <Play size={14} fill="#ffffff" />
          <span>Simulate Phase {activePhase} in Crowd Engine</span>
        </button>
      </div>

      {/* Phase Timeline Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
        {phases.map(p => {
          const isActive = p.phase === activePhase;
          return (
            <div
              key={p.phase}
              onClick={() => setActivePhase(p.phase)}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-sm)",
                border: isActive ? "1px solid var(--amber)" : "1px solid var(--border-subtle)",
                background: isActive ? "rgba(8, 18, 31, 0.95)" : "rgba(8, 18, 31, 0.4)",
                cursor: "pointer",
                boxShadow: isActive ? "0 0 16px rgba(245, 158, 11, 0.2)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="navItemBadge badgeAmber">PHASE {p.phase}</span>
                <span style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={12} />
                  {p.duration}
                </span>
              </div>
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#ffffff" }}>
                {p.name}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Capacity Retained:</span>
                <span style={{ color: "var(--amber)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{p.capacityRetention}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="moduleMetricsRow">
        <div className="moduleMetricCard">
          <span className="metricCardLabel">Facility Throughput</span>
          <div className="metricCardVal" style={{ color: "var(--amber)" }}>{currentPhaseData.capacityRetention}</div>
          <span className="metricCardSub">Operational continuity</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Emergency Egress Width</span>
          <div className="metricCardVal" style={{ color: "var(--green)" }}>{currentPhaseData.egressClearance}</div>
          <span className="metricCardSub">NFPA compliance check</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Wheelchair Detour</span>
          <div className="metricCardVal" style={{ color: "var(--violet)" }}>{currentPhaseData.accessPenalty}</div>
          <span className="metricCardSub">Temporary route burden</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Transition Risk Level</span>
          <div className="metricCardVal" style={{ color: currentPhaseData.riskLevel === 'Elevated' ? "var(--red)" : "var(--green)" }}>
            {currentPhaseData.riskLevel}
          </div>
          <span className="metricCardSub">Safety marshal audit</span>
        </div>
      </div>

      {/* Phasing Diagnostics */}
      <div className="moduleWorkspaceGrid">
        <div className="panelDark">
          <div className="panelDarkTitle">
            <Construction size={14} className="iconAmber" />
            <span>PHASE {activePhase} INTERVENTIONS & TEMPORARY MITIGATION</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "var(--radius-xs)", background: "rgba(0, 0, 0, 0.3)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", color: "var(--text-dim)", textTransform: "uppercase" }}>ACTIVE HOARDING ZONE</span>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>{currentPhaseData.barricades}</p>
            </div>

            <div style={{ padding: "12px", borderRadius: "var(--radius-xs)", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
              <span style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--amber)", display: "block", marginBottom: "4px" }}>
                Temporary Operational Measures:
              </span>
              <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                {currentPhaseData.tempMeasures}
              </p>
            </div>

            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
              {currentPhaseData.description}
            </p>
          </div>
        </div>

        <div className="panelDark">
          <div className="panelDarkTitle">
            <ShieldCheck size={14} className="iconGreen" />
            <span>COMPLIANCE GATE CHECKLIST</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11.5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "var(--radius-xs)", background: "rgba(0, 0, 0, 0.2)" }}>
              <CheckCircle2 size={14} className="iconGreen" />
              <span>Continuous 1.8m Minimum Corridor Clearance</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "var(--radius-xs)", background: "rgba(0, 0, 0, 0.2)" }}>
              <CheckCircle2 size={14} className="iconGreen" />
              <span>Negative Pressure Dust Containment</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "var(--radius-xs)", background: "rgba(0, 0, 0, 0.2)" }}>
              <CheckCircle2 size={14} className="iconGreen" />
              <span>Direct Secondary Fire Egress Signage</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "var(--radius-xs)", background: "rgba(0, 0, 0, 0.2)" }}>
              <CheckCircle2 size={14} className="iconGreen" />
              <span>Elevator Priority Key for Mobility Devices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
