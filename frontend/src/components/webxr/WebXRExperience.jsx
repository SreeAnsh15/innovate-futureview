import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  Camera,
  Layers,
  Crosshair,
  Sliders,
  Move,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  Cuboid,
  Sparkles,
  Maximize2,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { UNIVERSAL_WORLDS } from "../../data/universalWorlds";

export function WebXRExperience({ setTab }) {
  const {
    activeWorld,
    switchWorld,
    simulationResult,
    metrics,
    proposalPosition,
    setProposalPosition,
    showToast
  } = useFutureView();

  const currentWorld = activeWorld || UNIVERSAL_WORLDS[0];

  // Presentation Mode: "current" vs "proposed"
  const [viewMode, setViewMode] = useState("proposed");
  const [arFeedMode, setArFeedMode] = useState("spatial"); // "spatial" | "camera"
  const [webxrSupported, setWebxrSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timelineStep, setTimelineStep] = useState(0); // 0 = NOW, 1 = +10m, 2 = +20m, 3 = +30m, 4 = +60m

  // Visual Layers
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [arScale, setArScale] = useState(1.0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check WebXR capability gracefully
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar")
        .then((supported) => setWebxrSupported(supported))
        .catch(() => setWebxrSupported(false));
    } else {
      setWebxrSupported(false);
    }
  }, []);

  // Live Canvas Rendering for the Central AR Spatial World
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let frame = 0;

    const accent = currentWorld.accent_color || "#38bdf8";

    // Animated spatial flow agents
    const agents = Array.from({ length: 35 }, (_, i) => ({
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 3,
      color: i % 2 === 0 ? accent : "#38bdf8"
    }));

    const render = () => {
      frame++;
      const w = canvas.width = canvas.parentElement?.clientWidth || 800;
      const h = canvas.height = canvas.parentElement?.clientHeight || 500;

      // Dark AR spatial passthrough canvas
      ctx.fillStyle = arFeedMode === "camera" ? "rgba(2, 5, 11, 0.45)" : "#02050b";
      ctx.fillRect(0, 0, w, h);

      // AR Spatial Reticle & Ground Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 45;
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

      // Center AR Spatial Origin Reticle
      const cx = w * 0.5;
      const cy = h * 0.5;
      ctx.strokeStyle = `${accent}66`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 32, cy);
      ctx.lineTo(cx + 32, cy);
      ctx.moveTo(cx, cy - 32);
      ctx.lineTo(cx, cy + 32);
      ctx.stroke();

      // Render World Zones
      if (showHeatmap && currentWorld.zones) {
        currentWorld.zones.forEach((z) => {
          const zx = (z.x1 / 100) * w;
          const zy = (z.y1 / 100) * h;
          const zw = ((z.x2 - z.x1) / 100) * w;
          const zh = ((z.y2 - z.y1) / 100) * h;

          ctx.fillStyle = `${z.color}12`;
          ctx.strokeStyle = `${z.color}44`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(zx, zy, zw, zh, 6);
          ctx.fill();
          ctx.stroke();

          if (showLabels) {
            ctx.fillStyle = z.color;
            ctx.font = "600 10px 'JetBrains Mono', monospace";
            ctx.fillText(z.name.toUpperCase(), zx + 6, zy + 14);
          }
        });
      }

      // Render World Objects
      if (currentWorld.objects) {
        currentWorld.objects.forEach((obj) => {
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

          if (showLabels) {
            ctx.fillStyle = "#e2e8f0";
            ctx.font = "500 9px 'JetBrains Mono', monospace";
            ctx.fillText(obj.name, ox + 4, oy + oh + 12);
          }
        });
      }

      // Render Flow Routes
      if (showRoutes) {
        ctx.strokeStyle = viewMode === "proposed" ? "rgba(56, 189, 248, 0.85)" : "rgba(239, 68, 68, 0.85)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.5);
        ctx.bezierCurveTo(w * 0.35, h * 0.3, w * 0.65, h * 0.7, w * 0.85, h * 0.5);
        ctx.stroke();
      }

      // Render Multi-Agent Flow
      if (showAgents && isPlaying) {
        agents.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 10 || p.x > 90) p.vx *= -1;
          if (p.y < 10 || p.y > 90) p.vy *= -1;

          const px = (p.x / 100) * w;
          const py = (p.y / 100) * h;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentWorld, viewMode, arFeedMode, isPlaying, showHeatmap, showRoutes, showAgents, showLabels]);

  const timelineSteps = [
    { label: "NOW (T+0m)", time: 0 },
    { label: "+10 MIN", time: 10 },
    { label: "+20 MIN", time: 20 },
    { label: "+30 MIN", time: 30 },
    { label: "+60 MIN", time: 60 }
  ];

  return (
    <div className="arExperienceWorkspace">
      {/* 1. TOP AR MODE & CONFIGURATION BAR */}
      <div className="arTopControlsBar">
        <div className="arModeGroup">
          <button
            className={`arModePill ${viewMode === "current" ? "active" : ""}`}
            onClick={() => setViewMode("current")}
          >
            CURRENT BASELINE
          </button>
          <button
            className={`arModePill ${viewMode === "proposed" ? "active" : ""}`}
            onClick={() => setViewMode("proposed")}
          >
            PROPOSED COUNTERFACTUAL
          </button>
        </div>

        <div className="arFeedToggleGroup">
          <button
            className={`arFeedBtn ${arFeedMode === "spatial" ? "active" : ""}`}
            onClick={() => setArFeedMode("spatial")}
          >
            <Compass size={13} />
            <span>Spatial Twin</span>
          </button>
          <button
            className={`arFeedBtn ${arFeedMode === "camera" ? "active" : ""}`}
            onClick={() => {
              setArFeedMode("camera");
              showToast("AR Passthrough Camera mode enabled", "info");
            }}
          >
            <Camera size={13} />
            <span>Passthrough Feed</span>
          </button>
        </div>

        <div className="arCapabilityBadge">
          {webxrSupported ? (
            <span className="badgeWebxrAvailable">
              <CheckCircle2 size={12} /> WebXR Session Ready
            </span>
          ) : (
            <span className="badgeWebxrFallback">
              <Eye size={12} /> AR Preview Mode (WebXR Simulated)
            </span>
          )}
        </div>
      </div>

      {/* 2. MAIN AR SPATIAL VIEWPORT WITH MINIMAL FLOATING RAILS */}
      <div className="arViewportContainer">
        {/* Left Floating Contextual Tool Rail */}
        <div className="arLeftToolRail">
          <button
            className={`arRailBtn ${showHeatmap ? "active" : ""}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Toggle Spatial Zones & Heatmap"
          >
            <Layers size={14} />
          </button>
          <button
            className={`arRailBtn ${showRoutes ? "active" : ""}`}
            onClick={() => setShowRoutes(!showRoutes)}
            title="Toggle Flow Routes"
          >
            <Move size={14} />
          </button>
          <button
            className={`arRailBtn ${showAgents ? "active" : ""}`}
            onClick={() => setShowAgents(!showAgents)}
            title="Toggle Multi-Agent Flow"
          >
            <Activity size={14} />
          </button>
          <button
            className={`arRailBtn ${showLabels ? "active" : ""}`}
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle Spatial Anchor Labels"
          >
            <Crosshair size={14} />
          </button>
        </div>

        {/* Center Dominant Spatial Canvas */}
        <div className="arCentralCanvasWrap">
          <canvas ref={canvasRef} className="arSpatialCanvas" />

          {/* AR Anchor Status Overlay */}
          <div className="arAnchorBadge">
            <Crosshair size={12} className="spinSlow" />
            <span>AR ANCHOR LOCKED &bull; {currentWorld.name.toUpperCase()}</span>
          </div>
        </div>

        {/* Right Floating Telemetry HUD */}
        <div className="arRightTelemetryHUD">
          <div className="arHudHeader">
            <span className="hudWorldDomain">{currentWorld.domain_name?.toUpperCase()}</span>
            <b className="hudWorldTitle">{currentWorld.name}</b>
          </div>

          <div className="arHudMetricsList">
            <div className="arHudMetricItem">
              <span className="hudMetricLabel">Counterfactual Score</span>
              <b className="hudMetricVal textGreen">
                {viewMode === "proposed" ? "88 / 100" : "72 / 100"}
              </b>
            </div>

            <div className="arHudMetricItem">
              <span className="hudMetricLabel">Avg Traversal Transit</span>
              <b className="hudMetricVal">
                {viewMode === "proposed"
                  ? `${(currentWorld.width_m * 0.28).toFixed(1)} m (-20%)`
                  : `${(currentWorld.width_m * 0.35).toFixed(1)} m`}
              </b>
            </div>

            <div className="arHudMetricItem">
              <span className="hudMetricLabel">First Failure Bottleneck</span>
              <b className="hudMetricVal textAmber">
                {currentWorld.what_breaks_first?.target || "Central Concourse"}
              </b>
              <small className="hudSubtext">
                Breaks in {currentWorld.what_breaks_first?.time_min || 12} min under peak surge
              </small>
            </div>
          </div>

          <button
            className="arJumpDossierBtn"
            onClick={() => setTab("decision_report")}
          >
            <span>Open Decision Dossier</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM SIMULATION TIMELINE SCRUBBER */}
      <div className="arBottomTimelineBar">
        <div className="arPlaybackControls">
          <button
            className="arPlayBtn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Simulation" : "Play Simulation"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            className="arResetBtn"
            onClick={() => setTimelineStep(0)}
            title="Reset Timeline to T+0"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        <div className="arTimelineScrubberTrack">
          {timelineSteps.map((step, idx) => (
            <button
              key={step.time}
              className={`arTimelineStepBtn ${timelineStep === idx ? "active" : ""}`}
              onClick={() => setTimelineStep(idx)}
            >
              <div className="stepDot" />
              <span>{step.label}</span>
            </button>
          ))}
        </div>

        <div className="arScaleControls">
          <span className="scaleLabel">SCALE:</span>
          <button
            className={`scaleBtn ${arScale === 0.5 ? "active" : ""}`}
            onClick={() => setArScale(0.5)}
          >
            0.5x
          </button>
          <button
            className={`scaleBtn ${arScale === 1.0 ? "active" : ""}`}
            onClick={() => setArScale(1.0)}
          >
            1.0x
          </button>
          <button
            className={`scaleBtn ${arScale === 2.0 ? "active" : ""}`}
            onClick={() => setArScale(2.0)}
          >
            2.0x
          </button>
        </div>
      </div>
    </div>
  );
}
