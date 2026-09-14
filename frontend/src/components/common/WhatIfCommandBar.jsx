import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Layers,
  ChevronRight,
  BrainCircuit,
  CornerDownRight,
  RotateCcw
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function WhatIfCommandBar({ className = "" }) {
  const {
    whatIfPipeline,
    setWhatIfPipeline,
    askWhatIf,
    currentEnv,
    loading,
    setSelectedModule,
    setTab
  } = useFutureView();

  const [inputQuery, setInputQuery] = useState(whatIfPipeline?.query || "What if emergency traffic increases by 40%?");

  const navigateTo = (mod) => {
    if (setSelectedModule) setSelectedModule(mod);
    if (setTab) setTab(mod);
  };

  const sampleQueries = [
    "What if emergency traffic increases by 40%?",
    "What if we move triage desk to east wing?",
    "What if secondary fire exit is blocked?",
    "What if we install 2 self-service AI kiosks near entrance?"
  ];

  const handleRun = (q) => {
    const queryToRun = q || inputQuery;
    if (!queryToRun.trim()) return;
    askWhatIf(queryToRun);
  };

  const status = whatIfPipeline?.status || "idle";

  return (
    <div className={`whatIfCommandBarContainer ${className}`}>
      {/* Top Banner & Header */}
      <div className="whatIfBarHeader">
        <div className="whatIfTitleGroup">
          <div className="whatIfIconPulse">
            <Sparkles size={16} className="iconCyan" />
          </div>
          <div>
            <div className="whatIfBrandBadge">COUNTERFACTUAL REASONING ENGINE</div>
            <h3 className="whatIfHeading">Ask Any Spatial "What-If" Question</h3>
          </div>
        </div>

        {/* Stage Badges Indicator */}
        <div className="whatIfStageSteps">
          <div className={`stageStep ${status === "understanding" ? "active" : status === "intent_ready" || status === "simulating" || status === "results_ready" ? "completed" : ""}`}>
            <span className="stepDot" />
            <span className="stepText">1. UNDERSTAND</span>
          </div>
          <div className="stageArrow">›</div>
          <div className={`stageStep ${status === "intent_ready" ? "active" : status === "simulating" || status === "results_ready" ? "completed" : ""}`}>
            <span className="stepDot" />
            <span className="stepText">2. SPATIAL INTENT</span>
          </div>
          <div className="stageArrow">›</div>
          <div className={`stageStep ${status === "simulating" ? "active" : status === "results_ready" ? "completed" : ""}`}>
            <span className="stepDot" />
            <span className="stepText">3. SIMULATE</span>
          </div>
          <div className="stageArrow">›</div>
          <div className={`stageStep ${status === "results_ready" ? "active completed" : ""}`}>
            <span className="stepDot" />
            <span className="stepText">4. RESULTS READY</span>
          </div>
        </div>
      </div>

      {/* Input Box & Action */}
      <div className="whatIfInputRow">
        <div className="whatIfInputWrapper">
          <BrainCircuit size={18} className="whatIfInputIcon" />
          <input
            type="text"
            className="whatIfInput"
            placeholder={`Ask a what-if question for ${currentEnv?.name || "current space"}...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRun();
            }}
          />
        </div>

        <button
          className="primaryBtn whatIfSubmitBtn"
          disabled={loading || status === "understanding" || status === "simulating"}
          onClick={() => handleRun()}
        >
          {loading || status === "understanding" || status === "simulating" ? (
            <>
              <Activity size={15} className="spinnerIcon" />
              <span>PROCESSING...</span>
            </>
          ) : (
            <>
              <Zap size={15} />
              <span>SIMULATE WHAT-IF</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Quick Chips */}
      <div className="whatIfPresetRow">
        <span className="presetLabel">POPULAR BENCHMARKS:</span>
        <div className="presetChips">
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              className="presetChip"
              onClick={() => {
                setInputQuery(sq);
                handleRun(sq);
              }}
            >
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Stage Feedback Panel */}
      {status !== "idle" && (
        <div className={`whatIfFeedbackPanel stage-${status}`}>
          {status === "understanding" && (
            <div className="feedbackStageRow">
              <div className="stageSpinnerPulse" />
              <div className="stageFeedbackText">
                <b>STAGE 1: UNDERSTANDING REQUEST...</b>
                <span>Analyzing natural language spatial intent, parsing mutation target and flow velocity changes.</span>
              </div>
            </div>
          )}

          {status === "intent_ready" && (
            <div className="feedbackStageRow">
              <CheckCircle2 size={18} className="iconCyan" />
              <div className="stageFeedbackText">
                <b>STAGE 2: SPATIAL INTENT EXTRACTED</b>
                <div className="intentBadgeList">
                  <span className="intentBadge">
                    INTENT: <strong>{whatIfPipeline.parsedIntent?.label || "Traffic Surge"}</strong>
                  </span>
                  <span className="intentBadge">
                    TARGET: <strong>{whatIfPipeline.parsedIntent?.target_name || "Emergency Triage"}</strong>
                  </span>
                  <span className="intentBadge">
                    MAGNITUDE: <strong>+{whatIfPipeline.parsedIntent?.value || 40}%</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {status === "simulating" && (
            <div className="feedbackStageRow">
              <Activity size={18} className="iconAmber spinnerIcon" />
              <div className="stageFeedbackText">
                <b>STAGE 3: SIMULATING COUNTERFACTUAL PHYSICS...</b>
                <span>Computing deterministic multi-agent A* trajectories, density maps, and queue dynamics.</span>
              </div>
            </div>
          )}

          {status === "results_ready" && (
            <div className="feedbackStageResults">
              <div className="feedbackResultsTop">
                <div className="resTitleGroup">
                  <CheckCircle2 size={18} className="iconGreen" />
                  <div>
                    <b>STAGE 4: COUNTERFACTUAL RESULTS READY</b>
                    <span>Deterministic physical simulation verified. Causal explanation chain synthesized below:</span>
                  </div>
                </div>
                <div className="resActionGroup">
                  <button
                    className="secondaryBtn small"
                    onClick={() => navigateTo("simulator")}
                  >
                    <span>Inspect in 2D Simulator</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    className="secondaryBtn small"
                    onClick={() => navigateTo("3d")}
                  >
                    <span>View in 3D</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    className="primaryBtn small"
                    onClick={() => navigateTo("comparison")}
                  >
                    <span>Open Comparison Matrix</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Causal Explanation Chain Trace */}
              {whatIfPipeline.causalChain && whatIfPipeline.causalChain.length > 0 && (
                <div className="causalChainBox">
                  <div className="causalChainHeader">
                    <BrainCircuit size={13} className="iconCyan" />
                    <span>WHY DID THIS HAPPEN? — DETERMINISTIC CAUSAL CHAIN</span>
                  </div>
                  <div className="causalChainSteps">
                    {whatIfPipeline.causalChain.map((step, idx) => (
                      <div key={idx} className="causalStepItem">
                        <span className="causalStepNum">{String(idx + 1).padStart(2, "0")}</span>
                        <span className="causalStepDesc">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
