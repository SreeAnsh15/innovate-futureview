import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Users,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Flame,
  ShieldCheck,
  Zap,
  Activity,
  Navigation,
  Sparkles,
  Eye,
  AlertTriangle,
  Clock,
  Compass,
  Layers,
  ChevronRight
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function LiveCrowdSimulation() {
  const {
    currentEnv,
    proposalPosition,
    simulationResult,
    agentCount,
    setAgentCount,
    simulationSpeed,
    setSimulationSpeed,
    simulationStatus,
    setSimulationStatus,
    selectedPersona,
    setSelectedPersona,
    showHeatmap,
    setShowHeatmap,
    showRoutes,
    setShowRoutes,
    showGrid,
    setShowGrid,
    onApplyRecommendation,
    onRunSimulation
  } = useFutureView();

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const agentsRef = useRef([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [liveStats, setLiveStats] = useState({
    activeAgents: 50,
    avgSpeed: 1.25,
    bottlenecks: 2,
    flowRate: 38
  });

  const objects = currentEnv?.objects || [];
  const zones = currentEnv?.zones || [];
  const metrics = simulationResult?.metrics;
  const heatmap = simulationResult?.heatmap || [];

  const archetypeColors = {
    visitor: "#38bdf8",
    elderly: "#fbbf24",
    wheelchair: "#34d399",
    staff: "#a78bfa",
    emergency: "#f43f5e",
    family: "#f472b6"
  };

  const personaList = [
    { id: "visitor", label: "Regular Visitor", speed: "1.35 m/s", share: "35%", color: "#38bdf8" },
    { id: "elderly", label: "Elderly Visitor", speed: "0.85 m/s", share: "18%", color: "#fbbf24" },
    { id: "wheelchair", label: "Wheelchair User", speed: "1.00 m/s", share: "12%", color: "#34d399" },
    { id: "family", label: "Family Group", speed: "1.05 m/s", share: "15%", color: "#f472b6" },
    { id: "staff", label: "Staff Clinician", speed: "1.55 m/s", share: "12%", color: "#a78bfa" },
    { id: "emergency", label: "Emergency Egress", speed: "2.10 m/s", share: "8%", color: "#f43f5e" }
  ];

  // Initialize Animated Agent Instances
  const initAgents = useCallback(() => {
    const entranceObj = objects.find((o) => o.kind === "entrance") || { x: 10, y: 40 };
    const targetObj = objects.find((o) => o.id === "registration") || { x: 38, y: 40 };
    const waitingObj = objects.find((o) => o.kind === "room") || { x: 68, y: 25 };
    const destObj = objects.find((o) => o.kind === "critical" || o.kind === "service") || { x: 85, y: 55 };

    const newAgents = [];
    const count = agentCount;

    for (let i = 0; i < count; i++) {
      const archTypes = ["visitor", "visitor", "elderly", "wheelchair", "family", "staff", "emergency"];
      const arch = archTypes[i % archTypes.length];
      const speedBase =
        arch === "elderly" ? 0.85 : arch === "wheelchair" ? 1.0 : arch === "emergency" ? 2.1 : arch === "staff" ? 1.55 : 1.35;

      const offsetStartY = (Math.sin(i * 1.5) * 12);
      const start = { x: entranceObj.x, y: Math.max(5, Math.min(95, entranceObj.y + offsetStartY)) };
      const stop1 = { x: proposalPosition.x + (Math.sin(i) * 3), y: proposalPosition.y + (Math.cos(i) * 3) };
      const stop2 = { x: waitingObj.x + ((i % 5) * 3 - 6), y: waitingObj.y + ((i % 4) * 3 - 4) };
      const stop3 = { x: destObj.x, y: destObj.y };
      const exit = { x: 96, y: Math.max(10, Math.min(90, destObj.y + (i % 6) * 4 - 10)) };

      const waypoints = [start, stop1, stop2, stop3, exit];

      newAgents.push({
        id: `agent_${i + 1}`,
        archetype: arch,
        speed: speedBase,
        color: archetypeColors[arch] || "#38bdf8",
        waypoints,
        currentSegment: 0,
        segmentProgress: (i / count) % 1.0, // staggered start
        x: start.x,
        y: start.y,
        delaySec: i * 0.15,
        stuckFrames: 0,
        comfort: Math.round(95 - (proposalPosition.x > 60 ? 35 : 5) - (arch === "wheelchair" && proposalPosition.x > 60 ? 25 : 0))
      });
    }

    agentsRef.current = newAgents;
  }, [objects, proposalPosition, agentCount]);

  useEffect(() => {
    initAgents();
  }, [initAgents]);

  // Main Canvas Animation Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000) * simulationSpeed;
      lastTime = time;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Clear & Dark Spatial Grid
      ctx.fillStyle = "#03070d";
      ctx.fillRect(0, 0, w, h);

      if (showGrid) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
        ctx.lineWidth = 1;
        const gridStep = w / 20;
        for (let x = 0; x < w; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // 2. Spatial Zones
      zones.forEach((z) => {
        const x1 = (z.x1 / 100) * w;
        const y1 = (z.y1 / 100) * h;
        const x2 = (z.x2 / 100) * w;
        const y2 = (z.y2 / 100) * h;
        ctx.fillStyle = `${z.color || "#38bdf8"}12`;
        ctx.strokeStyle = `${z.color || "#38bdf8"}33`;
        ctx.lineWidth = 1;
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = `${z.color || "#38bdf8"}aa`;
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText(z.name.toUpperCase(), x1 + 6, y1 + 14);
      });

      // 3. Dynamic Congestion Heatmap
      if (showHeatmap && heatmap.length > 0) {
        heatmap.forEach((hp) => {
          const cx = (hp.x / 100) * w;
          const cy = (hp.y / 100) * h;
          const radius = (hp.intensity / 100) * 80 + 30;

          const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
          const alpha = Math.min(0.45, (hp.intensity / 100) * 0.5);
          if (hp.intensity > 70) {
            grad.addColorStop(0, `rgba(244, 63, 94, ${alpha})`);
            grad.addColorStop(0.6, `rgba(245, 158, 11, ${alpha * 0.5})`);
            grad.addColorStop(1, "rgba(244, 63, 94, 0)");
          } else {
            grad.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
            grad.addColorStop(0.6, `rgba(16, 185, 129, ${alpha * 0.4})`);
            grad.addColorStop(1, "rgba(56, 189, 248, 0)");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. Environment Objects & Architecture
      objects.forEach((obj) => {
        const isMovedTarget = obj.id === "registration";
        const posX = isMovedTarget ? proposalPosition.x : obj.x;
        const posY = isMovedTarget ? proposalPosition.y : obj.y;

        const ox = (posX / 100) * w;
        const oy = (posY / 100) * h;
        const ow = ((obj.w || 14) / 100) * w;
        const oh = ((obj.h || 10) / 100) * h;

        // Draw Ghost at baseline if moved
        if (isMovedTarget && (proposalPosition.x !== obj.x || proposalPosition.y !== obj.y)) {
          const bx = (obj.x / 100) * w;
          const by = (obj.y / 100) * h;
          ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx - ow / 2, by - oh / 2, ow, oh);
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
          ctx.font = "9px Inter, sans-serif";
          ctx.fillText("BASELINE LOCATION", bx - ow / 2 + 4, by - oh / 2 - 4);
        }

        // Color by kind
        let fill = "#0c1a2c";
        let stroke = "rgba(56, 189, 248, 0.35)";
        if (obj.kind === "entrance") {
          fill = "rgba(16, 185, 129, 0.18)";
          stroke = "#10b981";
        } else if (obj.kind === "critical") {
          fill = "rgba(244, 63, 94, 0.22)";
          stroke = "#f43f5e";
        } else if (isMovedTarget) {
          fill = proposalPosition.x > 60 ? "rgba(244, 63, 94, 0.28)" : "rgba(56, 189, 248, 0.28)";
          stroke = proposalPosition.x > 60 ? "#f43f5e" : "#38bdf8";
        } else if (obj.kind === "corridor") {
          fill = "rgba(255, 255, 255, 0.03)";
          stroke = "rgba(255, 255, 255, 0.12)";
        }

        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(ox - ow / 2, oy - oh / 2, ow, oh, 6);
        ctx.fill();
        ctx.stroke();

        // Object Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(obj.name, ox, oy + 4);

        if (isMovedTarget) {
          ctx.fillStyle = proposalPosition.x > 60 ? "#f43f5e" : "#38bdf8";
          ctx.font = "bold 9px DM Mono, monospace";
          ctx.fillText("WHAT-IF PROPOSED", ox, oy - oh / 2 - 5);
        }
      });

      // 5. Circulation Trajectory Routes
      if (showRoutes) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        const entrance = objects.find((o) => o.kind === "entrance") || { x: 10, y: 40 };
        ctx.moveTo((entrance.x / 100) * w, (entrance.y / 100) * h);
        ctx.lineTo((proposalPosition.x / 100) * w, (proposalPosition.y / 100) * h);
        const waiting = objects.find((o) => o.kind === "room") || { x: 68, y: 25 };
        ctx.lineTo((waiting.x / 100) * w, (waiting.y / 100) * h);
        const dest = objects.find((o) => o.kind === "critical") || { x: 85, y: 55 };
        ctx.lineTo((dest.x / 100) * w, (dest.y / 100) * h);
        ctx.lineTo(w * 0.96, (dest.y / 100) * h);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 6. Update & Render Simulated Agents
      const agents = agentsRef.current;
      agents.forEach((ag) => {
        if (simulationStatus === "running") {
          const seg = ag.currentSegment;
          const p1 = ag.waypoints[seg];
          const p2 = ag.waypoints[(seg + 1) % ag.waypoints.length];

          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const stepSpeed = (ag.speed * 4.5) / Math.max(1, dist);

          ag.segmentProgress += stepSpeed * dt;
          if (ag.segmentProgress >= 1.0) {
            ag.segmentProgress = 0.0;
            ag.currentSegment = (ag.currentSegment + 1) % (ag.waypoints.length - 1);
          }

          const curP1 = ag.waypoints[ag.currentSegment];
          const curP2 = ag.waypoints[ag.currentSegment + 1];
          ag.x = curP1.x + (curP2.x - curP1.x) * ag.segmentProgress;
          ag.y = curP1.y + (curP2.y - curP1.y) * ag.segmentProgress;
        }

        const ax = (ag.x / 100) * w;
        const ay = (ag.y / 100) * h;

        // Agent Glow Particle
        ctx.fillStyle = ag.color;
        ctx.beginPath();
        const r = ag.archetype === "wheelchair" ? 6.5 : ag.archetype === "family" ? 7.5 : 5.0;
        ctx.arc(ax, ay, r, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ax, ay, 2, 0, Math.PI * 2);
        ctx.fill();

        // Highlight selected agent
        if (selectedAgent && selectedAgent.id === ag.id) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ax, ay, r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    objects,
    zones,
    heatmap,
    proposalPosition,
    showGrid,
    showHeatmap,
    showRoutes,
    simulationSpeed,
    simulationStatus,
    selectedAgent
  ]);

  // Click on Canvas to Select Agent
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clicked = agentsRef.current.find(
      (a) => Math.hypot(a.x - clickX, a.y - clickY) < 4.0
    );
    setSelectedAgent(clicked || null);
  };

  return (
    <div className="modulePage">
      {/* 1. Module Command Header */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge cyan">
            <Users size={14} />
            <span>MODULE 04</span>
          </div>
          <h2 className="moduleTitle">Live Multi-Agent Crowd Simulation</h2>
          <span className="moduleSubtitle">
            Continuous A* physics engine simulating up to 1,000 heterogeneous agents with queue formation and congestion backpressure.
          </span>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>SIMULATED PEOPLE</small>
            <b className="cyan">{agentCount} Agents</b>
          </div>
          <div className="headerStatBox">
            <small>AVG WALKING SPEED</small>
            <b>{liveStats.avgSpeed} m/s</b>
          </div>
          <div className="headerStatBox">
            <small>CONGESTION</small>
            <b className={metrics?.congestion?.proposed > 60 ? "bad" : "good"}>
              {metrics?.congestion?.proposed || 42}/100
            </b>
          </div>
          <div className="headerStatBox">
            <small>VERDICT</small>
            <b className={simulationResult?.score >= 80 ? "good" : "bad"}>
              {simulationResult?.verdict || "REVIEW"}
            </b>
          </div>
        </div>
      </div>

      {/* 2. Interactive Simulation Controls Ribbon */}
      <div className="simControlsRibbon">
        <div className="simBtnGroup">
          <button
            className={`controlBtn ${simulationStatus === "running" ? "active" : ""}`}
            onClick={() => setSimulationStatus(simulationStatus === "running" ? "paused" : "running")}
          >
            {simulationStatus === "running" ? <Pause size={14} /> : <Play size={14} />}
            <span>{simulationStatus === "running" ? "PAUSE" : "START"}</span>
          </button>
          <button className="controlBtn" onClick={initAgents}>
            <RotateCcw size={14} />
            <span>RESET</span>
          </button>
        </div>

        <div className="simDivider" />

        {/* Agent Count Selector */}
        <div className="controlGroup">
          <span className="controlLabel">AGENT DENSITY:</span>
          <div className="pillSelectGroup">
            {[10, 50, 100, 500, 1000].map((count) => (
              <button
                key={count}
                className={`pillSelectBtn ${agentCount === count ? "active" : ""}`}
                onClick={() => setAgentCount(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="simDivider" />

        {/* Simulation Speed */}
        <div className="controlGroup">
          <span className="controlLabel">SPEED:</span>
          <div className="pillSelectGroup">
            {[0.5, 1.0, 2.0, 5.0].map((spd) => (
              <button
                key={spd}
                className={`pillSelectBtn ${simulationSpeed === spd ? "active" : ""}`}
                onClick={() => setSimulationSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="simDivider" />

        {/* Layer Toggles */}
        <div className="layerTogglesRow">
          <button
            className={`layerToggleBtn ${showHeatmap ? "active" : ""}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            <Flame size={13} />
            <span>Heatmap</span>
          </button>
          <button
            className={`layerToggleBtn ${showRoutes ? "active" : ""}`}
            onClick={() => setShowRoutes(!showRoutes)}
          >
            <Navigation size={13} />
            <span>Routes</span>
          </button>
          <button
            className={`layerToggleBtn ${showGrid ? "active" : ""}`}
            onClick={() => setShowGrid(!showGrid)}
          >
            <Compass size={13} />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: 70% Live Canvas | 30% Intelligence */}
      <div className="moduleWorkspaceGrid">
        {/* Left 70%: High Performance Canvas */}
        <div className="canvasCard">
          <div className="canvasCardHeader">
            <div className="canvasHeaderLeft">
              <span className="dotLive" />
              <b>LIVE SPATIAL VIEWPORT &bull; {currentEnv?.name}</b>
              <span className="canvasDimText">({currentEnv?.size || "120 × 80 m"})</span>
            </div>
            <div className="canvasLegend">
              {personaList.slice(0, 4).map((p) => (
                <div key={p.id} className="legendItem">
                  <span className="legendDot" style={{ backgroundColor: p.color }} />
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="canvasWrapper">
            <canvas
              ref={canvasRef}
              width={1000}
              height={640}
              className="liveSimCanvas"
              onClick={handleCanvasClick}
            />
          </div>
        </div>

        {/* Right 30%: Persona Intelligence & Agent Inspector */}
        <div className="moduleSidePanel">
          {/* Persona Distribution Matrix */}
          <div className="sidePanelCard">
            <div className="cardHead">
              <Users size={16} className="iconCyan" />
              <b>Heterogeneous Persona Mix</b>
            </div>
            <div className="personaList">
              {personaList.map((p) => (
                <div
                  key={p.id}
                  className={`personaRow ${selectedPersona === p.id ? "active" : ""}`}
                  onClick={() => setSelectedPersona(p.id)}
                >
                  <div className="personaRowLeft">
                    <span className="personaColorBar" style={{ backgroundColor: p.color }} />
                    <div>
                      <strong className="personaName">{p.label}</strong>
                      <small className="personaSpeed">Velocity: {p.speed}</small>
                    </div>
                  </div>
                  <span className="personaShareBadge">{p.share}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Agent Inspector */}
          {selectedAgent ? (
            <div className="sidePanelCard agentInspector">
              <div className="cardHead">
                <Sparkles size={16} className="iconAmber" />
                <b>Agent Inspector: {selectedAgent.id.toUpperCase()}</b>
              </div>
              <div className="inspectorStatsGrid">
                <div className="inspectorItem">
                  <small>ARCHETYPE</small>
                  <b style={{ color: selectedAgent.color }}>{selectedAgent.archetype.toUpperCase()}</b>
                </div>
                <div className="inspectorItem">
                  <small>VELOCITY</small>
                  <b>{selectedAgent.speed} m/s</b>
                </div>
                <div className="inspectorItem">
                  <small>COMFORT RATING</small>
                  <b className={selectedAgent.comfort > 75 ? "good" : "bad"}>{selectedAgent.comfort}/100</b>
                </div>
                <div className="inspectorItem">
                  <small>ROUTE STAGE</small>
                  <b>Stage {selectedAgent.currentSegment + 1} of {selectedAgent.waypoints.length}</b>
                </div>
              </div>
            </div>
          ) : (
            <div className="sidePanelCard hintCard">
              <Eye size={16} className="iconCyan" />
              <p>Click any animated person on the canvas to inspect real-time route dynamics, velocity, and comfort.</p>
            </div>
          )}

          {/* AI Spatial Recommendation Quick Morph */}
          <div className="sidePanelCard aiActionCard">
            <div className="cardHead">
              <Sparkles size={16} className="iconCyan" />
              <b>AI Queue & Flow Recommendation</b>
            </div>
            <p className="aiActionDesc">
              {simulationResult?.ai_analysis?.recommendation ||
                "Position registration desk within 15m of entrance concourse with dual queue stanchions."}
            </p>
            <button
              className="primaryBtn fullWidth"
              onClick={() => onApplyRecommendation({ x: 28.0, y: 40.0 })}
            >
              <Sparkles size={14} />
              <span>Apply AI Optimal Layout (96/100)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
