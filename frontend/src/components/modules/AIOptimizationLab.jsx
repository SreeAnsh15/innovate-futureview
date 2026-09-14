import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  Scale,
  DollarSign,
  Navigation,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  Flame,
  Award
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function AIOptimizationLab() {
  const {
    currentEnv,
    onApplyRecommendation,
    showToast
  } = useFutureView();

  const [selectedCandidate, setSelectedCandidate] = useState("opt_scen_c");

  const candidates = [
    {
      id: "opt_scen_a",
      name: "Scenario A: Move Registration to Mid-Concourse",
      type: "Spatial Relocation",
      position: { x: 28.0, y: 40.0 },
      cost: "$2,500",
      costNum: 2500,
      safety: 95,
      accessibility: 97,
      congestion: 24,
      walkingDist: "18.2m",
      walkingDelta: "-49%",
      experience: 94,
      overallScore: 95,
      isWinner: false,
      tag: "LOW COST WINNER",
      summary: "Relocates counter 12m closer to entrance along primary hallway. Reduces walking distance by 49% with minimal expense."
    },
    {
      id: "opt_scen_b",
      name: "Scenario B: Add Dual Express Counter",
      type: "Capacity Addition",
      position: { x: 24.0, y: 28.0 },
      cost: "$8,000",
      costNum: 8000,
      safety: 93,
      accessibility: 94,
      congestion: 21,
      walkingDist: "16.5m",
      walkingDelta: "-54%",
      experience: 92,
      overallScore: 93,
      isWinner: false,
      tag: "QUEUE BUSTER",
      summary: "Adds secondary self-service check-in counter at entrance foyer. Distributes queue loads evenly across dual check-in points."
    },
    {
      id: "opt_scen_c",
      name: "Scenario C: Move Registration + Add Dual Counter (AI RECOMMENDED)",
      type: "Comprehensive Optimization",
      position: { x: 26.0, y: 38.0 },
      cost: "$10,500",
      costNum: 10500,
      safety: 98,
      accessibility: 99,
      congestion: 19,
      walkingDist: "16.8m",
      walkingDelta: "-53%",
      experience: 97,
      overallScore: 98,
      isWinner: true,
      tag: "AI BEST FUTURE",
      summary: "Scenario C provides the best overall outcome because it reduces peak congestion by 61%, improves accessibility by 18%, and requires only moderate implementation cost ($10,500)."
    },
    {
      id: "opt_scen_d",
      name: "Scenario D: Redesign Waiting Area Lounge",
      type: "Seating Expansion",
      position: { x: 62.0, y: 24.0 },
      cost: "$16,000",
      costNum: 16000,
      safety: 89,
      accessibility: 91,
      congestion: 31,
      walkingDist: "34.0m",
      walkingDelta: "-5%",
      experience: 88,
      overallScore: 87,
      isWinner: false,
      tag: "COMFORT FOCUS",
      summary: "Expands seating capacity by 40% and repositions partition walls. High comfort for waiting patients but does not solve entrance queue bottlenecks."
    },
    {
      id: "opt_scen_e",
      name: "Scenario E: Add Secondary Circulation Bypass Route",
      type: "Corridor Construction",
      position: { x: 45.0, y: 72.0 },
      cost: "$28,000",
      costNum: 28000,
      safety: 94,
      accessibility: 93,
      congestion: 22,
      walkingDist: "28.5m",
      walkingDelta: "-20%",
      experience: 91,
      overallScore: 91,
      isWinner: false,
      tag: "HIGH CAPITAL",
      summary: "Builds secondary corridor linking entrance directly to pharmacy and diagnostics. Significantly relieves hallway pressure but requires high capital construction."
    },
    {
      id: "opt_scen_f",
      name: "Scenario F: Fast-Track Accessible Express Lane",
      type: "ADA Universal Design",
      position: { x: 18.0, y: 42.0 },
      cost: "$12,000",
      costNum: 12000,
      safety: 96,
      accessibility: 100,
      congestion: 26,
      walkingDist: "19.0m",
      walkingDelta: "-47%",
      experience: 95,
      overallScore: 94,
      isWinner: false,
      tag: "ADA GOLD STANDARD",
      summary: "Dedicated low-incline ramp with automated tactile flooring for mobility-limited visitors. Gold standard ADA compliance with zero-friction entry."
    }
  ];

  const activeCand = candidates.find((c) => c.id === selectedCandidate) || candidates[2];

  return (
    <div className="modulePage">
      {/* 1. Module Header */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge cyan">
            <BrainCircuit size={14} />
            <span>MODULE 10</span>
          </div>
          <h2 className="moduleTitle">AI Multi-Objective Optimization Lab</h2>
          <span className="moduleSubtitle">
            Generative Pareto layout search evaluating 6 candidate spatial interventions to identify the highest ROI future.
          </span>
        </div>

        {/* Header Ribbon */}
        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>CANDIDATES EVALUATED</small>
            <b className="cyan">6 Futures Tested</b>
          </div>
          <div className="headerStatBox">
            <small>AI WINNER</small>
            <b className="green">Scenario C (98/100)</b>
          </div>
          <div className="headerStatBox">
            <small>PEAK CONGESTION CUT</small>
            <b className="good">-61% Reduction</b>
          </div>
          <div className="headerStatBox">
            <small>ACCESSIBILITY GAIN</small>
            <b className="good">+18% Improvement</b>
          </div>
        </div>
      </div>

      {/* 2. Top AI Recommendation Flagship Banner */}
      <div className="aiWinnerBanner">
        <div className="aiWinnerLeft">
          <div className="aiWinnerTrophy">
            <Award size={28} className="iconAmber" />
          </div>
          <div>
            <span className="winnerTag">AI RECOMMENDED OPTIMAL FUTURE</span>
            <h3 className="winnerTitle">Scenario C: Move Registration + Add Dual Counter</h3>
            <p className="winnerRationale">
              "Scenario C provides the best overall outcome because it reduces peak congestion by 61%, improves accessibility by 18%, and requires only moderate implementation cost ($10,500)."
            </p>
          </div>
        </div>

        <button
          className="primaryBtn heroBtn"
          onClick={() => {
            onApplyRecommendation({ x: 26.0, y: 38.0 });
            showToast("Applied Scenario C (AI Best Future) across all 18 modules!");
          }}
        >
          <Sparkles size={16} />
          <span>Apply Winner Across All Modules</span>
        </button>
      </div>

      {/* 3. Candidates Matrix Grid */}
      <div className="candidatesGrid">
        {candidates.map((cand) => {
          const isSelected = selectedCandidate === cand.id;
          return (
            <div
              key={cand.id}
              className={`candidateCard ${cand.isWinner ? "winner" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedCandidate(cand.id)}
            >
              <div className="candCardTop">
                <span className={`candTag ${cand.isWinner ? "winner" : ""}`}>{cand.tag}</span>
                <b className="candScore">{cand.overallScore}/100</b>
              </div>

              <h4 className="candName">{cand.name}</h4>
              <span className="candType">{cand.type} &bull; Cost: {cand.cost}</span>
              <p className="candSummary">{cand.summary}</p>

              <div className="candMetricsGrid">
                <div>
                  <small>Walking</small>
                  <b>{cand.walkingDist} ({cand.walkingDelta})</b>
                </div>
                <div>
                  <small>Congestion</small>
                  <b>{cand.congestion}/100</b>
                </div>
                <div>
                  <small>Accessibility</small>
                  <b>{cand.accessibility}/100</b>
                </div>
                <div>
                  <small>Safety</small>
                  <b>{cand.safety}/100</b>
                </div>
              </div>

              <button
                className="secondaryBtn small fullWidth"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyRecommendation(cand.position);
                  showToast(`Applied ${cand.name}!`);
                }}
              >
                <Sparkles size={13} />
                <span>Morph Layout to This Scenario</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
