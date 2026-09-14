# FUTUREVIEW — “See the Consequences Before You Build the Future.”

> **FUTUREVIEW** is an AI-powered What-If Reality Simulator that predicts how people will experience physical space modifications before they are built.

```
EXISTING SPACE → WHAT-IF CHANGE → SPATIAL AI ANALYSIS → HUMAN FLOW SIMULATION → IMPACT PREDICTION → 3D / AR EXPERIENCE → BETTER DECISION
```

---

## 🌟 Key Capabilities & Architecture

### 1. 🏢 Executive Dashboard
- Comprehensive decision cockpit with key spatial metrics: **Walking Distance (m)**, **Congestion Risk Index**, **Accessibility Compliance Rating**, and **Emergency Egress Safety Score**.
- Active space overview, active what-if change summary, and one-click quick action launcher.
- One-click **Demo Mode** targeting *CityCare General Hospital*.

### 2. 🗺️ Environment Studio
- **Curated Benchmarks**: *CityCare General Hospital* (120×80m), *Metropolitan Transit Hub* (150×100m), and *Innovation Tech Campus* (100×70m).
- **Floor Plan Upload & AI Vision Parser**: Upload PNG, JPG, or PDF blueprints with automated space/door/corridor detection.
- **Interactive Spatial Annotator**: Visually place and configure entrance gates, service counters, waiting areas, critical care units, circulation corridors, and obstacle barriers.

### 3. 🎯 Spatial Editor & Multi-Agent Simulator
- **Interactive 2D Spatial Canvas**: Real-time object drag-and-drop, position coordinates, and bounding box configuration.
- **Multi-Archetype Agent Simulation**: Color-coded animated agents representing 5 distinct human archetypes:
  - 🚶 **Regular Visitor**: Standard velocity (1.35 m/s) with direct route optimization.
  - 🧓 **Elderly Visitor**: Slower velocity (0.85 m/s), sensitive to walking distance & incline.
  - ♿ **Wheelchair User**: Requires unobstructed wide aisles (>1.8m), zero stair tolerance.
  - 🚨 **Emergency Patient / First Responder**: Urgent high-speed transit (2.1 m/s) to critical care.
  - 🩺 **Staff / Clinician**: High-frequency bidirectional circulation between triage & service desks.
- **Real Congestion Heatmap**: Cell traversal accumulator generating true density-based Gaussian hotspots.
- **Layer Toggles**: Real-time toggles for Heatmap, Flow Routes, Animated Agents, Object Labels, and Spatial Grid.

### 4. ⚖️ Current vs Proposed Delta Engine
- Side-by-side metric comparison evaluating $\Delta$ changes and percentage variance for walking distance, congestion friction, barrier-free accessibility, and emergency egress safety.

### 5. 🧠 AI Spatial Reasoning Engine
- Pluggable `SpatialReasoningProvider` abstraction with deterministic `LocalSpatialReasoningProvider` and pluggable `GeminiSpatialReasoningProvider`.
- Delivers structured decision analysis: **Overall Decision Score**, **Verdict** (`RECOMMENDED`, `REVIEW`, `AVOID`), **Key Impacts**, **Positive Outcomes**, **Friction Factors**, **Affected User Demographics**, and **Alternative Architectural Suggestions**.

### 6. 🧊 3D Spatial Computing & WebXR AR
- **Three.js 3D Viewport**: Extruded architecture, 3D furniture models, animated 3D human agents with heading needles, illuminated flow ribbons, and glowing heatmap floor mesh.
- **Camera Presets**: *Isometric Perspective*, *Direct Top-Down*, and *Eye-Level Walkthrough*.
- **3D Layout Morphing**: Instant toggle between *Current Layout* and *Proposed What-If* in 3D.
- **WebXR AR Mode**: Hardware detection for WebXR `immersive-ar` with an integrated interactive AR Spatial Camera Simulator fallback.

### 7. 🧪 Scenario Laboratory & Comparison Matrix
- Save, tag, clone, and delete decision variations.
- **Side-by-Side Matrix**: Compare up to 4 scenarios across all decision criteria with automated AI winner selection.

### 8. 📄 Executive Decision Reports
- Presentation-grade decision document with executive summaries, comparative tables, AI reasoning, and printable CSS styling.
- Downloadable as formatted JSON or exportable to PDF via direct Browser Print.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend (FastAPI)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Swagger API Docs: `http://localhost:8000/docs`

### 2. Start the Frontend (Vite + React)
```powershell
cd frontend
npm install
npm run dev
```
Frontend Web Application will be live at: `http://localhost:5173`

---

## 📡 REST API Specifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and engine capabilities |
| `GET` | `/api/environments` | List all saved & preset environments |
| `GET` | `/api/environments/{id}` | Get environment layout & objects |
| `POST` | `/api/environments` | Create or update environment |
| `POST` | `/api/environments/upload` | Upload floor plan image / blueprint |
| `POST` | `/api/environments/analyze` | AI-assisted zone & door detection |
| `POST` | `/api/simulations` | Execute multi-agent simulation |
| `GET` | `/api/scenarios` | List saved scenarios for an environment |
| `POST` | `/api/scenarios` | Save a new what-if scenario |
| `DELETE` | `/api/scenarios/{id}` | Delete a saved scenario |
| `POST` | `/api/scenarios/compare` | Generate multi-scenario comparison matrix |
| `POST` | `/api/ai/analyze` | Generate structured AI spatial reasoning |
| `POST` | `/api/reports` | Compile executive decision report |
| `GET` | `/api/reports/{id}` | Retrieve report by ID |

---

## 🛡️ Data Honesty & Transparency Policy

All predictive outputs in FUTUREVIEW are clearly disclosed as:
- `[SIMULATED]`
- `[AI-ESTIMATED]`
- `[DECISION-SUPPORT ESTIMATE]`

The engine is engineered to deliver transparent, reproducible spatial calculations to empower human decision-makers rather than make false guarantees.
