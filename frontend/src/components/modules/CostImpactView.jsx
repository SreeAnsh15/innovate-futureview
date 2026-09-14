import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Award, CheckCircle2, 
  ArrowUpRight, AlertCircle, Plus, RefreshCw, BarChart3, Zap, Shield, Eye
} from 'lucide-react';
import { useFutureView } from '../../context/FutureViewContext';

export default function CostImpactView() {
  const { proposedScenario, setProposedScenario, showToast, isBharatMode } = useFutureView();
  const [budgetLimit, setBudgetLimit] = useState(45000);
  const [selectedInterventions, setSelectedInterventions] = useState(['ramp_install', 'desk_relocate']);

  const currencySymbol = isBharatMode ? '₹' : '$';
  const currencyMultiplier = isBharatMode ? 80 : 1;

  const catalog = [
    {
      id: 'desk_relocate',
      name: 'Central Registration Relocation (37m East)',
      category: 'Physical Layout',
      cost: 4500,
      safetyDelta: +12,
      accessDelta: +18,
      congestionDelta: -28,
      expDelta: +22,
      roi: 3.8,
      leadTime: '3 Days',
      risk: 'Low',
      description: 'Moves counter adjacent to central concourse, eliminating bottleneck near emergency intake.'
    },
    {
      id: 'ramp_install',
      name: 'ADA Grade 1:12 Dual-Access Ramp',
      category: 'Accessibility',
      cost: 12500,
      safetyDelta: +34,
      accessDelta: +62,
      congestionDelta: -14,
      expDelta: +45,
      roi: 4.6,
      leadTime: '10 Days',
      risk: 'Low',
      description: 'Provides direct barrier-free transit for wheelchairs & elderly from West Entrance.'
    },
    {
      id: 'counter_add',
      name: 'Add 2nd High-Speed Triage Counter',
      category: 'Operations',
      cost: 8000,
      safetyDelta: +8,
      accessDelta: +12,
      congestionDelta: -44,
      expDelta: +36,
      roi: 4.1,
      leadTime: '2 Days',
      risk: 'Very Low',
      description: 'Doubles intake throughput during peak 09:00-11:00 demand surges.'
    },
    {
      id: 'waiting_expand',
      name: 'Expand Staging & Waiting Zone (+40m²)',
      category: 'Physical Layout',
      cost: 16000,
      safetyDelta: +20,
      accessDelta: +10,
      congestionDelta: -32,
      expDelta: +28,
      roi: 2.9,
      leadTime: '14 Days',
      risk: 'Medium',
      description: 'Adds 32 cushioned seats and clears transit aisles from overflow standing visitors.'
    },
    {
      id: 'emergency_door',
      name: 'Automated Panic Egress Retrofit (North Gate)',
      category: 'Safety',
      cost: 9500,
      safetyDelta: +58,
      accessDelta: +15,
      congestionDelta: -8,
      expDelta: +18,
      roi: 3.4,
      leadTime: '5 Days',
      risk: 'Low',
      description: 'Replaces narrow push door with 2.8m wide motorized magnetic breakaway gate.'
    },
    {
      id: 'digital_signage',
      name: 'Smart Dynamic Wayfinding Kiosks (x4)',
      category: 'Technology',
      cost: 6200,
      safetyDelta: +10,
      accessDelta: +24,
      congestionDelta: -18,
      expDelta: +31,
      roi: 3.2,
      leadTime: '4 Days',
      risk: 'Very Low',
      description: 'Displays multi-lingual queue status and dynamic detour guidance in real-time.'
    }
  ];

  const toggleIntervention = (id) => {
    setSelectedInterventions(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const activeItems = catalog.filter(c => selectedInterventions.includes(c.id));
  const totalCost = activeItems.reduce((acc, curr) => acc + curr.cost, 0);
  const avgSafety = activeItems.length ? Math.round(activeItems.reduce((a, b) => a + b.safetyDelta, 0) / activeItems.length) : 0;
  const avgAccess = activeItems.length ? Math.round(activeItems.reduce((a, b) => a + b.accessDelta, 0) / activeItems.length) : 0;
  const avgCongest = activeItems.length ? Math.round(activeItems.reduce((a, b) => a + b.congestionDelta, 0) / activeItems.length) : 0;
  const avgExp = activeItems.length ? Math.round(activeItems.reduce((a, b) => a + b.expDelta, 0) / activeItems.length) : 0;
  
  const compositeImpact = (avgSafety * 0.25) + (avgAccess * 0.30) + (Math.abs(avgCongest) * 0.25) + (avgExp * 0.20);
  const compositeROI = totalCost > 0 ? ((compositeImpact * 1000) / totalCost).toFixed(2) : '0.00';

  const applyInterventionsToScenario = () => {
    showToast(`Applied ${activeItems.length} interventions to Proposed Scenario!`, 'success');
  };

  return (
    <div className="moduleContainer">
      {/* Header */}
      <div className="moduleHeaderRow">
        <div>
          <div className="moduleTagBlock">
            <span className="moduleTagPill">MODULE 11 • CAPITAL EFFICIENCY</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Deterministic ROI & Value Frontier</span>
          </div>
          <h1 className="moduleTitleText">Cost vs Impact Architecture</h1>
          <p className="moduleDescText">
            Evaluate spatial intervention Capex against deterministic safety, accessibility, throughput, and experience gains.
          </p>
        </div>

        <button onClick={applyInterventionsToScenario} className="primaryBtn">
          <CheckCircle2 size={15} />
          <span>Apply Portfolio to Proposed Scenario</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="moduleMetricsRow">
        <div className="moduleMetricCard">
          <span className="metricCardLabel">Total Portfolio Capex</span>
          <div className="metricCardVal">{currencySymbol}{(totalCost * currencyMultiplier).toLocaleString()}</div>
          <span className="metricCardSub" style={{ color: totalCost <= budgetLimit ? "var(--green)" : "var(--red)" }}>
            {totalCost <= budgetLimit ? `✓ Within ${currencySymbol}${(budgetLimit * currencyMultiplier).toLocaleString()} Budget` : `⚠ Exceeds Budget Limit`}
          </span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Accessibility Gain</span>
          <div className="metricCardVal" style={{ color: "var(--violet)" }}>+{avgAccess}%</div>
          <span className="metricCardSub">ADA route compliance</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Congestion Relief</span>
          <div className="metricCardVal" style={{ color: "var(--cyan)" }}>{avgCongest}%</div>
          <span className="metricCardSub">Bottleneck elimination</span>
        </div>

        <div className="moduleMetricCard">
          <span className="metricCardLabel">Safety Index Boost</span>
          <div className="metricCardVal" style={{ color: "var(--green)" }}>+{avgSafety}%</div>
          <span className="metricCardSub">Egress throughput</span>
        </div>

        <div className="moduleMetricCard" style={{ borderColor: "rgba(16, 185, 129, 0.4)" }}>
          <span className="metricCardLabel">ROI Efficiency</span>
          <div className="metricCardVal" style={{ color: "var(--green)" }}>{compositeROI}x</div>
          <span className="metricCardSub">Impact-to-Capex ratio</span>
        </div>
      </div>

      {/* Main Grid: Catalog and Frontier */}
      <div className="moduleWorkspaceGrid">
        {/* Left: Interventions Catalog */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
              <BarChart3 size={15} className="iconCyan" />
              Candidate Spatial & Operational Interventions ({selectedInterventions.length}/{catalog.length} Selected)
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
              <span>Budget Cap:</span>
              <input 
                type="range" 
                min="10000" 
                max="80000" 
                step="5000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                style={{ width: "90px", cursor: "pointer", accentColor: "var(--cyan)" }}
              />
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--cyan)", fontWeight: 700 }}>
                {currencySymbol}{(budgetLimit * currencyMultiplier).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {catalog.map(item => {
              const isSelected = selectedInterventions.includes(item.id);
              const isBestValue = item.roi >= 4.0;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleIntervention(item.id)}
                  style={{
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                    border: isSelected ? "1px solid var(--cyan)" : "1px solid var(--border-subtle)",
                    background: isSelected ? "rgba(8, 18, 31, 0.95)" : "rgba(8, 18, 31, 0.4)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 0 16px rgba(56, 189, 248, 0.15)" : "none"
                  }}
                >
                  {isBestValue && (
                    <span style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.35)",
                      color: "var(--amber)",
                      fontSize: "9px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700
                    }}>
                      ★ BEST VALUE
                    </span>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "4px",
                      border: isSelected ? "1px solid var(--cyan)" : "1px solid var(--text-dim)",
                      background: isSelected ? "var(--cyan)" : "transparent",
                      display: "grid",
                      placeItems: "center",
                      color: "#000000",
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>
                      {isSelected && <CheckCircle2 size={13} strokeWidth={3} />}
                    </div>

                    <div style={{ flex: 1, paddingRight: isBestValue ? "70px" : "0" }}>
                      <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-dim)", textTransform: "uppercase" }}>
                        {item.category}
                      </span>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
                        {item.name}
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                        {item.description}
                      </p>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "6px",
                        marginTop: "10px",
                        paddingTop: "8px",
                        borderTop: "1px solid var(--border-subtle)",
                        fontSize: "9.5px",
                        fontFamily: "var(--font-mono)"
                      }}>
                        <div>
                          <span style={{ color: "var(--text-dim)", display: "block" }}>COST</span>
                          <span style={{ color: "#ffffff", fontWeight: 700 }}>{currencySymbol}{(item.cost * currencyMultiplier).toLocaleString()}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-dim)", display: "block" }}>ACCESS</span>
                          <span style={{ color: "var(--violet)", fontWeight: 700 }}>+{item.accessDelta}%</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-dim)", display: "block" }}>CONGEST</span>
                          <span style={{ color: "var(--cyan)", fontWeight: 700 }}>{item.congestionDelta}%</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-dim)", display: "block" }}>ROI</span>
                          <span style={{ color: "var(--green)", fontWeight: 700 }}>{item.roi}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI Synthesis Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="panelDark">
            <div className="panelDarkTitle">
              <Zap size={14} className="iconGreen" />
              <span>AI VALUE FRONTIER RECOMMENDATION</span>
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
                ★ Top Synergy Recommendation:
              </b>
              Pairing the <strong style={{ color: "#ffffff" }}>ADA Grade 1:12 Dual-Access Ramp</strong> with the <strong style={{ color: "#ffffff" }}>Central Registration Relocation</strong> yields a <strong>4.35x ROI multiplier</strong>, solving both the Title III wheelchair penalty and eliminating peak bottleneck for under {currencySymbol}{(17000 * currencyMultiplier).toLocaleString()}.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px", fontSize: "11.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Implementation Lead Time:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "#ffffff", fontWeight: 700 }}>10 Business Days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ color: "var(--text-muted)" }}>Payback Period:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>4.2 Months (Staff Efficiency)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Operational Disruption:</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--amber)", fontWeight: 700 }}>Low (Weekend Phasing)</span>
              </div>
            </div>
          </div>

          <div className="panelDark">
            <div className="panelDarkTitle">
              <Shield size={14} className="iconCyan" />
              <span>CAPITAL RETURN METRICS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Capital Efficiency Index</span>
                  <span style={{ color: "var(--green)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {Math.min(100, Math.round(compositeImpact * 1.5))}%
                  </span>
                </div>
                <div style={{ height: "6px", background: "rgba(0, 0, 0, 0.4)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, compositeImpact * 1.5)}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #38bdf8)" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Implementation Feasibility</span>
                  <span style={{ color: "var(--violet)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>92%</span>
                </div>
                <div style={{ height: "6px", background: "rgba(0, 0, 0, 0.4)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: "92%", height: "100%", background: "linear-gradient(90deg, #6366f1, #38bdf8)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
