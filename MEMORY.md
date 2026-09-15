# FUTUREVIEW Personal — Durable Memory

- This repository is the personal FUTUREVIEW product, separate from any group implementation.
- The product is an interactive 2D indoor spatial-simulation playground; simulation is the primary experience.
- Current working code is a static hospital-lobby occupancy-grid/A* prototype, not the final domain architecture.
- The hospital fixture now enters the system through a loader/validation boundary and becomes a generic spatial world before occupancy-grid/A* systems consume it; keep fixture semantics out of domain classes.
- AI is future-only and must produce structured intent for deterministic application.
- EVENTGUARD/perception is future optional input work, not a present dependency.
- Results must not claim real-world, safety, or accessibility certainty without explicit validation.
