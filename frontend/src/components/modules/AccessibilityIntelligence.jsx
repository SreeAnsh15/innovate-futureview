import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Navigation,
  Sparkles,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  MapPin,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function AccessibilityIntelligence() {
  const {
    currentEnv,
    proposalPosition,
    simulationResult,
    selectedPersona,
    setSelectedPersona,
    onApplyRecommendation,
    onAddObject
  } = useFutureView();

  const [activePersona, setActivePersona] = useState(selectedPersona || "wheelchair");
  const metrics = simulationResult?.metrics;
  const isFarDisplaced = proposalPosition.x > 60;

  // Accessibility Personas
  const personas = [
    {
      id: "wheelchair",
      name: "Wheelchair User",
      subtitle: "Requires >1.8m width, ramp slope <1:12, zero step curbs",
      standardDist: 35.7,
      detourDist: isFarDisplaced ? 83.7 : 38.2,
      detourPct: isFarDisplaced ? "+134%" : "+7%",
      score: isFarDisplaced ? 54 : 96,
      affectedShare: "12% of total visitors",
      color: "#34d399"
    },
    {
      id: "elderly",
      name: "Elderly & Mobility-Limited",
      subtitle: "Sensitive to continuous walking >45m without rest benches",
      standardDist: 35.7,
      detourDist: isFarDisplaced ? 79.4 : 36.8,
      detourPct: isFarDisplaced ? "+122%" : "+3%",
      score: isFarDisplaced ? 62 : 94,
      affectedShare: "22% of total visitors",
      color: "#fbbf24"
    },
    {
      id: "visually_impaired",
      name: "Visually Impaired",
      subtitle: "Requires tactile guiding pathways and straight transit lines",
      standardDist: 35.7,
      detourDist: isFarDisplaced ? 72.1 : 35.7,
      detourPct: isFarDisplaced ? "+102%" : "0%",
      score: isFarDisplaced ? 58 : 95,
      affectedShare: "8% of total visitors",
      color: "#a78bfa"
    },
    {
      id: "stroller_family",
      name: "Family with Stroller",
      subtitle: "Requires wide elevator access & clearance around stanchions",
      standardDist: 35.7,
      detourDist: isFarDisplaced ? 76.5 : 37.0,
      detourPct: isFarDisplaced ? "+114%" : "+4%",
      score: isFarDisplaced ? 68 : 92,
      affectedShare: "15% of total visitors",
      color: "#f472b6"
    }
  ];

  const currentPersonaData = personas.find((p) => p.id === activePersona) || personas[0];

  const barriers = [
    {
      id: "b1",
      name: "Excessive Corridor Transit Detour",
      type: "Distance Penalty",
      location: "East Wing Secondary Corridor",
      impact: isFarDisplaced ? "+48.0m Detour" : "None Detected",
      severity: isFarDisplaced ? "CRITICAL" : "LOW",
      code: "ADA Standard §403.5.1"
    },
    {
      id: "b2",
      name: "Corridor Width Chokepoint (<1.8m)",
      type: "Geometric Width",
      location: "Waiting Area Ingress Corner",
      impact: isFarDisplaced ? "1.4m Narrow Pinch (Wheelchair Collision)" : "2.8m Clear Width",
      severity: isFarDisplaced ? "HIGH" : "COMPLIANT",
      code: "ADA Standard §404.2.4"
    },
    {
      id: "b3",
      name: "Rest Stop & Resting Bench Availability",
      type: "Fatigue Threshold",
      location: "Central Concourse Spine",
      impact: isFarDisplaced ? "Exceeds 45m unassisted walking limit" : "Benches every 18m",
      severity: isFarDisplaced ? "HIGH" : "COMPLIANT",
      code: "Universal Healthcare Design Guideline"
    },
    {
      id: "b4",
      name: "Cross-Traffic Collision Hazard",
      type: "Safety Friction",
      location: "Emergency Triage Ingress Path",
      impact: isFarDisplaced ? "Crosses rapid emergency gurney route" : "Dedicated bypass aisle",
      severity: isFarDisplaced ? "CRITICAL" : "COMPLIANT",
      code: "NFPA 101 Egress Separation"
    }
  ];

  const handleAddAccessibleRamp = () => {
    onAddObject({
      id: `ramp_${Date.now()}`,
      name: "Dedicated ADA Accessible Ramp",
      kind: "service",
      x: 22,
      y: 35,
      w: 16,
      h: 8,
      movable: true,
      critical: false,
      capacity: 50,
      accessibility_priority: "critical"
    });
  };

  return (
    <div className="modulePage">
      {/* 1. Module Top Bar */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge green">
            <ShieldCheck size={14} />
            <span>MODULE 05</span>
          </div>
          <h2 className="moduleTitle">Accessibility Intelligence Engine</h2>
          <span className="moduleSubtitle">
            ADA Title III compliance auditor and universal design simulator for wheelchair, elderly, and mobility-limited users.
          </span>
        </div>

        {/* Accessibility KPI Ribbon */}
        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>ADA SCORE</small>
            <b className={currentPersonaData.score >= 80 ? "good" : "bad"}>
              {currentPersonaData.score}/100
            </b>
          </div>
          <div className="headerStatBox">
            <small>ACCESSIBLE DETOUR</small>
            <b className={isFarDisplaced ? "bad" : "good"}>
              {currentPersonaData.detourPct} ({currentPersonaData.detourDist}m)
            </b>
          </div>
          <div className="headerStatBox">
            <small>AFFECTED POPULATION</small>
            <b className="amber">{currentPersonaData.affectedShare}</b>
          </div>
          <div className="headerStatBox">
            <small>STATUS</small>
            <b className={isFarDisplaced ? "bad" : "good"}>
              {isFarDisplaced ? "NON-COMPLIANT" : "ADA COMPLIANT"}
            </b>
          </div>
        </div>
      </div>

      {/* 2. Persona Switcher Tabs */}
      <div className="personaTabsRow">
        {personas.map((p) => (
          <button
            key={p.id}
            className={`personaTabBtn ${activePersona === p.id ? "active" : ""}`}
            onClick={() => {
              setActivePersona(p.id);
              setSelectedPersona(p.id);
            }}
          >
            <span className="personaDot" style={{ backgroundColor: p.color }} />
            <div className="personaTabMeta">
              <strong>{p.name}</strong>
              <small>{p.score}/100 Score</small>
            </div>
          </button>
        ))}
      </div>

      {/* 3. Main Split View: Left Route Analysis & Barriers | Right AI Recommendation */}
      <div className="moduleWorkspaceGrid">
        {/* Left 65%: Detour Comparison & Barrier Matrix */}
        <div className="accessibilityLeftCol">
          {/* Detour Comparison Card */}
          <div className="accessCard">
            <div className="cardHead">
              <Navigation size={16} className="iconCyan" />
              <b>Route Detour & Circulation Comparison: {currentPersonaData.name}</b>
            </div>

            <div className="detourCompareGrid">
              <div className="detourBox standard">
                <span className="detourTag">STANDARD VISITOR ROUTE</span>
                <div className="detourNum">35.7 m</div>
                <p>Direct line-of-sight path from main entrance to primary service desk.</p>
              </div>

              <div className={`detourBox accessible ${isFarDisplaced ? "critical" : "optimal"}`}>
                <span className="detourTag">ACCESSIBLE BARRIER-FREE ROUTE</span>
                <div className={`detourNum ${isFarDisplaced ? "bad" : "good"}`}>
                  {currentPersonaData.detourDist} m
                </div>
                <p>
                  {isFarDisplaced
                    ? `Requires an extra +${(currentPersonaData.detourDist - 35.7).toFixed(1)}m of detour travel because secondary corridor lacks ADA turning clearance.`
                    : "Zero detour friction. Full direct access with wide aisles and no elevation obstacles."}
                </p>
              </div>
            </div>
          </div>

          {/* Barrier Detection Ledger */}
          <div className="accessCard">
            <div className="cardHead">
              <AlertTriangle size={16} className="iconAmber" />
              <b>Detected Physical Spatial Barriers ({barriers.filter((b) => b.severity !== "COMPLIANT").length} Found)</b>
            </div>

            <div className="barrierTableWrapper">
              <table className="barrierTable">
                <thead>
                  <tr>
                    <th>BARRIER NAME</th>
                    <th>LOCATION</th>
                    <th>MEASURED IMPACT</th>
                    <th>COMPLIANCE CODE</th>
                    <th>SEVERITY</th>
                  </tr>
                </thead>
                <tbody>
                  {barriers.map((b) => (
                    <tr key={b.id} className={b.severity === "CRITICAL" ? "rowCritical" : ""}>
                      <td>
                        <b>{b.name}</b>
                        <small className="barrierSub">{b.type}</small>
                      </td>
                      <td>{b.location}</td>
                      <td className={b.severity === "CRITICAL" || b.severity === "HIGH" ? "bad" : "good"}>
                        {b.impact}
                      </td>
                      <td>
                        <span className="codePill">{b.code}</span>
                      </td>
                      <td>
                        <span className={`severityBadge ${b.severity.toLowerCase()}`}>
                          {b.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 35%: AI Accessibility Remediation Lab */}
        <div className="moduleSidePanel">
          <div className="sidePanelCard aiAccessibilityCard">
            <div className="cardHead">
              <Sparkles size={16} className="iconCyan" />
              <b>AI Universal Design Recommendation</b>
            </div>

            <div className="aiAccessibilityQuote">
              <p>
                {isFarDisplaced
                  ? `"Wheelchair users must travel 48.0m farther because the proposed layout blocks the shortest accessible path. Relocate the desk back to the entrance foyer (28m, 40m) or construct a dedicated ramp to prevent ADA Title III civil violation risks."`
                  : `"Current layout maintains unobstructed 2.8m corridors, excellent turning radiuses, and direct ramp connectivity for all mobility categories."`}
              </p>
            </div>

            <div className="remediationActionsList">
              <button
                className="primaryBtn fullWidth"
                onClick={() => onApplyRecommendation({ x: 28.0, y: 38.0 })}
              >
                <Sparkles size={14} />
                <span>Apply ADA Optimal Position (98/100)</span>
              </button>

              <button className="secondaryBtn fullWidth" onClick={handleAddAccessibleRamp}>
                <ShieldCheck size={14} />
                <span>Inject Dedicated ADA Ramp</span>
              </button>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="sidePanelCard">
            <div className="cardHead">
              <CheckCircle2 size={16} className="iconGreen" />
              <b>ADA Compliance Verification Checklist</b>
            </div>
            <div className="complianceCheckList">
              <div className="checkItem">
                <CheckCircle2 size={15} className={isFarDisplaced ? "iconRed" : "iconGreen"} />
                <span>Minimum Corridor Width &gt; 1.8m</span>
              </div>
              <div className="checkItem">
                <CheckCircle2 size={15} className={isFarDisplaced ? "iconRed" : "iconGreen"} />
                <span>Walking Distance from Entrance &lt; 45m</span>
              </div>
              <div className="checkItem">
                <CheckCircle2 size={15} className="iconGreen" />
                <span>Barrier-Free Dual-Height Service Desk</span>
              </div>
              <div className="checkItem">
                <CheckCircle2 size={15} className={isFarDisplaced ? "iconAmber" : "iconGreen"} />
                <span>Direct Visual Line-of-Sight from Ingress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
