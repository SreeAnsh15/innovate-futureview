import React from "react";
import { Users, Gauge, Eye, Route, Grid } from "lucide-react";

export function LayerControls({
  showHeatmap,
  setShowHeatmap,
  showRoutes,
  setShowRoutes,
  showAgents,
  setShowAgents,
  showLabels,
  setShowLabels,
  showGrid,
  setShowGrid
}) {
  return (
    <div className="layerControls">
      <div className="layerRow">
        <span className="layerLabel">
          <Gauge size={14} className="iconCyan" />
          <span>Congestion Heatmap</span>
        </span>
        <button
          className={`switchToggle ${showHeatmap ? "on" : ""}`}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          <i />
        </button>
      </div>

      <div className="layerRow">
        <span className="layerLabel">
          <Route size={14} className="iconBlue" />
          <span>Flow Paths</span>
        </span>
        <button
          className={`switchToggle ${showRoutes ? "on" : ""}`}
          onClick={() => setShowRoutes(!showRoutes)}
        >
          <i />
        </button>
      </div>

      <div className="layerRow">
        <span className="layerLabel">
          <Users size={14} className="iconGreen" />
          <span>Animated Agents</span>
        </span>
        <button
          className={`switchToggle ${showAgents ? "on" : ""}`}
          onClick={() => setShowAgents(!showAgents)}
        >
          <i />
        </button>
      </div>

      <div className="layerRow">
        <span className="layerLabel">
          <Eye size={14} className="iconAmber" />
          <span>Object Labels</span>
        </span>
        <button
          className={`switchToggle ${showLabels ? "on" : ""}`}
          onClick={() => setShowLabels(!showLabels)}
        >
          <i />
        </button>
      </div>

      <div className="layerRow">
        <span className="layerLabel">
          <Grid size={14} />
          <span>Spatial Grid</span>
        </span>
        <button
          className={`switchToggle ${showGrid ? "on" : ""}`}
          onClick={() => setShowGrid(!showGrid)}
        >
          <i />
        </button>
      </div>
    </div>
  );
}
