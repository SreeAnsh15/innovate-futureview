# FUTUREVIEW Personal — Product Requirements

## Problem

Testing an indoor layout change in the real world is costly and disruptive. People need a simple way to explore how a change affects movement before making it.

## Product vision

FUTUREVIEW Personal is an interactive 2D spatial-simulation playground for indoor environments. Its primary experience is watching a space change and understanding what happens to the people moving through it.

## Target experience and core loop

Create a space, place people and objects, make a change, run the simulation, watch the outcome, then understand the effect. The spatial scene—not a dashboard—is the center of the product.

## V1 scope

- Indoor rooms, walls, doors, entrances/exits, objects, and zones.
- Visible Visitor, Wheelchair User, and Staff agents with destinations.
- Deterministic A* navigation, time-based movement, basic density effects, bottlenecks, and practical queues.
- Mutations: move/add/remove object, open/close door, change agent count, and change destination.
- Baseline-versus-scenario comparison and progressive-disclosure results: plain-language outcome first, then Why/Details and metrics.

## Non-goals

V1 excludes natural-language control, 3D, AR/VR, BIM/IFC, blueprint/perception ingestion, live sensors/CCTV, authentication, collaboration, advanced optimisation, and production-scale infrastructure. EVENTGUARD is not a V1 dependency.

## Future scope

AI may translate human language into structured intent, which is then deterministically applied and simulated. Blueprint/perception ingestion, persistence/sharing, immersive views, and richer analysis remain later work.

## Product principles

- Simulation verifies changes; people make decisions.
- Keep the experience playful and approachable, while results remain explicit about their assumptions.
- Prefer deterministic, inspectable behavior to unexplained AI behavior.
- Reveal analytical detail only when it helps answer a user question.

## Success criteria

A user can build a small indoor scene, observe agents reaching destinations, make a supported change, rerun it reproducibly, and understand a clear baseline/scenario difference without needing an analytics dashboard.
