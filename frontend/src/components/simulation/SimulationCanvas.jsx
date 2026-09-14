import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  MousePointer2,
  Users,
  Compass,
  Eye,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  ArrowRight,
  Route as RouteIcon,
  Maximize2,
  BrainCircuit,
  X,
  Zap,
  Bot,
  Building,
  HeartPulse,
  Accessibility,
  Flame
} from "lucide-react";
import { AGENT_ARCHETYPES } from "../../data/agentArchetypes";

export function SimulationCanvas({
  environment,
  selectedObject,
  proposalPosition,
  setProposalPosition,
  simulationResult,
  timeOfDay = "morning",
  showHeatmap = true,
  showRoutes = true,
  showAgents = true,
  showLabels = true,
  showGrid = true,
  viewMode = "2D"
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isSimulatingTransient, setIsSimulatingTransient] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [inspectedAgent, setInspectedAgent] = useState(null);

  const canvasRef = useRef(null);
  const simTimerRef = useRef(null);

  function triggerSimulatingFeedback() {
    setIsSimulatingTransient(true);
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    simTimerRef.current = setTimeout(() => {
      setIsSimulatingTransient(false);
    }, 450);
  }

  function handlePointerDown(e) {
    e.stopPropagation();
    setIsDragging(true);
    triggerSimulatingFeedback();
  }

  function handlePointerMove(e) {
    if (isDragging && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 100;
      const rawY = ((e.clientY - rect.top) / rect.height) * 100;

      const adjX = (rawX - 50 - panOffset.x) / zoomLevel + 50;
      const adjY = (rawY - 50 - panOffset.y) / zoomLevel + 50;

      const clampedX = Math.max(8, Math.min(92, adjX));
      const clampedY = Math.max(10, Math.min(90, adjY));

      setProposalPosition({
        x: Number(clampedX.toFixed(1)),
        y: Number(clampedY.toFixed(1))
      });
      triggerSimulatingFeedback();
    } else if (isPanning) {
      const dx = ((e.clientX - panStart.x) / (canvasRef.current?.clientWidth || 800)) * 100;
      const dy = ((e.clientY - panStart.y) / (canvasRef.current?.clientHeight || 600)) * 100;
      setPanOffset({
        x: panOffset.x + dx,
        y: panOffset.y + dy
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }

  function handlePointerUp() {
    setIsDragging(false);
    setIsPanning(false);
  }

  function handleCanvasClick(e) {
    if (isDragging || isPanning || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const adjX = (rawX - 50 - panOffset.x) / zoomLevel + 50;
    const adjY = (rawY - 50 - panOffset.y) / zoomLevel + 50;

    const clampedX = Math.max(8, Math.min(92, adjX));
    const clampedY = Math.max(10, Math.min(90, adjY));

    setProposalPosition({
      x: Number(clampedX.toFixed(1)),
      y: Number(clampedY.toFixed(1))
    });
    triggerSimulatingFeedback();
  }

  function handleStartPan(e) {
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }

  const objects = environment?.objects || [];
  const entrance = objects.find((o) => o.kind === "entrance") || { x: 10, y: 40, name: "Emergency Ingress" };
  const emergencyExit = objects.find((o) => o.kind === "exit" || o.kind === "critical") || { x: 95, y: 24, name: "East Emergency Egress" };
  const waitingRoom = objects.find((o) => o.kind === "room") || { x: 68, y: 22, name: "Patient Waiting Lounge" };
  const triage = objects.find((o) => o.id === "emergency") || { x: 68, y: 57, name: "Emergency Triage Dept" };

  const isCongested = proposalPosition.x > 60 || proposalPosition.y > 60;

  // Heatmap points
  const heatmapData = simulationResult?.heatmap || [
    { x: 28, y: 38, intensity: 35 },
    { x: 52, y: 43, intensity: 55 },
    { x: proposalPosition.x, y: proposalPosition.y, intensity: isCongested ? 85 : 30 },
    { x: 68, y: 57, intensity: 50 }
  ];

  // Healthcare Agent Archetypes
  const baseAgents = [
    { id: "ag_pt1", archetype: "patient", label: "Patient #01", speed: 1.2, delay: 0.2, dest: "desk" },
    { id: "ag_pt2", archetype: "patient", label: "Patient #02", speed: 1.1, delay: 1.4, dest: "waiting" },
    { id: "ag_wc1", archetype: "wheelchair", label: "ADA Wheelchair Patient", speed: 0.9, delay: 0.8, dest: "desk" },
    { id: "ag_st1", archetype: "stretcher", label: "Trauma Stretcher Flow", speed: 1.6, delay: 2.1, dest: "triage" },
    { id: "ag_dr1", archetype: "doctor", label: "Emergency Physician", speed: 1.5, delay: 0.5, dest: "triage" },
    { id: "ag_nr1", archetype: "nurse", label: "Triage Nurse", speed: 1.4, delay: 1.8, dest: "waiting" },
    { id: "ag_em1", archetype: "emergency", label: "Code Red Responder", speed: 1.8, delay: 2.9, dest: "exit" }
  ];

  const agentList = baseAgents;

  // Clean SVG path builder that connects clinical waypoints cleanly without wild loops
  const baselinePath = selectedObject
    ? `M ${entrance.x + 8},${entrance.y + 8} L ${selectedObject.x + 8},${selectedObject.y + 5} L ${waitingRoom.x + 10},${waitingRoom.y + 10} L ${emergencyExit.x + 4},${emergencyExit.y + 6}`
    : "";

  const proposedPath = `M ${entrance.x + 8},${entrance.y + 8} L ${proposalPosition.x + 8},${proposalPosition.y + 5} L ${waitingRoom.x + 10},${waitingRoom.y + 10} L ${emergencyExit.x + 4},${emergencyExit.y + 6}`;

  return (
    <div
      className={`spatialCanvas ${viewMode === "3D" ? "threeDMode" : ""}`}
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseDown={handleStartPan}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Zoom & Pan Floating Controls */}
      <div className="canvasFloatingToolbar" onClick={(e) => e.stopPropagation()}>
        <button
          className="canvasToolBtn"
          onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.15))}
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <span className="zoomLevelText">{Math.round(zoomLevel * 100)}%</span>
        <button
          className="canvasToolBtn"
          onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.15))}
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          className="canvasToolBtn"
          onClick={() => {
            setZoomLevel(1.0);
            setPanOffset({ x: 0, y: 0 });
          }}
          title="Reset Viewport"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Real-time Recalculating Badge */}
      {isSimulatingTransient && (
        <div className="simulatingStatusBadge">
          <Activity size={14} className="spin iconCyan" />
          <span>RECALCULATING CLINICAL MULTI-AGENT PATHS...</span>
        </div>
      )}

      {/* Agent Mind Telemetry HUD */}
      {inspectedAgent && (
        <div className="agentMindHudCard" onClick={(e) => e.stopPropagation()}>
          <div className="mindHudHeader">
            <div className="mindTitle">
              <BrainCircuit size={15} className="iconCyan" />
              <span>AGENT TELEMETRY: <strong>{inspectedAgent.label}</strong></span>
            </div>
            <button className="mindCloseBtn" onClick={() => setInspectedAgent(null)}>
              <X size={14} />
            </button>
          </div>

          <div className="mindGrid">
            <div className="mindItem">
              <small>ARCHETYPE</small>
              <b>{inspectedAgent.archetype?.toUpperCase()}</b>
            </div>
            <div className="mindItem">
              <small>LIVE VELOCITY</small>
              <b className={isCongested ? "bad" : "good"}>
                {(inspectedAgent.speed * (isCongested ? 0.7 : 1.1)).toFixed(2)} m/s {isCongested ? "(Friction -30%)" : "(Optimal)"}
              </b>
            </div>
            <div className="mindItem">
              <small>TRANSIT DETOUR</small>
              <b>{isCongested ? "+28.4m Detour" : "Direct Clinical Spine"}</b>
            </div>
            <div className="mindItem">
              <small>ADA CLEARANCE</small>
              <b className={isCongested ? "bad" : "good"}>
                {isCongested ? "1.1m (Restricted)" : "2.4m (Safe Zone)"}
              </b>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Transform Scaling Container */}
      <div
        className="canvasTransformLayer"
        style={{
          transform: `translate(${panOffset.x}%, ${panOffset.y}%) scale(${zoomLevel})`,
          transformOrigin: "50% 50%",
          width: "100%",
          height: "100%",
          position: "relative"
        }}
      >
        {/* Futuristic Spatial Blueprint Grid */}
        {showGrid && <div className="spatialGrid" />}

        {/* Dynamic Congestion Heatmap Floor Layer */}
        {showHeatmap && (
          <div className="heatmapLayer">
            {heatmapData.map((h, idx) => (
              <div
                key={idx}
                className="heatPoint"
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  opacity: 0.18 + h.intensity / 180,
                  transform: `translate(-50%, -50%) scale(${0.8 + h.intensity / 80})`
                }}
              />
            ))}
          </div>
        )}

        {/* Clean Clinical Zones & Architectural Objects */}
        {objects.map((obj) => {
          const isSelected = obj.id === selectedObject?.id;
          return (
            <div
              key={obj.id}
              className={`canvasObject ${obj.kind} ${isSelected ? "selected" : ""}`}
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                width: `${obj.w}%`,
                height: `${obj.h}%`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="objHeaderPill">
                <span className="objKindTag">{obj.kind?.toUpperCase()}</span>
                {obj.critical && <span className="objCriticalDot" />}
              </div>
              {showLabels && <span className="objLabel">{obj.name}</span>}
              <div className="objFootprintPill">
                <span>{obj.w}×{obj.h}m &bull; Cap: {obj.capacity || 40}</span>
              </div>
            </div>
          );
        })}

        {/* Clean Glowing SVG Path Ribbons */}
        {showRoutes && (
          <svg className="routesSvgLayer" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Baseline Route (Subtle Muted Slate Dashed) */}
            {selectedObject && (
              <path
                d={baselinePath}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            )}

            {/* Proposed What-If Route (Glowing Cyan or Coral Alert) */}
            <path
              d={proposedPath}
              fill="none"
              stroke={isCongested ? "#f43f5e" : "#00e5ff"}
              strokeWidth="2.2"
              filter={isCongested ? "url(#glow-red)" : "url(#glow-cyan)"}
              opacity="0.9"
            />
          </svg>
        )}

        {/* Ghost Baseline Anchor Marker */}
        {selectedObject && (
          <div
            className="spatialMarker currentMarker"
            style={{ left: `${selectedObject.x}%`, top: `${selectedObject.y}%` }}
          >
            <div className="markerNode current" />
            <span className="markerTag current">BASELINE ({selectedObject.name})</span>
          </div>
        )}

        {/* Interactive Draggable Target Marker */}
        <div
          className="spatialMarker proposedMarker"
          style={{ left: `${proposalPosition.x}%`, top: `${proposalPosition.y}%` }}
          onPointerDown={handlePointerDown}
        >
          <div className={`markerNode proposed ${isCongested ? "critical" : ""}`}>
            <Plus size={16} />
          </div>
          <div className={`markerBadge proposed ${isCongested ? "bad" : "good"}`}>
            <span>{isCongested ? "WARNING: CORRIDOR CONGESTION" : "PROPOSED TARGET"}</span>
          </div>
        </div>

        {/* Multi-Agent Patient & Clinical Flow Dots */}
        {showAgents && (
          <div className="agentsContainer">
            {agentList.map((agent, i) => {
              const startX = entrance.x + 2 + (i % 2) * 2;
              const startY = entrance.y + 2 + (i % 3) * 2;

              let targetX = proposalPosition.x + 3;
              let targetY = proposalPosition.y + 2;

              if (agent.dest === "waiting") {
                targetX = waitingRoom.x + 5 + (i % 2) * 3;
                targetY = waitingRoom.y + 4 + (i % 2) * 3;
              } else if (agent.dest === "triage") {
                targetX = triage.x + 4 + (i % 2) * 3;
                targetY = triage.y + 3 + (i % 2) * 3;
              } else if (agent.dest === "exit") {
                targetX = emergencyExit.x + 1;
                targetY = emergencyExit.y + 2;
              }

              const speedMultiplier = isCongested ? 0.7 : 1.1;
              const effectiveDuration = (4.2 / (agent.speed * speedMultiplier)).toFixed(2);

              const colorMap = {
                patient: "#38bdf8",
                wheelchair: "#a855f7",
                stretcher: "#f43f5e",
                doctor: "#10b981",
                nurse: "#34d399",
                emergency: "#fb7185"
              };

              const agentColor = colorMap[agent.archetype] || "#38bdf8";

              return (
                <div
                  key={agent.id}
                  className={`animatedAgent ${inspectedAgent?.id === agent.id ? "inspected" : ""}`}
                  style={{
                    "--startX": `${startX}%`,
                    "--startY": `${startY}%`,
                    "--targetX": `${targetX}%`,
                    "--targetY": `${targetY}%`,
                    "--color": agentColor,
                    "--delay": `${agent.delay}s`,
                    "--duration": `${effectiveDuration}s`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedAgent(agent);
                  }}
                  title="Click to inspect clinical agent telemetry"
                >
                  <div className="agentRing" style={{ borderColor: agentColor }} />
                  <div className="agentCore" style={{ backgroundColor: agentColor }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
