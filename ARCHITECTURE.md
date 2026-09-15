# FUTUREVIEW Personal — Architecture

## Intended system

```text
Frontend → API → domain/simulation services → spatial world
                                      ├→ agents/navigation
                                      ├→ time-based simulation
                                      ├→ scenario engine
                                      └→ results
```

The simulation engine must run independently of the web UI. The UI renders and edits supported state through the API; it does not own movement, routing, or scenario rules.

## Domain boundaries

- **Spatial world:** a generic, versionable indoor world of rooms, walls, doors, entrances, exits, objects, and zones.
- **Navigation:** derives traversability from the world and supplies deterministic paths. The current occupancy-grid/A* prototype is a useful implementation seed, not the domain model.
- **Agents:** Visitor, Wheelchair User, and Staff have a location, destination, movement properties, and supported constraints.
- **Simulation:** advances a world/agent state over time; movement, density effects, bottlenecks, and queues are explicit simulation behavior.
- **Scenario engine:** preserves a baseline and creates immutable-or-versioned alternatives by applying typed mutations.
- **Results:** translates telemetry into a human-readable outcome, Why/Details, and deeper metrics.

## Spatial and simulation model

Spatial geometry and semantic objects must share stable identifiers. Doors have an open/closed state; objects have footprints; zones can describe purpose or rules. Navigation is regenerated or invalidated when a relevant mutation occurs. Simulation outputs should include reproducible inputs, state/telemetry, and result summaries.

Metrics are prototype-level analysis, not scientific, legal, or safety validation unless a method is explicitly validated.

## Frontend/API boundary

The frontend requests world edits, simulation runs, scenario comparisons, and result data through a defined API. It may animate returned time-state data but must not independently calculate authoritative routes or outcomes.

## Future boundaries

AI is a future adapter: `human language → structured intent → deterministic application → simulation`. It never receives arbitrary mutation authority. Perception/blueprint import is also future work behind an input/provider boundary; `perception-engine/` is not currently connected or required.

## Architectural principles

Keep the world generic, scenarios explicit, execution deterministic, and domain logic independent of rendering. Add abstractions only when the supported product behavior requires them.
