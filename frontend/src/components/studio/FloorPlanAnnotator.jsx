import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Save,
  Compass,
  Layers,
  Sparkles,
  Move,
  Info,
  DoorOpen,
  ShieldAlert,
  Building2,
  LayoutGrid,
  CheckCircle2,
  Eye
} from "lucide-react";

export function FloorPlanAnnotator({ environment, onUpdateEnvironment, setTab }) {
  const [objects, setObjects] = useState(environment.objects || []);
  const [selectedId, setSelectedId] = useState(objects[0]?.id || null);
  const [newKind, setNewKind] = useState("service");
  const [newName, setNewName] = useState("");
  const [blueprintOpacity, setBlueprintOpacity] = useState(75);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragIdRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const selectedObj = objects.find((o) => o.id === selectedId) || null;

  function handleAddObject(kindOverride) {
    const kind = kindOverride || newKind;
    const id = "elem_" + Date.now().toString(36);
    const kindTitles = {
      entrance: "Main Entrance",
      exit: "Emergency Exit",
      service: "Service Desk",
      counter: "Check-in Counter",
      room: "Waiting Area",
      critical: "Critical Care",
      corridor: "Circulation Corridor",
      obstacle: "Support Pillar"
    };

    const name = newName.trim() || `${kindTitles[kind] || kind.toUpperCase()} ${objects.length + 1}`;
    const newObj = {
      id,
      name,
      kind: kind === "counter" ? "service" : kind,
      x: 50,
      y: 50,
      w: kind === "corridor" ? 40 : kind === "room" ? 22 : kind === "obstacle" ? 6 : 14,
      h: kind === "corridor" ? 14 : kind === "room" ? 18 : kind === "obstacle" ? 6 : 10,
      movable: kind === "service" || kind === "counter" || kind === "room",
      critical: kind === "critical" || kind === "entrance" || kind === "exit",
      capacity: kind === "room" ? 60 : 40,
      accessibility_priority: kind === "entrance" || kind === "critical" ? "critical" : "medium"
    };

    const updated = [...objects, newObj];
    setObjects(updated);
    setSelectedId(id);
    setNewName("");
    onUpdateEnvironment({ ...environment, objects: updated });
  }

  function handleDeleteObject(id) {
    const updated = objects.filter((o) => o.id !== id);
    setObjects(updated);
    if (selectedId === id) setSelectedId(updated[0]?.id || null);
    onUpdateEnvironment({ ...environment, objects: updated });
  }

  function handleUpdateSelected(field, value) {
    if (!selectedObj) return;
    const updated = objects.map((o) => (o.id === selectedObj.id ? { ...o, [field]: value } : o));
    setObjects(updated);
    onUpdateEnvironment({ ...environment, objects: updated });
  }

  function handleCanvasMouseDown(e) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clicked = [...objects].reverse().find((o) => {
      const halfW = (o.w || 14) / 2;
      const halfH = (o.h || 10) / 2;
      return clickX >= o.x - halfW && clickX <= o.x + halfW && clickY >= o.y - halfH && clickY <= o.y + halfH;
    });

    if (clicked) {
      setSelectedId(clicked.id);
      isDraggingRef.current = true;
      dragIdRef.current = clicked.id;
      dragOffsetRef.current = { x: clickX - clicked.x, y: clickY - clicked.y };
    } else if (selectedObj) {
      handleUpdateSelected("x", Number(clickX.toFixed(1)));
      handleUpdateSelected("y", Number(clickY.toFixed(1)));
    }
  }

  function handleCanvasMouseMove(e) {
    if (!isDraggingRef.current || !dragIdRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = ((e.clientX - rect.left) / rect.width) * 100;
    const curY = ((e.clientY - rect.top) / rect.height) * 100;

    const newX = Math.max(4, Math.min(96, curX - dragOffsetRef.current.x));
    const newY = Math.max(4, Math.min(96, curY - dragOffsetRef.current.y));

    setObjects((prev) =>
      prev.map((o) => (o.id === dragIdRef.current ? { ...o, x: Number(newX.toFixed(1)), y: Number(newY.toFixed(1)) } : o))
    );
  }

  function handleCanvasMouseUp() {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      dragIdRef.current = null;
      onUpdateEnvironment({ ...environment, objects });
    }
  }

  return (
    <div className="annotatorContainer">
      <div className="annotatorCanvasWrapper">
        <div className="annotatorCanvasTop">
          <div>
            <b>{environment.name.toUpperCase()}</b>
            <span>Drag elements to reposition · {objects.length} Spatial Elements</span>
          </div>
          <div className="annotatorTopControls">
            {environment.image_url && (
              <div className="miniOpacity">
                <Eye size={12} />
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={blueprintOpacity}
                  onChange={(e) => setBlueprintOpacity(Number(e.target.value))}
                />
              </div>
            )}
            <button className="primaryBtn small" onClick={() => setTab("simulator")}>
              <Compass size={14} />
              <span>Launch Simulator</span>
            </button>
          </div>
        </div>

        <div
          className="annotatorCanvas"
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {environment.image_url && (
            <img
              src={environment.image_url}
              alt="Blueprint"
              className="canvasBlueprintBg"
              style={{ opacity: blueprintOpacity / 100 }}
            />
          )}

          {showGrid && <div className="gridOverlay" />}

          {objects.map((obj) => {
            const isSelected = obj.id === selectedId;
            return (
              <div
                key={obj.id}
                className={`annotatorObject ${obj.kind} ${isSelected ? "selected" : ""}`}
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  width: `${obj.w || 14}%`,
                  height: `${obj.h || 10}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(obj.id);
                }}
              >
                <div className="annotatorObjHead">
                  <span>{obj.kind?.toUpperCase()}</span>
                </div>
                {showLabels && <b className="annotatorObjTitle">{obj.name}</b>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="annotatorSidebar">
        <div className="sideSection">
          <h4>QUICK ADD PALETTE</h4>
          <div className="quickAddGrid">
            <button className="quickToolBtn" onClick={() => handleAddObject("entrance")}>
              <DoorOpen size={13} className="iconGreen" />
              <span>+ Entrance</span>
            </button>
            <button className="quickToolBtn" onClick={() => handleAddObject("exit")}>
              <ShieldAlert size={13} className="iconRed" />
              <span>+ Exit</span>
            </button>
            <button className="quickToolBtn" onClick={() => handleAddObject("service")}>
              <Building2 size={13} className="iconAmber" />
              <span>+ Counter</span>
            </button>
            <button className="quickToolBtn" onClick={() => handleAddObject("room")}>
              <LayoutGrid size={13} className="iconPurple" />
              <span>+ Room</span>
            </button>
            <button className="quickToolBtn" onClick={() => handleAddObject("corridor")}>
              <Compass size={13} className="iconCyan" />
              <span>+ Corridor</span>
            </button>
            <button className="quickToolBtn" onClick={() => handleAddObject("obstacle")}>
              <ShieldAlert size={13} className="iconMuted" />
              <span>+ Obstacle</span>
            </button>
          </div>
        </div>

        {selectedObj ? (
          <div className="sideSection">
            <div className="selectedHead">
              <h4>INSPECT ELEMENT</h4>
              <button
                className="deleteBtn"
                onClick={() => handleDeleteObject(selectedObj.id)}
                title="Remove object"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="formGroup">
              <label>NAME</label>
              <input
                type="text"
                value={selectedObj.name}
                onChange={(e) => handleUpdateSelected("name", e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label>ELEMENT TYPE</label>
              <select
                value={selectedObj.kind}
                onChange={(e) => handleUpdateSelected("kind", e.target.value)}
              >
                <option value="entrance">Entrance Gate</option>
                <option value="exit">Emergency Fire Exit</option>
                <option value="service">Service Desk / Counter</option>
                <option value="room">Waiting / Seating Area</option>
                <option value="critical">Emergency / Critical Care</option>
                <option value="corridor">Circulation Corridor</option>
                <option value="obstacle">Barrier / Structural Pillar</option>
              </select>
            </div>

            <div className="coordRow">
              <div>
                <label>X (%)</label>
                <input
                  type="number"
                  value={selectedObj.x}
                  onChange={(e) => handleUpdateSelected("x", Number(e.target.value))}
                />
              </div>
              <div>
                <label>Y (%)</label>
                <input
                  type="number"
                  value={selectedObj.y}
                  onChange={(e) => handleUpdateSelected("y", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="coordRow">
              <div>
                <label>WIDTH (%)</label>
                <input
                  type="number"
                  value={selectedObj.w || 14}
                  onChange={(e) => handleUpdateSelected("w", Number(e.target.value))}
                />
              </div>
              <div>
                <label>HEIGHT (%)</label>
                <input
                  type="number"
                  value={selectedObj.h || 10}
                  onChange={(e) => handleUpdateSelected("h", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="formGroup">
              <label>CAPACITY (USERS)</label>
              <input
                type="number"
                value={selectedObj.capacity || 50}
                onChange={(e) => handleUpdateSelected("capacity", Number(e.target.value))}
              />
            </div>

            <div className="formGroup">
              <label>ACCESSIBILITY PRIORITY</label>
              <select
                value={selectedObj.accessibility_priority || "medium"}
                onChange={(e) => handleUpdateSelected("accessibility_priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="toggleRow">
              <div>
                <b>Movable What-If Object</b>
                <span>Can be relocated in simulations</span>
              </div>
              <input
                type="checkbox"
                checked={selectedObj.movable !== false}
                onChange={(e) => handleUpdateSelected("movable", e.target.checked)}
              />
            </div>
          </div>
        ) : (
          <div className="inspectorEmpty">
            <Move size={24} className="iconMuted" />
            <p>Select any spatial element to adjust properties.</p>
          </div>
        )}
      </div>
    </div>
  );
}
