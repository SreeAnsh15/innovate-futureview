import React, { useState } from "react";
import {
  Compass,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Building2,
  Cuboid,
  Eye,
  Map,
  CloudUpload,
  ArrowRight,
  Maximize2,
  MousePointer2,
  Sparkles,
  Check,
  Layers3,
  Sliders,
  FileText,
  Upload,
  TrendingUp,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { SimulationCanvas } from "../simulation/SimulationCanvas";
import { LayerControls } from "../simulation/LayerControls";
import { ComparisonPanel } from "../simulation/ComparisonPanel";
import { PropertyPanel } from "./PropertyPanel";
import { DataHonestyBadge } from "../common/Toast";
import { useFutureView } from "../../context/FutureViewContext";
import { UNIVERSAL_WORLDS } from "../../data/universalWorlds";

export function SpatialEditor({
  environment,
  selectedObjectId,
  setSelectedObjectId,
  proposalPosition,
  setProposalPosition,
  simulationResult,
  loading,
  onRunSimulation,
  onResetSimulation,
  onDownloadReport,
  onUpdateObjectProps,
  onOpenAiView,
  onApplyRecommendation,
  onEnvironmentImported,
  onShowToast,
  setTab,
  showHeatmap,
  setShowHeatmap,
  showRoutes,
  setShowRoutes,
  showAgents,
  setShowAgents,
  showLabels,
  setShowLabels,
  showGrid,
  setShowGrid,
  timeOfDay = "morning"
}) {
  const { activeWorld } = useFutureView();
  const currentWorld = activeWorld || environment || UNIVERSAL_WORLDS[0];

  const [activeControlTab, setActiveControlTab] = useState("controls"); // "controls" | "upload" | "layers"
  const [showRightTelemetry, setShowRightTelemetry] = useState(true);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  const objects = currentWorld?.objects || [];
  const selectedObject =
    objects.find((o) => o.id === selectedObjectId) ||
    objects.find((o) => o.movable !== false) ||
    objects[1] ||
    objects[0];

  return (
    <div
      className={`spatialEditorWorkspace ${isLeftSidebarCollapsed ? "leftSidebarCollapsed" : ""}`}
      style={{
        gridTemplateColumns: `${isLeftSidebarCollapsed ? "56px" : "310px"} minmax(0, 1fr) ${showRightTelemetry ? "340px" : "0px"}`
      }}
    >
      {/* 1. Left Controls Rail */}
      <aside className={`editorSidebar leftSidebar ${isLeftSidebarCollapsed ? "collapsed" : ""}`}>
        <button
          className="sidebarCollapseToggle"
          type="button"
          onClick={() => setIsLeftSidebarCollapsed((collapsed) => !collapsed)}
          aria-label={isLeftSidebarCollapsed ? "Expand target element sidebar" : "Collapse target element sidebar"}
          title={isLeftSidebarCollapsed ? "Expand target element sidebar" : "Collapse target element sidebar"}
        >
          {isLeftSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {!isLeftSidebarCollapsed && (
          <>
        {/* Active Space Summary Card */}
        <div className="envActiveCard">
          <div className="envCardIcon">
            <Compass size={18} />
          </div>
          <div className="envCardMeta">
            <span className="envCardType">{currentWorld.domain_name?.toUpperCase() || "SPATIAL TWIN"}</span>
            <h4 className="envCardName">{currentWorld.name}</h4>
            <span className="envCardDimensions">{currentWorld.size || "100 × 75 m"} &bull; Real-Time Multi-Agent Physics</span>
          </div>
        </div>

        {/* Sub-Tab Navigation for Editor Rail */}
        <div className="editorRailTabs">
          <button
            className={`railTabBtn ${activeControlTab === "controls" ? "active" : ""}`}
            onClick={() => setActiveControlTab("controls")}
          >
            <Compass size={13} />
            <span>Target Element</span>
          </button>
          <button
            className={`railTabBtn ${activeControlTab === "layers" ? "active" : ""}`}
            onClick={() => setActiveControlTab("layers")}
          >
            <Layers size={13} />
            <span>Map Layers</span>
          </button>
        </div>

        {/* TAB 1: WHAT-IF CONTROLS */}
        {activeControlTab === "controls" && (
          <div className="railTabContent">
            {/* Target Select Dropdown */}
            <div className="propSelectGroup">
              <label className="propSelectLabel">TARGET ELEMENT TO MUTATE / RELOCATE</label>
              <select
                className="propSelect full"
                value={selectedObjectId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setSelectedObjectId(newId);
                  const obj = objects.find((o) => o.id === newId);
                  if (obj) setProposalPosition({ x: obj.x, y: obj.y });
                }}
              >
                {objects
                  .filter((o) => o.movable !== false)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.kind})
                    </option>
                  ))}
              </select>
            </div>

            {/* Property Panel */}
            <PropertyPanel
              selectedObject={selectedObject}
              proposalPosition={proposalPosition}
              onChangeProposal={setProposalPosition}
              onChangeObjectProps={onUpdateObjectProps}
              onResetPosition={onResetSimulation}
            />

            {/* Drag Hint */}
            <div className="dragHint">
              <MousePointer2 size={13} className="iconCyan" />
              <span>Interactive Drag: Click & drag the glowing cyan crosshair on the map to test new positions.</span>
            </div>

            {/* Run Action Button */}
            <div className="actionButtonStack">
              <button className="primarySimulationBtn" onClick={onRunSimulation} disabled={loading}>
                {loading ? <Activity className="spin" size={16} /> : <Play size={16} />}
                <span>{loading ? "CALCULATING SPATIAL PHYSICS..." : "RUN AI SPATIAL SIMULATION"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL LAYERS */}
        {activeControlTab === "layers" && (
          <div className="railTabContent">
            <LayerControls
              showHeatmap={showHeatmap}
              setShowHeatmap={setShowHeatmap}
              showRoutes={showRoutes}
              setShowRoutes={setShowRoutes}
              showAgents={showAgents}
              setShowAgents={setShowAgents}
              showLabels={showLabels}
              setShowLabels={setShowLabels}
              showGrid={showGrid}
              setShowGrid={setShowGrid}
            />
          </div>
        )}
          </>
        )}
      </aside>

      {/* 2. Center Simulation Canvas */}
      <section className="editorCanvasSection">
        <div className="canvasTopBar">
          <div className="canvasTitleGroup">
            <h3 className="canvasTitle">{environment.name.toUpperCase()}</h3>
            <span className="canvasSubtitle">2D Interactive Multi-Agent Flow & Spatial Triage Physics</span>
          </div>

          <div className="canvasModeSwitcher">
            <button className="modeBtn active" title="2D Map View">
              <Map size={13} />
              <span>2D Canvas</span>
            </button>
            <button className="modeBtn" onClick={() => setTab("3d")} title="3D Digital Twin View">
              <Cuboid size={13} />
              <span>3D Twin</span>
            </button>
            <button className="modeBtn" onClick={() => setTab("webxr")} title="AR Spatial Viewport">
              <Eye size={13} />
              <span>AR Viewport</span>
            </button>
            <button
              className={`modeBtn ${showRightTelemetry ? "active" : ""}`}
              onClick={() => setShowRightTelemetry(!showRightTelemetry)}
              title="Toggle Telemetry Panel"
            >
              <Sliders size={13} />
              <span>Telemetry</span>
            </button>
          </div>
        </div>

        <SimulationCanvas
          environment={environment}
          selectedObject={selectedObject}
          proposalPosition={proposalPosition}
          setProposalPosition={setProposalPosition}
          simulationResult={simulationResult}
          timeOfDay={timeOfDay}
          showHeatmap={showHeatmap}
          showRoutes={showRoutes}
          showAgents={showAgents}
          showLabels={showLabels}
          showGrid={showGrid}
          viewMode="2D"
        />

        <div className="canvasBottomBar">
          <div className="legendItems">
            <span className="legendItem">
              <i className="legendDot" style={{ background: "#22D3EE" }} /> Standard Pedestrians
            </span>
            <span className="legendItem">
              <i className="legendDot" style={{ background: "#A855F7" }} /> Wheelchair / Mobility Assisted
            </span>
            <span className="legendItem">
              <i className="legendDot" style={{ background: "#EF4444" }} /> Congestion / Bottleneck Point
            </span>
          </div>
          <DataHonestyBadge text="DETERMINISTIC SIMULATION ACTIVE" />
        </div>
      </section>

      {/* 3. Right Telemetry Drawer */}
      {showRightTelemetry && (
        <aside className="editorSidebar rightSidebar">
          <div className="sideBlockHead">
            <span className="sideNum">AI</span>
            <span className="sideTitle">CLINICAL SPATIAL TELEMETRY</span>
          </div>

          <ComparisonPanel
            simulationResult={simulationResult}
            proposalPosition={proposalPosition}
            onApplyRecommendation={onApplyRecommendation}
            onDownloadReport={onDownloadReport}
            onOpenAiView={onOpenAiView}
          />
        </aside>
      )}
    </div>
  );
}
