# EVENTGUARD AI — Perception & Spatial Mapping Engine

## Purpose
This engine serves as the spatial perception provider for FUTUREVIEW. It ingests video feeds and generates structured 2D/3D spatial layouts, object bounding boxes, and relative/metric depth coordinates.

## Architecture
- \models/\: Local weight cache (gitignored). Run scripts to download weights.
- \scripts/\: Environment verification, weight downloaders, and startup automation.
- \	ests/\: Unit and integration perception tests.

## Primary Contract
Output spatial JSON schema must match the \/api/perception\ payload specified in \docs/EVENTGUARD_PROJECT_SUMMARY.md\.
