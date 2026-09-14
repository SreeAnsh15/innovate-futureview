import React, { useState } from "react";
import {
  Navigation,
  Users,
  Compass,
  Clock,
  Activity,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function JourneyExperience() {
  const {
    currentEnv,
    proposalPosition,
    simulationResult,
    selectedPersona,
    setSelectedPersona,
    onApplyRecommendation
  } = useFutureView();

  const [activePersona, setActivePersona] = useState(selectedPersona || "visitor");
  const isFar = proposalPosition.x > 60;

  const personas = [
    { id: "visitor", name: "Standard Adult Visitor", speed: "1.35 m/s", color: "#38bdf8" },
    { id: "elderly", name: "Elderly Patient (Mobility-Limited)", speed: "0.85 m/s", color: "#fbbf24" },
    { id: "wheelchair", name: "Wheelchair User (ADA Dependent)", speed: "1.00 m/s", color: "#34d399" },
    { id: "staff", name: "Staff Clinician / Nurse", speed: "1.55 m/s", color: "#a78bfa" },
    { id: "emergency", name: "Emergency Patient / Gurney", speed: "2.10 m/s", color: "#f43f5e" }
  ];

  const currentPersonaObj = personas.find((p) => p.id === activePersona) || personas[0];

  // 5-Stage Journey Flow Definition
  const journeyStages = [
    {
      step: "01",
      name: "Main Ingress & Foyer",
      location: "Main Entrance",
      distanceBase: "0.0m",
      distanceProp: "0.0m",
      timeBase: "00:00",
      timeProp: "00:00",
      friction: "LOW",
      note: "Initial arrival and temperature / security check."
    },
    {
      step: "02",
      name: "Registration & Check-In Desk",
      location: isFar ? "East Wing Secondary Hall" : "Central Foyer",
      distanceBase: "28.0m",
      distanceProp: isFar ? "75.0m (+47m)" : "28.0m",
      timeBase: "00:25",
      timeProp: isFar ? "01:28 (+63s)" : "00:25",
      friction: isFar ? "CRITICAL" : "LOW",
      note: isFar ? "Extended transit path causing fatigue." : "Direct line-of-sight access."
    },
    {
      step: "03",
      name: "Waiting Lounge & Seating",
      location: "Patient Waiting Lounge",
      distanceBase: "54.0m",
      distanceProp: isFar ? "98.0m" : "54.0m",
      timeBase: "03:45",
      timeProp: isFar ? "05:10" : "03:45",
      friction: isFar ? "HIGH" : "LOW",
      note: "Rest area while awaiting call for consultation."
    },
    {
      step: "04",
      name: "Doctor Consultation / Service",
      location: "Clinical Triage Dept",
      distanceBase: "78.0m",
      distanceProp: isFar ? "112.0m" : "78.0m",
      timeBase: "12:00",
      timeProp: isFar ? "14:20" : "12:00",
      friction: "MODERATE",
      note: "Primary destination & clinical assessment."
    },
    {
      step: "05",
      name: "Pharmacy & Egress",
      location: "Outpatient Pharmacy & Exit",
      distanceBase: "95.0m",
      distanceProp: isFar ? "138.0m" : "95.0m",
      timeBase: "18:30",
      timeProp: isFar ? "22:45" : "18:30",
      friction: isFar ? "HIGH" : "LOW",
      note: "Prescription fulfillment and building egress."
    }
  ];

  const baselineExperienceScore = 89;
  const proposedExperienceScore = isFar ? 48 : 94;

  return (
    <div className="modulePage">
      {/* 1. Module Top Bar */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge cyan">
            <Navigation size={14} />
            <span>MODULE 08</span>
          </div>
          <h2 className="moduleTitle">End-to-End Persona Journey Experience</h2>
          <span className="moduleSubtitle">
            Step-by-step visitor journey mapping (Entrance → Registration → Waiting → Service → Exit) comparing Baseline vs Proposed cognitive and physical friction.
          </span>
        </div>

        {/* Journey Score Ribbon */}
        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>BASELINE UX SCORE</small>
            <b className="good">{baselineExperienceScore}/100</b>
          </div>
          <div className="headerStatBox">
            <small>PROPOSED UX SCORE</small>
            <b className={proposedExperienceScore >= 80 ? "good" : "bad"}>
              {proposedExperienceScore}/100 (Δ {proposedExperienceScore - baselineExperienceScore} pts)
            </b>
          </div>
          <div className="headerStatBox">
            <small>TOTAL TRANSIT DISTANCE</small>
            <b className={isFar ? "bad" : "good"}>
              {isFar ? "138.0m (+43.0m)" : "95.0m"}
            </b>
          </div>
          <div className="headerStatBox">
            <small>CORRIDOR TURNS</small>
            <b className={isFar ? "bad" : "good"}>{isFar ? "7 Turns" : "3 Turns"}</b>
          </div>
        </div>
      </div>

      {/* 2. Persona Tabs */}
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
              <small>Velocity: {p.speed}</small>
            </div>
          </button>
        ))}
      </div>

      {/* 3. Main Stage-by-Stage Journey Stepper */}
      <div className="moduleWorkspaceGrid">
        {/* Left 65%: 5-Stage Stepper */}
        <div className="accessibilityLeftCol">
          <div className="accessCard">
            <div className="cardHead">
              <Compass size={16} className="iconCyan" />
              <b>5-Stage Wayfinding & Friction Ledger: {currentPersonaObj.name}</b>
            </div>

            <div className="journeyStepperList">
              {journeyStages.map((st, i) => (
                <div key={st.step} className={`journeyStageCard ${st.friction === "CRITICAL" ? "critical" : ""}`}>
                  <div className="stageNumBox">
                    <span>{st.step}</span>
                  </div>

                  <div className="stageContent">
                    <div className="stageHeaderRow">
                      <div>
                        <strong className="stageTitle">{st.name}</strong>
                        <span className="stageLocation">&bull; {st.location}</span>
                      </div>
                      <span className={`frictionBadge ${st.friction.toLowerCase()}`}>
                        {st.friction} FRICTION
                      </span>
                    </div>

                    <p className="stageNote">{st.note}</p>

                    <div className="stageMetricsRow">
                      <div className="stageMetricItem">
                        <small>BASELINE DISTANCE</small>
                        <b>{st.distanceBase}</b>
                      </div>
                      <div className="stageMetricItem">
                        <small>PROPOSED DISTANCE</small>
                        <b className={st.distanceProp.includes("+") ? "bad" : "good"}>
                          {st.distanceProp}
                        </b>
                      </div>
                      <div className="stageMetricItem">
                        <small>TIME CONSUMED</small>
                        <b className={st.timeProp.includes("+") ? "bad" : "good"}>
                          {st.timeProp}
                        </b>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 35%: Journey Intelligence Summary */}
        <div className="moduleSidePanel">
          <div className="sidePanelCard aiJourneyCard">
            <div className="cardHead">
              <Sparkles size={16} className="iconCyan" />
              <b>AI Journey Friction Diagnosis</b>
            </div>

            <p className="aiJourneyText">
              {isFar
                ? `The proposed location introduces 4 additional 90° corner turns and adds 43.0m of cumulative walking. For ${currentPersonaObj.name}, this represents a +45% cognitive and physical effort penalty. Recommendation: Return registration to the entrance concourse.`
                : `Optimal 3-turn journey with continuous line-of-sight visibility. Meets intuitive wayfinding benchmarks.`}
            </p>

            <button
              className="primaryBtn fullWidth"
              onClick={() => onApplyRecommendation({ x: 28.0, y: 40.0 })}
            >
              <Sparkles size={14} />
              <span>Restore Optimal Wayfinding Path</span>
            </button>
          </div>

          <div className="sidePanelCard">
            <div className="cardHead">
              <CheckCircle2 size={16} className="iconGreen" />
              <b>Wayfinding Usability Metrics</b>
            </div>
            <div className="complianceCheckList">
              <div className="checkItem">
                <CheckCircle2 size={15} className={isFar ? "iconRed" : "iconGreen"} />
                <span>Line-of-Sight from Foyer: {isFar ? "Obstructed" : "Direct"}</span>
              </div>
              <div className="checkItem">
                <CheckCircle2 size={15} className={isFar ? "iconRed" : "iconGreen"} />
                <span>Wayfinding Turn Complexity: {isFar ? "High (7 Turns)" : "Low (3 Turns)"}</span>
              </div>
              <div className="checkItem">
                <CheckCircle2 size={15} className={isFar ? "iconAmber" : "iconGreen"} />
                <span>Rest Area Frequency: Every {isFar ? "55m" : "25m"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
