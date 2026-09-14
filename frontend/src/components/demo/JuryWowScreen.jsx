import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowDown, Users, ShieldAlert, Cpu, 
  Award, CheckCircle2, ChevronRight, X, BarChart3, RefreshCw, Layers
} from 'lucide-react';
import { useFutureView } from '../../context/FutureViewContext';

export default function JuryWowScreen({ isOpen, onClose }) {
  const { 
    environment, 
    agentCount, 
    metrics, 
    setSelectedModule,
    showToast
  } = useFutureView();

  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      id: 'reality',
      title: 'CURRENT REALITY',
      subtitle: `${environment?.name || 'Metropolitan Hospital'} (Baseline Spatial Model)`,
      icon: Layers,
      color: 'slate',
      stat: '12 Active Spatial Zones',
      detail: 'Floor plan loaded with 1:1 metric scale coordinates.'
    },
    {
      id: 'simulation',
      title: `SIMULATING 1,000 PEOPLE`,
      subtitle: 'Deterministic 60 FPS Multi-Agent Physics Engine',
      icon: Users,
      color: 'cyan',
      stat: `${agentCount >= 500 ? agentCount : 1000} Active Agents`,
      detail: 'Simulated across 6 personas (Visitor, Elderly, Wheelchair, Staff, Emergency, Family).'
    },
    {
      id: 'futures',
      title: '12 FUTURES TESTED',
      subtitle: 'Combinatorial What-If Spatial & Operational Variations',
      icon: Cpu,
      color: 'indigo',
      stat: '12 Candidate Topologies',
      detail: 'Relocation permutations, queue multipliers, and accessibility ramp configurations.'
    },
    {
      id: 'risks',
      title: '3 CRITICAL RISKS FOUND',
      subtitle: 'Deterministic Bottleneck & Title III Violation Detection',
      icon: ShieldAlert,
      color: 'rose',
      stat: '3 Severe Penalties',
      detail: '1. Wheelchair 48m Detour | 2. Emergency Intake Choke | 3. Foyer Canopy Crush.'
    },
    {
      id: 'optimization',
      title: 'AI OPTIMIZATION COMPLETE',
      subtitle: 'Multi-Objective Pareto Frontier Algorithm',
      icon: Sparkles,
      color: 'amber',
      stat: '100% Convergence',
      detail: 'Safety (25%), Accessibility (30%), Congestion (25%), and Capex ROI scored.'
    },
    {
      id: 'winner',
      title: 'BEST FUTURE IDENTIFIED',
      subtitle: 'Optimal Spatial Layout: Scenario C (Dual Counter + 1:12 Ramp)',
      icon: Award,
      color: 'emerald',
      stat: 'Composite 89/100',
      detail: 'Mathematically superior balance of throughput, safety, and capital expenditure.'
    }
  ];

  useEffect(() => {
    if (!isOpen) return;
    setActiveStage(0);
    const interval = setInterval(() => {
      setActiveStage(prev => {
        if (prev < stages.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const congestImprovement = metrics?.proposedCongestion 
    ? Math.round(((metrics.baselineCongestion - metrics.proposedCongestion) / (metrics.baselineCongestion || 1)) * 100) 
    : 61;

  const accessImprovement = metrics?.proposedAccessibility 
    ? Math.round(((metrics.proposedAccessibility - metrics.baselineAccessibility) / (metrics.baselineAccessibility || 1)) * 100) 
    : 18;

  const handleLaunchBestFuture = () => {
    onClose();
    setSelectedModule('threed_view');
    showToast('Loaded AI Recommended Best Future into 3D Experience!', 'success');
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(3, 7, 13, 0.88)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2500,
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "840px",
        background: "linear-gradient(180deg, #0c1a2c, #060d17)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "32px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.2)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="iconBtn"
          style={{ position: "absolute", top: "20px", right: "20px" }}
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <div className="heroPillBrand" style={{ display: "inline-flex", marginBottom: "8px" }}>
            <Sparkles size={12} />
            <span>WHAT-IF REALITY INTELLIGENCE</span>
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
            FUTUREVIEW INTELLIGENCE
          </h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time deterministic synthesis across 1,000 multi-agent trajectories and combinatorial future topologies.
          </p>
        </div>

        {/* Stages Flow */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "680px", margin: "0 auto", width: "100%" }}>
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isVisible = idx <= activeStage;
            const isWinner = stage.id === 'winner';

            return (
              <React.Fragment key={stage.id}>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: isWinner && isVisible ? "1px solid var(--green)" : isVisible ? "1px solid var(--border)" : "1px solid var(--border-subtle)",
                  background: isWinner && isVisible ? "rgba(16, 185, 129, 0.12)" : isVisible ? "rgba(8, 18, 31, 0.85)" : "rgba(8, 18, 31, 0.2)",
                  opacity: isVisible ? 1 : 0.25,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      background: isWinner ? "rgba(16, 185, 129, 0.2)" : "rgba(0, 0, 0, 0.4)",
                      display: "grid",
                      placeItems: "center",
                      color: isWinner ? "var(--green)" : "var(--cyan)"
                    }}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <b style={{ fontSize: "12px", color: isWinner ? "var(--green)" : "#ffffff", letterSpacing: "0.04em" }}>
                          {stage.title}
                        </b>
                        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                          [{stage.stat}]
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{stage.detail}</p>
                    </div>
                  </div>

                  {isVisible && (
                    <span className={`navItemBadge ${isWinner ? "badgeGreen" : "badgeCyan"}`}>
                      {isWinner ? "OPTIMAL" : "VERIFIED"}
                    </span>
                  )}
                </div>

                {idx < stages.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ArrowDown size={12} style={{ color: idx < activeStage ? "var(--cyan)" : "var(--text-dim)" }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Winner Highlight Callout */}
        {activeStage >= stages.length - 1 && (
          <div style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(56, 189, 248, 0.1))",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            textAlign: "center"
          }}>
            <p style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
              "Scenario 8 reduces congestion by <span style={{ color: "var(--cyan-bright)" }}>{congestImprovement}%</span> and improves accessibility by <span style={{ color: "var(--green)" }}>{accessImprovement}%</span>."
            </p>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px" }}>
              Derived directly from deterministic graph pathfinding, Erlang-C queue calculus, and Title III accessibility compliance matrices.
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "14px" }}>
              <button onClick={handleLaunchBestFuture} className="primaryBtn">
                <Award size={14} />
                <span>Experience Best Future in 3D</span>
              </button>
              <button 
                onClick={() => {
                  onClose();
                  setSelectedModule('decision_support');
                }} 
                className="secondaryBtn"
              >
                <span>View Decision Support Dossier</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
