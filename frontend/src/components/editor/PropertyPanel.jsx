import React from "react";
import { Sliders, ShieldCheck, Users, Move, RotateCcw, Sparkles, Building, Layers } from "lucide-react";

export function PropertyPanel({
  selectedObject,
  proposalPosition,
  onChangeProposal,
  onChangeObjectProps,
  onResetPosition
}) {
  if (!selectedObject) {
    return (
      <div className="propertyPanel empty">
        <Sliders size={24} className="iconMuted" />
        <p>Select any clinical node on the spatial floorplan to inspect properties.</p>
      </div>
    );
  }

  const kindLabels = {
    service: "Clinical Station",
    room: "Care & Waiting Area",
    critical: "Life-Safety / Triage Zone",
    entrance: "Emergency Ingress",
    exit: "Emergency Egress",
    corridor: "Clinical Circulation Spine"
  };

  return (
    <div className="propertyPanel">
      {/* Element Header Card */}
      <div className="propElementHeader">
        <div className="propHeaderTag">
          <span className="propPulseDot" />
          <span>SELECTED CLINICAL NODE</span>
        </div>
        <h4 className="propNodeTitle">{selectedObject.name}</h4>
        <div className="propKindBadge">
          <span
            className={`propTag ${selectedObject.kind}`}
            style={{
              position: "relative",
              zIndex: 20,
              background: "#0F172A",
              border: "1px solid #334155"
            }}
          >
            {kindLabels[selectedObject.kind] || selectedObject.kind.toUpperCase()}
          </span>
          {selectedObject.movable !== false ? (
            <span className="propMovableTag movable">
              <Move size={10} /> Movable Target
            </span>
          ) : (
            <span className="propMovableTag fixed">Fixed Architecture</span>
          )}
        </div>
      </div>

      {/* Position Coordinates (X, Y) */}
      <div className="propSection">
        <div className="propSectionLabel">
          <Sliders size={12} className="iconCyan" />
          <span>PROPOSED SPATIAL POSITION (% OF GRID)</span>
        </div>
        <div className="coordGrid">
          <div className="coordInputCard">
            <span className="coordAxis">X-AXIS</span>
            <div className="coordInputWrap">
              <input
                className="propInputNumber"
                type="number"
                step="0.5"
                min="5"
                max="95"
                value={proposalPosition.x}
                onChange={(e) => onChangeProposal({ ...proposalPosition, x: Number(e.target.value) })}
              />
              <span className="coordUnit">%</span>
            </div>
          </div>
          <div className="coordInputCard">
            <span className="coordAxis">Y-AXIS</span>
            <div className="coordInputWrap">
              <input
                className="propInputNumber"
                type="number"
                step="0.5"
                min="5"
                max="95"
                value={proposalPosition.y}
                onChange={(e) => onChangeProposal({ ...proposalPosition, y: Number(e.target.value) })}
              />
              <span className="coordUnit">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spatial Dimensions (W, H) */}
      <div className="propSection">
        <div className="propSectionLabel">
          <Layers size={12} className="iconCyan" />
          <span>PHYSICAL FOOTPRINT (W × H)</span>
        </div>
        <div className="coordGrid">
          <div className="coordInputCard">
            <span className="coordAxis">WIDTH</span>
            <div className="coordInputWrap">
              <input
                className="propInputNumber"
                type="number"
                min="4"
                max="80"
                value={selectedObject.w || 18}
                onChange={(e) => onChangeObjectProps(selectedObject.id, "w", Number(e.target.value))}
              />
              <span className="coordUnit">m</span>
            </div>
          </div>
          <div className="coordInputCard">
            <span className="coordAxis">HEIGHT</span>
            <div className="coordInputWrap">
              <input
                className="propInputNumber"
                type="number"
                min="4"
                max="80"
                value={selectedObject.h || 10}
                onChange={(e) => onChangeObjectProps(selectedObject.id, "h", Number(e.target.value))}
              />
              <span className="coordUnit">m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity & Mobility Priority */}
      <div className="propSection">
        <div className="propField">
          <label className="propFieldLabel">DESIGN OCCUPANCY CAPACITY</label>
          <div className="coordInputWrap full">
            <input
              className="propInputNumber full"
              type="number"
              min="5"
              max="500"
              value={selectedObject.capacity || 45}
              onChange={(e) => onChangeObjectProps(selectedObject.id, "capacity", Number(e.target.value))}
            />
            <span className="coordUnit">patients</span>
          </div>
        </div>

        <div className="propField" style={{ marginTop: "12px" }}>
          <label className="propFieldLabel">ADA MOBILITY PRIORITY</label>
          <select
            className="propSelect"
            value={selectedObject.accessibility_priority || "high"}
            onChange={(e) => onChangeObjectProps(selectedObject.id, "accessibility_priority", e.target.value)}
          >
            <option value="low">Standard Clearance (0.9m)</option>
            <option value="medium">Medium Priority (1.2m Corridor)</option>
            <option value="high">High Mobility Priority (1.8m ADA)</option>
            <option value="critical">Critical Trauma Egress (2.4m Safe Zone)</option>
          </select>
        </div>
      </div>

      {/* Reset to Baseline Button */}
      <button className="propResetBtn" onClick={onResetPosition}>
        <RotateCcw size={13} />
        <span>Reset Element to Baseline Position</span>
      </button>
    </div>
  );
}
