# FUTUREVIEW

> "Before you physically change a space, FUTUREVIEW lets you change it virtually and see how people will experience that change."

## What Is FUTUREVIEW?
FUTUREVIEW is an AI-powered spatial decision-support system. Instead of relying on static 2D floor plans, expert guesswork, or slowly discovering flow issues after construction, it allows organizations to modify real-world layouts virtually and simulate the outcomes before spending resources.

## What It Does
- **Environment Understanding:** Parses floor plans and spatial data to identify walkways, doors, corridors, rooms, and key service points.
- **What-If Modification:** Enables users to move assets, widen corridors, or add entrances/exits through interactive controls or natural language.
- **Agent-Based Pedestrian Simulation:** Models different personas (normal visitors, wheelchair users, elderly, priority/emergency staff) each with unique walking speeds and route constraints.
- **Impact Analysis & Scoring:** Calculates walking distance, bottlenecks, congestion, accessibility, and safety impacts based on organizational priorities.
- **3D and AR Experience:** Visualizes pedestrian flow paths, heatmaps, and layout alternatives in an interactive 3D and WebAR viewer.
- **Decision Support:** Generates alternative optimizations and provides a clear 'Should we do it?' recommendation.

## Repository Structure
- `frontend/` - Dashboard, what-if controls, and 3D/AR viewer.
- `backend/`  - Floorplan parsing, spatial reasoning, and AI alynsis.
- `simulation/` - Agent-based pathfinding, congestion models, and scoring.
- `docs/`      - Architecture specs, diagrams, and presentation assets.
