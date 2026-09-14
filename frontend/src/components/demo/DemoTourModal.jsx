import React, { useState } from "react";
import {
  Sparkles,
  X,
  Compass,
  Cuboid,
  Eye,
  BrainCircuit,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Layers,
  Users
} from "lucide-react";

export function DemoTourModal({
  isOpen,
  onClose,
  simulationResult,
  activeScenario,
  environment,
  onRunSimulation,
  setTab
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: "intro",
      title: "1. The Spatial Decision Question",
      tag: "OVERVIEW",
      icon: Sparkles,
      content: (
        <div>
          <div className="demoHeroCard">
            <span className="demoFacilityTag">CityCare General Hospital</span>
            <h3>"What happens if we move the Registration Desk?"</h3>
            <p>
              Facility management wants to relocate the main <strong>Registration Desk</strong> from the entrance foyer
              (<code>X: 38, Y: 40</code>) to the eastern corridor (<code>X: 75, Y: 45</code>).
            </p>
          </div>

          <div className="demoComparisonPreview">
            <div className="demoPreviewBox">
              <span className="demoBoxTag">CURRENT BASELINE</span>
              <b>Entrance Foyer Spine</b>
              <small>Walking Distance: ~21.4m &bull; Score: 89/100</small>
            </div>
            <div className="demoArrow">
              <ArrowRight size={20} className="iconCyan" />
            </div>
            <div className="demoPreviewBox proposed">
              <span className="demoBoxTag proposed">PROPOSED WHAT-IF</span>
              <b>East Corridor Relocation</b>
              <small>Walking Distance: ~49.8m (+132.8%) &bull; Score: 48/100</small>
            </div>
          </div>
        </div>
      ),
      actionLabel: "View 2D Multi-Agent Simulation",
      targetTab: "simulator"
    },
    {
      id: "simulator",
      title: "2. 2D Multi-Agent Physics & Heatmaps",
      tag: "2D SIMULATOR",
      icon: Compass,
      content: (
        <div>
          <p className="demoStepDesc">
            FUTUREVIEW’s deterministic engine calculates route graphs using A* pathfinding across 16 multi-archetype agents
            (Visitors, Elderly, Wheelchairs, Emergency Triage, and Staff).
          </p>
          <div className="demoMetricsGrid">
            <div className="demoMetricCard bad">
              <span>Walking Distance</span>
              <b>+132.8%</b>
              <small>21.4m &rarr; 49.8m</small>
            </div>
            <div className="demoMetricCard bad">
              <span>Congestion Index</span>
              <b>48/100</b>
              <small>Surges by +17 pts</small>
            </div>
            <div className="demoMetricCard warning">
              <span>Accessibility Rating</span>
              <b>78/100</b>
              <small>Drops by -16 pts</small>
            </div>
            <div className="demoMetricCard warning">
              <span>Safety & Egress</span>
              <b>68/100</b>
              <small>Drops by -24 pts</small>
            </div>
          </div>
        </div>
      ),
      actionLabel: "Inspect AI Spatial Reasoning",
      targetTab: "ai"
    },
    {
      id: "ai",
      title: "3. AI Spatial Reasoning & Impact Analysis",
      tag: "SPATIAL AI",
      icon: BrainCircuit,
      content: (
        <div>
          <div className="demoAiVerdictBox critical">
            <div className="demoVerdictTop">
              <span className="demoVerdictBadge">DECISION VERDICT: AVOID</span>
              <span className="demoScorePill">48/100 Score &bull; 95% Confidence</span>
            </div>
            <h4>High-friction configuration detected.</h4>
            <p>
              The relocation triples average transit distance and forces elderly visitors across high-traffic secondary corridors,
              creating queue spillovers directly adjacent to emergency triage access.
            </p>
          </div>

          <div className="demoRecRow">
            <div className="demoRecCol">
              <b>Affected User Demographics:</b>
              <span>Elderly Visitors, Wheelchair Users, Emergency Care</span>
            </div>
            <div className="demoRecCol">
              <b>AI Recommendation:</b>
              <span>Maintain desk within front circulation spine with 2.4m clearance.</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: "Launch 3D Spatial Twin",
      targetTab: "3d"
    },
    {
      id: "threed",
      title: "4. 3D Spatial Computing Experience",
      tag: "3D SPATIAL",
      icon: Cuboid,
      content: (
        <div>
          <p className="demoStepDesc">
            The 3D Spatial Engine renders the exact environment geometry with dynamic <strong>Current vs Proposed</strong> toggles,
            path ribbons, animated pedestrian agents, and spatial element raycasting.
          </p>
          <div className="demoFeaturesList">
            <div className="demoFeatItem">
              <CheckCircle2 size={16} className="iconCyan" />
              <span>Toggle <strong>Current Baseline</strong> vs <strong>Proposed What-If</strong> in real time</span>
            </div>
            <div className="demoFeatItem">
              <CheckCircle2 size={16} className="iconCyan" />
              <span>Camera presets: Top Architectural View, 3D Isometric, and Pedestrian Walkthrough</span>
            </div>
            <div className="demoFeatItem">
              <CheckCircle2 size={16} className="iconCyan" />
              <span>Click any 3D object to view live impact delta & affected demographics</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: "Explore AR Experience",
      targetTab: "webxr"
    },
    {
      id: "ar",
      title: "5. WebXR & Desktop AR Experience",
      tag: "AR EXPERIENCE",
      icon: Eye,
      content: (
        <div>
          <p className="demoStepDesc">
            FUTUREVIEW includes authentic WebXR capability detection for immersive AR devices (Meta Quest, Vision Pro, ARCore)
            alongside a rich Desktop AR Spatial Simulator with live webcam video passthrough.
          </p>
          <div className="demoFeaturesList">
            <div className="demoFeatItem">
              <CheckCircle2 size={16} className="iconGreen" />
              <span>Automatic WebXR device detection & graceful desktop fallback</span>
            </div>
            <div className="demoFeatItem">
              <CheckCircle2 size={16} className="iconGreen" />
              <span>Live webcam background feed with interactive scale/rotation sliders</span>
            </div>
            <div className="demoFeatItem">
              <CheckCircle2 size={16} className="iconGreen" />
              <span>Real proposed configuration impact overlays</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: "View Decision Report",
      targetTab: "reports"
    },
    {
      id: "report",
      title: "6. Executive Decision Report & PDF Export",
      tag: "EXECUTIVE REPORT",
      icon: FileText,
      content: (
        <div>
          <p className="demoStepDesc">
            All simulation facts, delta tables, AI interpretations, and alternative configurations are compiled into a formal
            spatial impact assessment ready for stakeholder approval.
          </p>
          <div className="demoReportSummaryBox">
            <div className="repRow">
              <span>Environment:</span>
              <b>CityCare General Hospital</b>
            </div>
            <div className="repRow">
              <span>Proposal:</span>
              <b>Relocate Registration Desk to East Wing</b>
            </div>
            <div className="repRow">
              <span>Final Recommendation:</span>
              <b className="bad">REJECT CONFIGURATION (Score: 48/100)</b>
            </div>
          </div>
        </div>
      ),
      actionLabel: "Open Full Decision Report",
      targetTab: "reports"
    }
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  function handleNext() {
    if (step.targetTab) {
      setTab(step.targetTab);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      const prevStep = steps[currentStep - 1];
      if (prevStep.targetTab) {
        setTab(prevStep.targetTab);
      }
      setCurrentStep(currentStep - 1);
    }
  }

  function handleJumpTo(index) {
    setCurrentStep(index);
    if (steps[index].targetTab) {
      setTab(steps[index].targetTab);
    }
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard demoTourModal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalHeadLeft">
            <Sparkles size={20} className="iconCyan" />
            <div>
              <h3>60-Second Guided Demo Tour</h3>
              <span className="modalSubtitle">CityCare General Hospital &bull; "Relocate Registration Desk" Scenario</span>
            </div>
          </div>
          <button className="iconCloseBtn" onClick={onClose} title="Close Demo Tour">
            <X size={16} />
          </button>
        </div>

        {/* Tour Progress Bar */}
        <div className="demoTourProgress">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              className={`tourStepPill ${idx === currentStep ? "active" : idx < currentStep ? "completed" : ""}`}
              onClick={() => handleJumpTo(idx)}
              title={s.title}
            >
              <span className="stepNumMini">{idx + 1}</span>
              <span className="stepLabelMini">{s.tag}</span>
            </button>
          ))}
        </div>

        {/* Step Body */}
        <div className="demoTourBody">
          <div className="demoStepHeader">
            <div className="stepTagPill">
              <StepIcon size={14} className="iconCyan" />
              <span>{step.tag}</span>
            </div>
            <h4>{step.title}</h4>
          </div>

          <div className="demoStepMain">
            {step.content}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modalActions demoTourActions">
          <button
            className="secondaryBtn"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={14} />
            <span>Previous</span>
          </button>

          <div className="tourCounterText">
            Step <strong>{currentStep + 1}</strong> of {steps.length}
          </div>

          <button className="primaryBtn" onClick={handleNext}>
            <span>{step.actionLabel}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
