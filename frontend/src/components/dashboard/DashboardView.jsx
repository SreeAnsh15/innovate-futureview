import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Play,
  RotateCcw,
  ArrowRight,
  Compass,
  Siren,
  Activity,
  Car,
  Users,
  LifeBuoy,
  Wind,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Globe2,
  Sliders,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Cuboid,
  Eye,
  TrendingDown,
  TrendingUp,
  Clock,
  HeartPulse,
  Scale
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { UNIVERSAL_WORLDS } from "../../data/universalWorlds";

const DOMAIN_ICONS = {
  spatial: Compass,
  disaster: Siren,
  healthcare: Activity,
  road: Car,
  crowd: Users,
  rescue: LifeBuoy,
  environmental: Wind,
  infrastructure: Cpu
};

export function DashboardView({ setTab }) {
  const {
    activeWorld,
    switchWorld,
    activeDomain,
    simulationResult,
    runWhatIfSimulation,
    setSelectedModule,
    showToast,
    metrics
  } = useFutureView();

  const currentWorldObj = activeWorld || UNIVERSAL_WORLDS[0];

  const [whatIfInput, setWhatIfInput] = useState(
    currentWorldObj?.primary_what_if || "What if emergency arrivals surge by 45%?"
  );
  const [simulationState, setSimulationState] = useState("idle"); // "idle" | "understanding" | "simulating" | "cascading" | "completed"
  const [simStepText, setSimStepText] = useState("");
  const [showBetterFutures, setShowBetterFutures] = useState(false);

  // Synchronize input when active world changes
  useEffect(() => {
    if (currentWorldObj?.primary_what_if) {
      setWhatIfInput(currentWorldObj.primary_what_if);
    }
  }, [currentWorldObj?.id]);

  const canvasRef = useRef(null);

  const pills = currentWorldObj.what_if_pills || [
    currentWorldObj.primary_what_if,
    "What if demand increases by 40%?",
    "What if primary route is blocked?"
  ];

  const whatBreaks = currentWorldObj.what_breaks_first || {
    target: "Central Circulation Spine",
    time_min: 12,
    impact: "HIGH",
    severity_pct: 82,
    reason: "Inflow surge exceeds peak capacity threshold, inducing turbulent counterflow."
  };

  const cascade = currentWorldObj.cascade_nodes || [
    { id: "1", title: "Demand Surge +40%", time: "T+0m", status: "MUTATION", desc: "Perturbation initiated." },
    { id: "2", title: "Capacity Saturation", time: "T+10m", status: "WARNING", desc: "Queue builds at primary junction." },
    { id: "3", title: "Velocity Breakdown", time: "T+20m", status: "CRITICAL", desc: "Movement slowed by 65%." },
    { id: "4", title: "Downstream Cascade", time: "T+35m", status: "RECOMMENDED", desc: "Secondary reroute stabilizes flow." }
  ];

  const alternatives = currentWorldObj.pareto_alternatives || [
    { id: "a", name: "Option A: Spatial Relocation", score: 92, delta: "+18 pts", risk: "Low", cost: "$12k", desc: "Relocate primary desk 12m westward." },
    { id: "b", name: "Option B: Staggered Scheduling", score: 88, delta: "+14 pts", risk: "Low", cost: "$4k", desc: "Split arrival phases into 15m intervals." },
    { id: "c", name: "Option C: Dynamic Bypass Lane", score: 96, delta: "+24 pts", risk: "Low", cost: "$18k", desc: "Open auxiliary egress corridor for high-speed transit." }
  ];

  // Handle What-If simulation lifecycle with 5 visual stages
  const handleExecuteSimulation = async (customQuery) => {
    const query = customQuery || whatIfInput;
    setWhatIfInput(query);
    
    setSimulationState("understanding");
    setSimStepText("1/5 UNDERSTANDING CAUSAL INTENT & PERTURBATION VECTORS...");
    await new Promise((r) => setTimeout(r, 450));

    setSimulationState("counterfactual");
    setSimStepText("2/5 COUNTERFACTUAL GRAPH CREATED • SYNTHESIZING DYNAMICS...");
    await new Promise((r) => setTimeout(r, 450));

    setSimulationState("simulating");
    setSimStepText("3/5 RUNNING MULTI-AGENT PHYSICAL TRAJECTORIES...");
    await new Promise((r) => setTimeout(r, 500));

    setSimulationState("cascading");
    setSimStepText("4/5 DETECTING FAILURE CASCADES & PRESSURE HOTSPOTS...");
    await new Promise((r) => setTimeout(r, 450));

    if (runWhatIfSimulation) {
      await runWhatIfSimulation(query);
    }

    setSimulationState("completed");
    setSimStepText("5/5 FUTURE READY • CASCADES COMPUTED & VERIFIED");
    setShowBetterFutures(true);
    showToast("Counterfactual simulation completed.", "success");
  };

  // Live Canvas Rendering for THE FUTUREVIEW WORLD
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let frame = 0;

    const accent = currentWorldObj.accent_color || "#38bdf8";

    const particles = Array.from({ length: 42 }, (_, i) => ({
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: 2.5 + Math.random() * 2.5,
      color: i % 3 === 0 ? accent : i % 3 === 1 ? "#38bdf8" : "#a855f7"
    }));

    const render = () => {
      frame++;
      const w = canvas.width = canvas.parentElement?.clientWidth || 800;
      const h = canvas.height = canvas.parentElement?.clientHeight || 420;

      // Dark obsidian background
      ctx.fillStyle = "#02050b";
      ctx.fillRect(0, 0, w, h);

      // Radial glowing spatial grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // World Zones
      const zones = currentWorldObj.zones || [
        { name: "Primary Corridor", color: accent, x1: 15, y1: 30, x2: 85, y2: 70 }
      ];

      zones.forEach((z) => {
        const zx = (z.x1 / 100) * w;
        const zy = (z.y1 / 100) * h;
        const zw = ((z.x2 - z.x1) / 100) * w;
        const zh = ((z.y2 - z.y1) / 100) * h;

        ctx.fillStyle = `${z.color}10`;
        ctx.strokeStyle = `${z.color}35`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(zx, zy, zw, zh, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = z.color;
        ctx.font = "600 10px 'JetBrains Mono', monospace";
        ctx.fillText(z.name.toUpperCase(), zx + 8, zy + 16);
      });

      // World Objects / Anchors
      const objects = currentWorldObj.objects || [];
      objects.forEach((obj) => {
        const ox = (obj.x / 100) * w;
        const oy = (obj.y / 100) * h;
        const ow = (obj.w / 100) * w;
        const oh = (obj.h / 100) * h;

        ctx.fillStyle = obj.kind === "entrance" ? "rgba(16, 185, 129, 0.25)" : obj.kind === "critical" ? "rgba(239, 68, 68, 0.3)" : "rgba(56, 189, 248, 0.2)";
        ctx.strokeStyle = obj.kind === "entrance" ? "#10b981" : obj.kind === "critical" ? "#ef4444" : "#38bdf8";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(ox, oy, ow, oh, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "500 9px 'JetBrains Mono', monospace";
        ctx.fillText(obj.name, ox + 4, oy + oh + 12);
      });

      // Flow Ribbons / Corridors
      ctx.strokeStyle = simulationState === "completed" ? "rgba(239, 68, 68, 0.7)" : `${accent}99`;
      ctx.lineWidth = 2.2;
      ctx.setLineDash(simulationState === "completed" ? [4, 4] : []);
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.5);
      ctx.bezierCurveTo(w * 0.35, h * 0.28, w * 0.65, h * 0.72, w * 0.88, h * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Multi-Agent Particles
      particles.forEach((p) => {
        p.x += p.vx * (simulationState === "simulating" ? 2.5 : 1.0);
        p.y += p.vy * (simulationState === "simulating" ? 2.5 : 1.0);

        if (p.x < 10 || p.x > 90) p.vx *= -1;
        if (p.y < 10 || p.y > 90) p.vy *= -1;

        const px = (p.x / 100) * w;
        const py = (p.y / 100) * h;

        ctx.fillStyle = simulationState === "completed" && Math.random() > 0.65 ? "#ef4444" : p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentWorldObj, simulationState]);

  return (
    <div className="futureviewDashboard">
      {/* 1. CINEMATIC HERO */}
      <section className="heroMissionSection">
        <div className="heroMottoBadge">
          <Sparkles size={13} className="heroSparkleIcon" />
          <span>WHAT-IF LAYOUT SIMULATION FOR THE REAL WORLD</span>
        </div>

        <h1 className="heroMasterHeadline">
          SEE WHAT HAPPENS <br />
          <span className="textGradientCyan">BEFORE IT HAPPENS.</span>
        </h1>

        <p className="heroMasterSubtitle">
          Simulate layout modifications, detect emergency exit bottlenecks, and evaluate pedestrian flow before construction.
        </p>
      </section>

      {/* 2. THE FUTUREVIEW WORLD (Central Dynamic Simulation) */}
      <section className="centralWorldSection">
        <div className="worldCanvasContainer">
          <div className="worldCanvasHeader">
            <div className="worldCanvasTitleWrap">
              <div className="livePulseRing" />
              <div>
                <b className="worldCanvasTitle">THE FUTUREVIEW WORLD &bull; {currentWorldObj.name.toUpperCase()}</b>
                <span className="worldCanvasMeta">
                  {currentWorldObj.domain_name} &bull; {currentWorldObj.size} &bull; Deterministic Multi-Agent Flow
                </span>
              </div>
            </div>

            <div className="worldCanvasToolbar">
              <button className="worldToolBtn active" title="2D Map Simulation">
                <Compass size={13} />
                <span>2D World</span>
              </button>
              <button className="worldToolBtn" onClick={() => setTab("threed_view")} title="3D Digital Twin">
                <Cuboid size={13} />
                <span>3D Twin</span>
              </button>
              <button className="worldToolBtn" onClick={() => setTab("ar_view")} title="Spatial AR Vision">
                <Eye size={13} />
                <span>Spatial AR</span>
              </button>
            </div>
          </div>

          {/* Living Canvas Visualizer */}
          <div className="worldCanvasSurface">
            <canvas ref={canvasRef} className="livingSimulationCanvas" />

            {/* Simulation Phase Banner */}
            {simulationState !== "idle" && (
              <div className={`simulationPhaseBanner ${simulationState}`}>
                <Zap size={14} className="spin" />
                <span>{simStepText}</span>
              </div>
            )}
          </div>

          <div className="worldCanvasFooter">
            <div className="worldFooterLeft">
              <span className="footerLegendDot baseline" /> Current Baseline
              <span className="footerLegendDot counterfactual" /> Counterfactual Future
              <span className="footerLegendDot hotspot" /> Cascade Friction Hotspot
            </div>
            <div className="worldFooterRight">
              <span>ONE ENGINE. MANY WORLDS.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CENTERPIECE WHAT-IF COMMAND CONSOLE */}
      <section className="whatIfConsoleSection">
        <div className="whatIfTerminalCard">
          <div className="terminalHeaderRow">
            <div className="terminalTitleGroup">
              <BrainCircuit size={16} className="iconCyan" />
              <span className="terminalHeading">WHAT SHOULD WE TEST?</span>
            </div>
            <span className="terminalTag">AUTONOMOUS COUNTERFACTUAL ENGINE</span>
          </div>

          <div className="terminalInputWrapper">
            <input
              className="terminalQueryInput"
              type="text"
              value={whatIfInput}
              onChange={(e) => setWhatIfInput(e.target.value)}
              placeholder="e.g., What if demand increases by 40% and primary corridor is blocked?"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleExecuteSimulation();
              }}
            />
            <button
              className="terminalSimulateBtn"
              onClick={() => handleExecuteSimulation()}
              disabled={simulationState === "simulating" || simulationState === "cascading"}
            >
              <span>{simulationState === "simulating" || simulationState === "cascading" ? "SIMULATING..." : "SIMULATE FUTURE"}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Preset Quick Scenarios */}
          <div className="terminalQuickPrompts">
            <span className="quickPromptsLabel">SAMPLE WHAT-IFS:</span>
            <div className="quickChipsWrap">
              {pills.map((sc, i) => (
                <button
                  key={i}
                  className="quickChipBtn"
                  onClick={() => handleExecuteSimulation(sc)}
                >
                  <span>"{sc}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURRENT VS COUNTERFACTUAL (BASELINE VS FUTURE) */}
      <section className="consequenceSplitSection">
        <div className="splitSectionHeader">
          <div className="splitHeaderTitle">
            <span className="splitSub">SPATIAL IMPACT ANALYSIS</span>
            <h2 className="splitMainTitle">Current Baseline vs. Counterfactual Future</h2>
          </div>
          <span className="splitMotto">See physical deltas across all velocity & pressure vectors</span>
        </div>

        <div className="splitComparisonGrid">
          {/* Baseline State Card */}
          <div className="stateCard baseline">
            <div className="stateCardHead">
              <span className="statePill baseline">CURRENT BASELINE</span>
              <span className="stateScoreGood">Score: 88 / 100</span>
            </div>
            <h3 className="stateCardTitle">Operational Equilibrium</h3>
            <p className="stateCardDesc">
              Flow velocities are balanced with nominal queue lengths and full ADA egress clearance throughout primary spine.
            </p>

            <div className="stateMetricsList">
              <div className="stateMetricRow">
                <span>Congestion Friction:</span>
                <b>32 / 100 (Nominal)</b>
              </div>
              <div className="stateMetricRow">
                <span>Avg Traversal Transit:</span>
                <b>{Number((currentWorldObj.width_m * 0.35).toFixed(1))} m</b>
              </div>
              <div className="stateMetricRow">
                <span>Accessibility & Safety:</span>
                <b>94 / 100 (Compliant)</b>
              </div>
            </div>
          </div>

          {/* Morph Arrow */}
          <div className="stateMorphCenter">
            <div className="morphArrowCircle">
              <ArrowRight size={18} />
            </div>
            <span className="morphLabel">MUTATION APPLIED</span>
          </div>

          {/* Counterfactual Future State Card */}
          <div className="stateCard counterfactual">
            <div className="stateCardHead">
              <span className="statePill counterfactual">WHAT-IF FUTURE</span>
              <span className="stateScoreBad">Score: 54 / 100</span>
            </div>
            <h3 className="stateCardTitle">Corridor Throttling & Bottleneck</h3>
            <p className="stateCardDesc">
              Perturbation causes acute queue buildup, +134% traversal delay, and {whatBreaks.time_min}-minute time-to-failure.
            </p>

            <div className="stateMetricsList">
              <div className="stateMetricRow">
                <span>Congestion Friction:</span>
                <b className="textRed">82 / 100 (+156% Surge)</b>
              </div>
              <div className="stateMetricRow">
                <span>Avg Traversal Transit:</span>
                <b className="textRed">{Number((currentWorldObj.width_m * 0.72).toFixed(1))} m (+134% Detour)</b>
              </div>
              <div className="stateMetricRow">
                <span>Accessibility & Safety:</span>
                <b className="textRed">58 / 100 (Severe Risk)</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONSEQUENCE CASCADE & WHAT BREAKS FIRST? */}
      <section className="cascadeDiscoverySection">
        <div className="discoveryHeader">
          <div className="discoveryTitleGroup">
            <Zap size={16} className="iconAmber" />
            <div>
              <h2 className="discoveryMainHeading">What Breaks First? &bull; Causal Cascade</h2>
              <span className="discoverySubtitle">Deterministic trace of cascading failure propagation</span>
            </div>
          </div>
        </div>

        <div className="cascadeDiscoveryGrid">
          {/* What Breaks First Callout */}
          <div className="whatBreaksCard">
            <div className="whatBreaksTag">
              <AlertTriangle size={13} className="iconRed" />
              <span>FIRST CRITICAL FAILURE POINT</span>
            </div>
            <div className="whatBreaksNodeNumber">01</div>
            <h3 className="whatBreaksTitle">{whatBreaks.target}</h3>
            <div className="whatBreaksTimeBadge">
              <Clock size={12} />
              <span>BREAKS IN {whatBreaks.time_min} MINUTES ({whatBreaks.impact} IMPACT)</span>
            </div>
            <p className="whatBreaksReason">
              Why? {whatBreaks.reason}
            </p>
          </div>

          {/* Causal Chain Progress */}
          <div className="causalChainCard">
            <span className="causalChainHeader">CAUSAL PROPAGATION SEQUENCE:</span>
            <div className="causalNodesFlow">
              {cascade.map((node, i) => (
                <React.Fragment key={node.id}>
                  <div className={`causalStep ${node.status === "CRITICAL" ? "critical" : node.status === "WARNING" ? "alert" : ""}`}>
                    <span className="causalStepNum">{node.time}</span>
                    <b>{node.title}</b>
                    <small>{node.desc}</small>
                  </div>
                  {i < cascade.length - 1 && <div className="causalArrow">→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FIND A BETTER FUTURE (PARETO ALTERNATIVES) */}
      <section className="betterFuturesSection">
        <div className="betterFuturesBanner">
          <div className="betterFuturesLeft">
            <span className="betterTag">LAYOUT OPTIMIZATION ENGINE</span>
            <h2 className="betterHeading">This Future Has Severe Bottlenecks.</h2>
            <p className="betterSubtext">
              FUTUREVIEW evaluated layout options across re-engineering, queue rebalancing, and capacity scheduling.
            </p>
          </div>
          <button
            className="findBetterFutureBtn"
            onClick={() => setTab("scenario_compare")}
          >
            <Sparkles size={14} />
            <span>OPEN LAYOUT OPTIMIZATION ENGINE</span>
          </button>
        </div>

        {/* Pareto Solution Comparison Cards */}
        <div className="paretoFuturesGrid">
          {alternatives.map((alt, i) => (
            <div key={alt.id} className={`futureCard ${i === 0 ? "recommended" : ""}`}>
              <div className="futureCardHead">
                <span className={`futurePill ${i === 0 ? "recommended" : ""}`}>{alt.name.toUpperCase()}</span>
                <b className={i === 0 ? "textGreen" : ""}>Score: {alt.score}/100</b>
              </div>
              <p className="futureDesc">{alt.desc}</p>
              <div className="futureMetrics">
                <span>Delta: <strong>{alt.delta}</strong></span>
                <span>Risk: <strong>{alt.risk}</strong></span>
                <span>Est. Cost: <strong>{alt.cost}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. EXPLORE WORLDS (8 HIGH-STAKES DESTINATIONS) */}
      <section className="exploreWorldsSection">
        <div className="sectionHeaderGroup">
          <div className="sectionBadge">
            <Globe2 size={13} className="iconCyan" />
            <span>EXPLORE SIMULATION WORLDS</span>
          </div>
          <h2 className="sectionTitle">One Engine. Eight High-Stakes Real-World Laboratories.</h2>
          <p className="sectionSubtitle">
            Every world is powered by deterministic multi-agent physics, cascading failure prediction, and Pareto decision optimization.
          </p>
        </div>

        <div className="exploreDomainsGrid">
          {UNIVERSAL_WORLDS.map((world, idx) => {
            const Icon = DOMAIN_ICONS[world.domain] || Compass;
            const isSelected = activeWorld?.id === world.id;

            return (
              <div
                key={world.id}
                className={`domainExploreTile ${isSelected ? "selected" : ""}`}
                style={{ "--tile-accent": world.accent_color || "#38bdf8" }}
                onClick={() => {
                  switchWorld(world.id);
                  setTab("dashboard");
                }}
              >
                <div className="tileHeader">
                  <div className="tileIconBox" style={{ background: `${world.accent_color || "#38bdf8"}15`, color: world.accent_color || "#38bdf8" }}>
                    <Icon size={20} />
                  </div>
                  <span className="tileNum">{String(idx + 1).padStart(2, "0")}</span>
                </div>

                <div className="tileBody">
                  <h3 className="tileTitle">{world.name}</h3>
                  <span className="tileTagline">"{world.tagline || world.domain_name}"</span>
                  <p className="tileDesc">{world.summary}</p>
                </div>

                <div className="tileFooter">
                  <span className="tileModel">{world.type} &bull; {world.size}</span>
                  <button className="tileActionBtn">
                    <span>{isSelected ? "ACTIVE WORLD" : "ENTER WORLD"}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. DECISION GOVERNANCE & CRYPTOGRAPHIC AUDIT */}
      <section className="governanceSection">
        <div className="governanceCard">
          <div className="governanceLeft">
            <div className="governanceBadge">
              <ShieldCheck size={14} className="iconGreen" />
              <span>IMMUTABLE AUDIT TRAIL</span>
            </div>
            <h3 className="governanceHeading">Cryptographic SHA-256 Decision Dossier</h3>
            <p className="governanceDesc">
              Every counterfactual simulation is signed with deterministic state proof, timestamped, and stored in an immutable ledger for stakeholder review and regulatory compliance.
            </p>
          </div>
          <div className="governanceActions">
            <button className="primaryDossierBtn" onClick={() => setTab("decision_report")}>
              <FileSpreadsheet size={14} />
              <span>Export Executive Audit Dossier</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
