# FUTUREVIEW Personal — Current State

## Actual repository state

The repository contains a Python hospital-lobby prototype plus a minimal React/TypeScript/Vite frontend. The frontend retrieves the validated baseline `SpatialWorld` from the backend and renders it as an interactive SVG spatial workspace.

### Implemented — Phase 2A + 2B

- A small React/TypeScript/Vite application with a dark application shell, header, tool rail, scene-first workspace, and an informational inspector.
- A dependency-light SVG spatial renderer whose world X/Z coordinates map directly into its viewport. It renders world boundaries, rooms, zones, walls, open/closed doors, blocking objects, entrances, and exits with semantic labels and colors.
- Pointer drag panning, wheel zooming, and a reset-view control. These are navigation interactions only; no world mutations occur in the browser.
- Loading and error states around the baseline world request, plus a local Vite API proxy for development.
- `GET /api/layout/baseline` now returns the loader-validated, domain-shaped `SpatialWorld`, rather than the raw fixture. Python remains authoritative for world validation and simulation behavior.

### Planned — Phase 2C and later

- Selection, object/room/wall/door editing, create/delete operations, validation feedback, undo/redo, and persistence remain unimplemented.
- Agents, routes, simulation playback, metrics/results, scenario versioning, and all other later roadmap phases remain unimplemented.

### Implemented — Phase 1 complete

- A generic validated spatial-domain model for worlds, rooms, walls, doors, objects, zones, and entrances/exits. It is independent of layout files, FastAPI, and frontend concerns.
- A layout-loader boundary that validates and parses the retained hospital fixture into a `SpatialWorld`; the occupancy grid is derived from that world while retaining a narrow compatibility view for prototype metrics.
- A hand-authored static hospital layout in `docs/baseline_hospital.json`.
- A 2D occupancy grid with object-footprint and wall rasterisation, perimeter access openings controlled by door state, coordinate conversion, and clearance inflation.
- Deterministic 8-direction A* pathfinding over an already-derived grid, with normal, elderly, and wheelchair profiles.
- Route-derived prototype metrics and a registration-desk baseline/proposed comparison.
- Focused Phase 1 tests covering domain construction and invalid data, fixture loading, derived-grid blocking geometry, open/closed doors, clearance, generic navigation, baseline compatibility, and existing persona routing.
- A small FastAPI app with health, baseline-layout, and desk-position simulation endpoints.

### Partial

- Personas differ only by speed and/or clearance, not full behavior.
- The scenario system moves only the registration desk.
- Congestion, accessibility, evacuation, and recommendation formulas are heuristic prototype logic.

### Scaffolded or unused

`perception-engine/` has a README and empty model/script/test folders only. It has no implementation and is not connected to the API or simulation.

### Missing

Time-based multi-agent movement, density dynamics, queues, generic world editing, scenario versioning/persistence, CI, AI integration, blueprint import, visualization/3D, database, exports, and production tooling are absent.

## Repository state

At Phase 0 inspection, branch `ansh` was ahead 1 and behind 4 relative to `origin/ansh`. `backend/main.py` and `backend/requirements.txt` were untracked. The backend requirement list is unpinned and there are no package manifests, lockfiles, scripts, environment templates, or test/CI configuration.

## Navigation integration

Phase 1 is complete: raw fixture data crosses a validated loader boundary into a generic `SpatialWorld`; `OccupancyGrid` derives blocking objects, walls, and door-controlled perimeter access from that world; deterministic A* accepts the already-derived grid and explicit semantic anchor IDs. Navigation does not load fixture files or contain hospital anchor defaults. The retained hospital metrics, scenario evaluator, and command-line demos supply their own baseline-specific anchors.

## Remaining architectural concerns

The prototype metrics and scenario evaluator still use a narrow hospital compatibility view on the derived grid, and the scenario only moves the registration desk. Their generic migration is intentionally deferred; navigation itself no longer consumes that view. Phase 2C editor interactions are the next development target.
