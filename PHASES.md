# FUTUREVIEW Personal — Roadmap

| Phase | Goal and major capabilities | Depends on | Complete when |
|---|---|---|---|
| 0 — Foundation/reconnaissance | Establish actual repository state and constraints. | — | Reconnaissance recorded. |
| 1 — Spatial World | Generic indoor world: rooms, walls, doors, entrances/exits, objects, zones, stable IDs. | 0 | A validated world can represent more than the hospital fixture. |
| 2 — Interactive Space Editor | Create/edit the supported world visually. | 1 | Users can make valid edits without editing JSON. |
| 3 — People & Navigation | Visitor, Wheelchair User, Staff, destinations, deterministic A* paths. | 1–2 | Agent routes update correctly after supported edits. |
| 4 — Time-Based Simulation | Tick-based visible movement, basic density effects, bottlenecks, practical queues. | 3 | Reproducible runs generate observable time-state outcomes. |
| 5 — What-If / Counterfactual Engine | Typed mutations, baseline/scenario versions, comparison. | 1–4 | A scenario never overwrites its baseline and comparisons are repeatable. |
| 6 — Results & Explanation | Plain-language outcomes, Why/Details, progressive metrics. | 4–5 | A user can understand a result without dashboard overload. |
| 7 — AI Layer | Structured-intent adapter with deterministic application. | 5–6 | AI input cannot bypass supported mutation validation. |
| 8 — Blueprint Import | Import/provider boundary for external spatial inputs. | 1 | Imported data becomes a validated spatial world; perception remains optional. |
| 9 — Persistence & Sharing | Save worlds/scenarios and enable deliberate sharing. | 5–6 | Versioned work survives restart with clear ownership/history. |
| 10 — Polish & Deployment | Reliability, accessibility, onboarding, packaging, deployment. | Relevant prior phases | The chosen V1 path is stable and usable end-to-end. |
