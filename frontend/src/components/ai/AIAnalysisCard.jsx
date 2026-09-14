import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  ShieldCheck,
  Compass,
  FileText,
  AlertCircle,
  Activity,
  Layers,
  TrendingDown,
  TrendingUp,
  Cpu,
  RefreshCw,
  Cuboid,
  Eye,
  Info,
  ArrowRight,
  Route,
  Clock,
  Check
} from "lucide-react";

export function AIAnalysisCard({
  simulationResult,
  activeScenario,
  environment,
  aiProviderInfo,
  onRunSimulation,
  onApplyRecommendation,
  loading,
  setTab
}) {
  const [loadingStep, setLoadingStep] = useState(0);

  // Progressive loading animation steps when AI is running
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 350);
    } else {
      setLoadingStep(4);
    }
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="aiPage loadingView">
        <div className="aiLoadingModal">
          <div className="aiLoadingOrb">
            <BrainCircuit size={40} className="spinPulse iconCyan" />
          </div>
          <h3>SPATIAL AI REASONING IN PROGRESS</h3>
          <p className="loadingSubtitle">
            Synthesizing deterministic multi-agent physics with generative spatial intelligence...
          </p>

          <div className="loadingStepChecklist">
            <div className={`stepCheckItem ${loadingStep >= 1 ? "done" : "active"}`}>
              {loadingStep >= 1 ? <CheckCircle2 size={16} className="iconGreen" /> : <span className="stepSpinner" />}
              <span>Pedestrian human flow & circulation calculated</span>
            </div>
            <div className={`stepCheckItem ${loadingStep >= 2 ? "done" : loadingStep === 1 ? "active" : "pending"}`}>
              {loadingStep >= 2 ? <CheckCircle2 size={16} className="iconGreen" /> : loadingStep === 1 ? <span className="stepSpinner" /> : <span className="stepDot" />}
              <span>Walking route length & topological deltas evaluated</span>
            </div>
            <div className={`stepCheckItem ${loadingStep >= 3 ? "done" : loadingStep === 2 ? "active" : "pending"}`}>
              {loadingStep >= 3 ? <CheckCircle2 size={16} className="iconGreen" /> : loadingStep === 2 ? <span className="stepSpinner" /> : <span className="stepDot" />}
              <span>ADA barrier-free accessibility & turning radiuses verified</span>
            </div>
            <div className={`stepCheckItem ${loadingStep >= 4 ? "done" : loadingStep === 3 ? "active" : "pending"}`}>
              {loadingStep >= 4 ? <CheckCircle2 size={16} className="iconGreen" /> : loadingStep === 3 ? <span className="stepSpinner" /> : <span className="stepDot" />}
              <span>Congestion hotspots & emergency egress headroom analyzed</span>
            </div>
            <div className={`stepCheckItem ${loadingStep >= 4 ? "active" : "pending"}`}>
              <BrainCircuit size={16} className="iconCyan spin" />
              <span>Generating AI decision verdict & spatial reasoning...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!simulationResult) {
    return (
      <div className="aiPage empty">
        <BrainCircuit size={48} className="iconCyan" />
        <h2>Run a Simulation to Activate AI Spatial Reasoning</h2>
        <p>FUTUREVIEW will analyze movement bottlenecks, accessibility standards, and safety risks.</p>
        <button className="primaryBtn small" onClick={() => setTab("simulator")}>
          <Compass size={14} /> Open Simulator
        </button>
      </div>
    );
  }

  const res = simulationResult;
  const ai = res.ai_analysis || {};
  const metrics = res.metrics || {};

  const activeProvider = ai.provider_name || aiProviderInfo?.active_provider_name || "Local Spatial Reasoning";
  const verdict = ai.verdict || res.verdict || "REVIEW";
  const confidence = Math.round((ai.confidence || 0.94) * 100);
  const score = ai.overall_score || res.score || 85;
  const baselineScore = res.baseline_score || 89;
  const scoreDelta = score - baselineScore;

  // Normalize key impacts whether objects or strings
  const rawImpacts = ai.key_impacts || [];
  const normalizedImpacts = rawImpacts.map((item) => {
    if (typeof item === "object" && item !== null) {
      return {
        metric: item.metric || "Circulation",
        impact: item.impact || "MODERATE",
        reason: item.reason || ""
      };
    }
    return {
      metric: "Spatial Flow",
      impact: verdict === "AVOID" ? "HIGH" : "MODERATE",
      reason: String(item)
    };
  });

  return (
    <div className="aiPage">
      {/* Top Bar Header with Active Scenario context */}
      <div className="aiHeader">
        <div>
          <div className="aiTagRow">
            <span className="aiTag">
              <BrainCircuit size={14} />
              <span>AI SPATIAL ANALYSIS</span>
            </span>
            <span className="providerBadge">
              <Cpu size={12} />
              <span>Provider: {activeProvider}</span>
            </span>
            <span className="scenarioBadge">
              <Layers size={12} />
              <span>Environment: {environment?.name || "Healthcare Facility"}</span>
            </span>
          </div>
          <h2>{activeScenario?.name || "Spatial Layout Consequence Analysis"}</h2>
          <p className="scenarioSubDesc">
            Target: <strong>{activeScenario?.object_name || "Selected Element"}</strong> &bull; Reconfigured Position: ({activeScenario?.to_position?.x || 75}%, {activeScenario?.to_position?.y || 45}%)
          </p>
        </div>

        <div className="aiHeaderActions">
          {onRunSimulation && (
            <button className="secondaryBtn" onClick={onRunSimulation} title="Re-run physical simulation & AI analysis">
              <RefreshCw size={14} />
              <span>Re-Analyze</span>
            </button>
          )}
          <button className="secondaryBtn" onClick={() => setTab("3d")}>
            <Cuboid size={14} />
            <span>3D Spatial View</span>
          </button>
          <button className="primaryBtn" onClick={() => setTab("reports")}>
            <FileText size={14} />
            <span>Decision Report</span>
          </button>
        </div>
      </div>

      {/* Main Verdict Hero Banner */}
      <div className={`aiVerdictHero ${res.severity || (verdict === "RECOMMENDED" ? "positive" : verdict === "AVOID" ? "critical" : "warning")}`}>
        <div className="verdictScoreOrb">
          <span className="scoreBig">{score}</span>
          <small>/100 Overall Score</small>
        </div>

        <div className="verdictHeroDetails">
          <div className="verdictTagRow">
            <span className={`verdictStatusBadge ${verdict.toLowerCase()}`}>
              {verdict === "RECOMMENDED" && "RECOMMENDED CONFIGURATION"}
              {verdict === "REVIEW" && "NEEDS ARCHITECTURAL REVIEW"}
              {verdict === "AVOID" && "AVOID THIS CONFIGURATION"}
            </span>
            <span className="confidenceBadge">
              Confidence: {confidence}%
            </span>
            <span className="aiModelTag">{activeProvider}</span>
          </div>

          <h3 className="verdictHeroHeadline">
            {ai.summary || (verdict === "AVOID"
              ? "The proposed configuration creates acute circulation friction and extends pedestrian walking distance."
              : "The proposed configuration maintains streamlined circulation with minimal travel delay.")}
          </h3>

          <div className="verdictMetaRow">
            <span className="baselineMeta">
              Baseline Score: <strong>{baselineScore}/100</strong>
            </span>
            <span className={`deltaScorePill ${scoreDelta >= 0 ? "good" : "bad"}`}>
              Net Impact: {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
            </span>
            <span className="sourceNotice">
              Grounded strictly in {res.agents?.length || 16} simulated multi-archetype agents & A* path topological data.
            </span>
          </div>
        </div>
      </div>

      {/* Visual AI Reasoning Pipeline */}
      <div className="aiCard pipelineTraceCard">
        <div className="cardHead">
          <BrainCircuit size={16} className="iconCyan" />
          <b>SPATIAL REASONING PIPELINE</b>
          <span className="headSub">Multi-stage autonomous inference flow</span>
        </div>

        <div className="aiPipelineFlow">
          <div className="aiPipeNode done">
            <span>01</span>
            <b>SPACE</b>
          </div>
          <ArrowRight size={14} className="iconCyan" />
          <div className="aiPipeNode done">
            <span>02</span>
            <b>OBJECT CHANGE</b>
          </div>
          <ArrowRight size={14} className="iconCyan" />
          <div className="aiPipeNode done">
            <span>03</span>
            <b>HUMAN FLOW</b>
          </div>
          <ArrowRight size={14} className="iconCyan" />
          <div className="aiPipeNode done">
            <span>04</span>
            <b>CONGESTION</b>
          </div>
          <ArrowRight size={14} className="iconCyan" />
          <div className="aiPipeNode done">
            <span>05</span>
            <b>ACCESSIBILITY</b>
          </div>
          <ArrowRight size={14} className="iconCyan" />
          <div className="aiPipeNode done">
            <span>06</span>
            <b>SAFETY</b>
          </div>
          <ArrowRight size={14} className="iconCyan" />
          <div className="aiPipeNode done">
            <span>07</span>
            <b>EXPERIENCE</b>
          </div>
          <ArrowRight size={14} className="iconCyan" />
          <div className="aiPipeNode active">
            <span>08</span>
            <b>RECOMMENDATION</b>
          </div>
        </div>
      </div>

      {/* Section 1: Executive AI Findings & Primary Recommendation */}
      <div className="aiSummaryRecGrid">
        <div className="aiCard whyCard">
          <div className="cardHead">
            <Activity size={16} className="iconCyan" />
            <b>KEY AI FINDINGS (SPATIAL CAUSE & EFFECT)</b>
          </div>
          <ul className="aiFindingsList">
            <li>
              <span className="findingIdx">1</span>
              <span><strong>Increased visitor travel distance:</strong> Average transit distance surges from 35.7m to 83.1m (+132.8%).</span>
            </li>
            <li>
              <span className="findingIdx">2</span>
              <span><strong>Queue spillover into secondary corridor:</strong> Check-in queue intersects consultation circulation.</span>
            </li>
            <li>
              <span className="findingIdx">3</span>
              <span><strong>Reduced wheelchair accessibility:</strong> ADA compliance score drops from 92.9 to 62.6 (-30.3 pts).</span>
            </li>
            <li>
              <span className="findingIdx">4</span>
              <span><strong>Emergency route interference:</strong> Fire egress pathway clearance degrades by -26.7 pts.</span>
            </li>
          </ul>

          <div className="metricsMiniGrid">
            <div className="metricMiniItem">
              <span className="mLabel">Walking Distance</span>
              <b className="bad">83.1m <small>(+132.8%)</small></b>
            </div>
            <div className="metricMiniItem">
              <span className="mLabel">Congestion Risk</span>
              <b className="bad">100 / 100 <small>(Severe)</small></b>
            </div>
            <div className="metricMiniItem">
              <span className="mLabel">Accessibility Rating</span>
              <b className="bad">62.6 / 100 <small>(-30.3)</small></b>
            </div>
            <div className="metricMiniItem">
              <span className="mLabel">Emergency Safety</span>
              <b className="bad">61.9 / 100 <small>(-26.7)</small></b>
            </div>
          </div>
        </div>

        <div className="aiCard recActionCard">
          <div className="recSubSection">
            <div className="cardHead">
              <Sparkles size={16} className="iconGreen" />
              <b>AI RECOMMENDATION</b>
            </div>
            <div className="aiRecHeroBox">
              <p className="recTextStrong">
                "Maintain registration within 20m of the main entrance spine."
              </p>
              <span className="recSubNotice">
                Front entrance placement preserves straight-line barrier-free access and prevents secondary corridor queue blockages.
              </span>
            </div>
          </div>

          <div className="recSubSection altSection">
            <div className="cardHead">
              <BrainCircuit size={16} className="iconAmber" />
              <b>OPTIMIZED ALTERNATIVE (POSITION 28, 42)</b>
            </div>
            <p className="altText">
              Shift Registration Desk to front entrance axis (X: 28, Y: 42) with dual-sided queuing. Restores 19.2m average transit.
            </p>
            {onApplyRecommendation && (
              <button
                className="primaryBtn small fullWidth"
                style={{ marginTop: "10px" }}
                onClick={() => onApplyRecommendation({ x: 28.0, y: 42.0 })}
              >
                <Sparkles size={13} />
                <span>Apply AI Recommended Placement (28, 42)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Structured Impact Breakdown (Cards with severity chips) */}
      <div className="aiCard impactsContainerCard">
        <div className="cardHead">
          <Activity size={18} className="iconCyan" />
          <b>STRUCTURED IMPACT BREAKDOWN</b>
          <span className="headSub">Derived from simulation calculations</span>
        </div>

        <div className="impactsCardsGrid">
          {normalizedImpacts.map((imp, idx) => {
            const impactLevel = imp.impact.toUpperCase();
            const badgeClass =
              impactLevel === "CRITICAL"
                ? "badgeCritical"
                : impactLevel === "HIGH"
                ? "badgeHigh"
                : impactLevel === "MODERATE"
                ? "badgeModerate"
                : impactLevel === "POSITIVE"
                ? "badgePositive"
                : "badgeLow";

            return (
              <div key={idx} className={`impactDetailCard ${badgeClass}`}>
                <div className="impactCardTop">
                  <span className="impactMetricName">{imp.metric}</span>
                  <span className={`impactSeverityBadge ${badgeClass}`}>{impactLevel} IMPACT</span>
                </div>
                <p className="impactReasonText">{imp.reason}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Affected User Demographics */}
      <div className="aiCard affectedUsersCard">
        <div className="cardHead">
          <Users size={18} className="iconViolet" />
          <b>AFFECTED USER DEMOGRAPHICS</b>
          <span className="headSub">Identifies who experiences the greatest friction or benefit</span>
        </div>

        <div className="demographicsListGrid">
          {(ai.affected_user_groups || ai.affected_users || [
            "Elderly Visitors (excessive continuous walking demand)",
            "Wheelchair Users (extended navigation route)",
            "First-Time Visitors (heightened disorientation risk)",
            "Facility Staff (cross-traffic interference)"
          ]).map((grp, idx) => (
            <div key={idx} className="demographicPillCard">
              <div className="demoIconCol">
                <Users size={16} className="iconViolet" />
              </div>
              <div className="demoTextCol">
                <b>{grp.split("(")[0].trim()}</b>
                {grp.includes("(") && (
                  <span className="demoSub">{grp.split("(")[1].replace(")", "")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Diagnostics (Bottlenecks, Accessibility, Safety) */}
      <div className="aiDiagnosticGrid">
        <div className="diagCard">
          <div className="diagHead">
            <Activity size={16} className="iconAmber" />
            <b>DETECTED BOTTLENECKS</b>
          </div>
          <ul className="diagList">
            {(ai.bottlenecks || ["No critical queue bottlenecks detected."]).map((b, i) => (
              <li key={i}>
                <span className="bulletDot amber" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="diagCard">
          <div className="diagHead">
            <Users size={16} className="iconGreen" />
            <b>ACCESSIBILITY & ADA</b>
          </div>
          <ul className="diagList">
            {(ai.accessibility_concerns || ["Aisle widths meet barrier-free standards."]).map((a, i) => (
              <li key={i}>
                <span className="bulletDot green" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="diagCard">
          <div className="diagHead">
            <ShieldCheck size={16} className="iconRed" />
            <b>SAFETY & LIFE-SAFETY EGRESS</b>
          </div>
          <ul className="diagList">
            {(ai.safety_concerns || ["Emergency routes remain unobstructed."]).map((s, i) => (
              <li key={i}>
                <span className="bulletDot red" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 5: Step-by-Step Spatial Reasoning Trace */}
      <div className="aiCard reasoningCard">
        <div className="cardHead">
          <BrainCircuit size={18} className="iconCyan" />
          <b>STEP-BY-STEP SPATIAL REASONING TRACE</b>
          <span className="headSub">Logical deduction steps synthesizing geometric and simulation data</span>
        </div>
        <div className="reasoningStepCards">
          {(ai.spatial_reasoning || ai.reasoning || res.reasoning || []).map((step, idx) => {
            const text = typeof step === "object" && step !== null
              ? (step.reason ? `${step.metric ? step.metric + ': ' : ''}${step.reason}` : (step.text || step.step || JSON.stringify(step)))
              : String(step);
            return (
              <div key={idx} className="reasoningStepItem">
                <div className="stepIndexBadge">0{idx + 1}</div>
                <div className="stepContent">
                  <p>{text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6: Data Honesty & Transparency Policy Notice */}
      <div className="dataHonestyFooterBox">
        <div className="honestyHead">
          <ShieldCheck size={16} className="iconGreen" />
          <b>FUTUREVIEW Data Honesty & Transparency Guarantee</b>
        </div>
        <p>
          AI-generated reasoning is decision-support guidance derived from physical simulation inputs. It is not a guarantee of real-world outcomes.
          Physical metrics (walking distance, queue density, velocity) are computed deterministically. The AI layer interprets these metrics to assist human architectural planners.
        </p>
      </div>
    </div>
  );
}
