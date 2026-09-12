"""Layout quality metrics derived from occupancy and persona paths."""

from __future__ import annotations

import math
from typing import Any

try:
    from .grid import OccupancyGrid, _layout_aabb
    from .pathfinder import PERSONAS, PathResult, find_path, run_all_personas
except ImportError:  # python simulation/metrics.py
    from grid import OccupancyGrid, _layout_aabb
    from pathfinder import PERSONAS, PathResult, find_path, run_all_personas

PERSONA_DISTANCE_WEIGHTS = {
    "normal": 1.0 / 3.0,
    "elderly": 1.0 / 3.0,
    "wheelchair": 1.0 / 3.0,
}

WHEELCHAIR_CLEARANCE_M = 1.2
# Distances at/under GOOD map to 100; at/over BAD map to 0.
WALK_GOOD_M, WALK_BAD_M = 5.0, 20.0
EVAC_GOOD_M, EVAC_BAD_M = 4.0, 22.0
WAITING_ZONE_IDS = ("seating_zone_left", "seating_zone_right")


def _is_finite(value: float) -> bool:
    return math.isfinite(value)


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def _shorter_is_better_score(distance_m: float, good_m: float, bad_m: float) -> float:
    if not _is_finite(distance_m):
        return 0.0
    span = max(bad_m - good_m, 1e-6)
    return _clamp(100.0 * (1.0 - (distance_m - good_m) / span))


def _polyline_cells(
    grid: OccupancyGrid, path: list[tuple[float, float]]
) -> list[tuple[int, int]]:
    cells: list[tuple[int, int]] = []
    seen: set[tuple[int, int]] = set()
    for x, z in path:
        cell = grid.world_to_grid(x, z)
        if cell not in seen:
            seen.add(cell)
            cells.append(cell)
    return cells


def _cell_clearance_m(grid: OccupancyGrid, gx: int, gz: int) -> float:
    """Minimum distance from a cell center to any occupied cell AABB."""
    cx, cz = grid.grid_to_world(gx, gz)
    best = float("inf")
    for bz in range(grid.rows):
        for bx in range(grid.cols):
            if grid.grid[bz][bx] == 0:
                continue
            min_x = bx * grid.resolution
            max_x = (bx + 1) * grid.resolution
            min_z = bz * grid.resolution
            max_z = (bz + 1) * grid.resolution
            dx = 0.0 if min_x <= cx <= max_x else min(abs(cx - min_x), abs(cx - max_x))
            dz = 0.0 if min_z <= cz <= max_z else min(abs(cz - min_z), abs(cz - max_z))
            best = min(best, math.hypot(dx, dz))
            if best == 0.0:
                return 0.0
    return best


def average_walking_distance(
    paths: dict[str, PathResult],
    weights: dict[str, float] | None = None,
) -> float:
    """Weighted mean entrance→desk walking distance across personas."""
    weights = weights or PERSONA_DISTANCE_WEIGHTS
    total_w = 0.0
    total = 0.0
    for persona, result in paths.items():
        weight = float(weights.get(persona, 0.0))
        if weight <= 0.0:
            continue
        if not _is_finite(result.distance_m):
            return float("inf")
        total += weight * result.distance_m
        total_w += weight
    if total_w <= 0.0:
        return float("inf")
    return total / total_w


def congestion_index(grid: OccupancyGrid, paths: dict[str, PathResult]) -> float:
    """Hotspot density from overlapping routes and narrow clearance squeezes (0–100, worse is higher)."""
    visits = [[0 for _ in range(grid.cols)] for _ in range(grid.rows)]
    path_cells: list[tuple[int, int]] = []
    for result in paths.values():
        for cell in _polyline_cells(grid, result.path):
            gx, gz = cell
            visits[gz][gx] += 1
            path_cells.append(cell)

    if not path_cells:
        return 100.0

    unique = {(gx, gz) for gx, gz in path_cells}
    overlap_cells = sum(1 for gx, gz in unique if visits[gz][gx] >= 2)
    peak = max(visits[gz][gx] for gx, gz in unique)
    overlap_ratio = overlap_cells / max(len(unique), 1)
    peak_ratio = (peak - 1) / max(len(paths) - 1, 1)

    squeeze_scores: list[float] = []
    for gx, gz in unique:
        clearance = _cell_clearance_m(grid, gx, gz)
        if clearance < WHEELCHAIR_CLEARANCE_M:
            squeeze_scores.append(
                1.0 - (clearance / WHEELCHAIR_CLEARANCE_M)
            )
    squeeze_ratio = (
        sum(squeeze_scores) / len(unique) if squeeze_scores else 0.0
    )

    raw = 100.0 * (0.45 * overlap_ratio + 0.25 * peak_ratio + 0.30 * squeeze_ratio)
    return _clamp(raw)


def accessibility_index(grid: OccupancyGrid, paths: dict[str, PathResult]) -> float:
    """Wheelchair route quality: continuous ≥1.2 m clearance and limited detour (0–100)."""
    wheelchair = paths.get("wheelchair")
    if wheelchair is None or not wheelchair.path or not _is_finite(wheelchair.distance_m):
        return 0.0

    clearances = [
        _cell_clearance_m(grid, gx, gz)
        for gx, gz in _polyline_cells(grid, wheelchair.path)
    ]
    if not clearances:
        return 0.0

    min_clearance = min(clearances)
    if min_clearance + 1e-6 < WHEELCHAIR_CLEARANCE_M:
        clearance_score = 100.0 * (min_clearance / WHEELCHAIR_CLEARANCE_M)
    else:
        # Reward extra remaining width above the 1.2 m floor, capped.
        extra = min(min_clearance - WHEELCHAIR_CLEARANCE_M, 1.2)
        clearance_score = 85.0 + 15.0 * (extra / 1.2)

    normal = paths.get("normal")
    if normal is not None and _is_finite(normal.distance_m) and normal.distance_m > 1e-6:
        detour = max(wheelchair.distance_m / normal.distance_m, 1.0)
        # 1.0× identical length → 100; 2.0× detour → 0.
        detour_score = _clamp(100.0 * (2.0 - detour))
    else:
        detour_score = 100.0 if _is_finite(wheelchair.distance_m) else 0.0

    return _clamp(0.75 * clearance_score + 0.25 * detour_score)


def _aabbs_overlap(
    a: tuple[float, float, float, float], b: tuple[float, float, float, float]
) -> bool:
    return a[0] < b[2] and a[2] > b[0] and a[1] < b[3] and a[3] > b[1]


def _door_keep_clear_aabb(grid: OccupancyGrid, door: dict[str, Any]) -> tuple[float, float, float, float]:
    """Floor rectangle that must stay free in front of a door."""
    pos = door["position"]
    x, z = float(pos["x"]), float(pos["z"])
    half = float(door.get("width", 1.0)) / 2.0
    depth = 1.5
    gx, gz = grid.world_to_grid(x, z)
    if gx == 0 or x <= grid.resolution:
        return (0.0, z - half, depth, z + half)
    if gx == grid.cols - 1 or x >= grid.width_m - grid.resolution:
        return (grid.width_m - depth, z - half, grid.width_m, z + half)
    if gz == 0 or z <= grid.resolution:
        return (x - half, 0.0, x + half, depth)
    return (x - half, grid.depth_m - depth, x + half, grid.depth_m)


def _emergency_exit_obstructed(grid: OccupancyGrid) -> bool:
    door = next(
        (
            item
            for item in grid.layout.get("access_points", [])
            if item.get("id") == "door_emergency_exit"
        ),
        None,
    )
    if door is None:
        return True
    keep_clear = _door_keep_clear_aabb(grid, door)
    blockers = list(grid.layout.get("service_points", [])) + list(
        grid.layout.get("obstacles", [])
    )
    for obj in blockers:
        if obj.get("walkable") is True:
            continue
        if _aabbs_overlap(keep_clear, _layout_aabb(obj)):
            return True
    ex, ez = grid.find_object_position("door_emergency_exit")
    return not grid.is_walkable(ex, ez)


def evacuation_distance(grid: OccupancyGrid) -> dict[str, Any]:
    """Path distances from the desk and waiting clusters to the emergency exit."""
    exit_id = "door_emergency_exit"
    sources = ("desk_registration",) + WAITING_ZONE_IDS
    by_source: dict[str, float] = {}
    for source_id in sources:
        result = find_path(
            persona="normal",
            start_id=source_id,
            goal_id=exit_id,
            occupancy=grid,
        )
        by_source[source_id] = result.distance_m

    finite = [d for d in by_source.values() if _is_finite(d)]
    average = sum(finite) / len(finite) if finite else float("inf")
    if len(finite) < len(by_source):
        average = float("inf")

    exit_clear = not _emergency_exit_obstructed(grid) and all(
        _is_finite(d) for d in by_source.values()
    )
    return {
        "by_source_m": by_source,
        "average_m": average,
        "emergency_exit_clear": exit_clear,
    }


def overall_weighted_score(
    *,
    walking_distance_m: float,
    congestion: float,
    accessibility: float,
    evacuation_m: float,
    emergency_exit_clear: bool,
    weights: dict[str, float],
) -> float:
    """Combine the four decision axes into a 0–100 score (higher is better)."""
    distance_score = _shorter_is_better_score(walking_distance_m, WALK_GOOD_M, WALK_BAD_M)
    safety_score = _shorter_is_better_score(evacuation_m, EVAC_GOOD_M, EVAC_BAD_M)
    if not emergency_exit_clear:
        safety_score = 0.0
    congestion_score = _clamp(100.0 - congestion)

    w_safety = float(weights.get("emergency_safety", 0.30))
    w_access = float(weights.get("accessibility", 0.30))
    w_cong = float(weights.get("congestion", 0.20))
    w_walk = float(weights.get("walking_distance", 0.20))
    weight_sum = w_safety + w_access + w_cong + w_walk
    if weight_sum <= 0.0:
        weight_sum = 1.0

    raw = (
        w_safety * safety_score
        + w_access * accessibility
        + w_cong * congestion_score
        + w_walk * distance_score
    )
    return _clamp(raw / weight_sum)


def compute_metrics(grid: OccupancyGrid) -> dict[str, Any]:
    """Run persona pathfinding and return the full metric bundle for a layout."""
    persona_results = {
        result.persona: result for result in run_all_personas(occupancy=grid)
    }
    walk_m = average_walking_distance(persona_results)
    congestion = congestion_index(grid, persona_results)
    access = accessibility_index(grid, persona_results)
    evac = evacuation_distance(grid)
    weights = grid.layout.get("default_decision_weights", {})
    overall = overall_weighted_score(
        walking_distance_m=walk_m,
        congestion=congestion,
        accessibility=access,
        evacuation_m=float(evac["average_m"]),
        emergency_exit_clear=bool(evac["emergency_exit_clear"]),
        weights=weights,
    )
    return {
        "average_walking_distance_m": walk_m,
        "congestion_index": congestion,
        "accessibility_index": access,
        "evacuation_distance_m": evac["average_m"],
        "evacuation": evac,
        "overall_score": overall,
        "persona_distances_m": {
            name: persona_results[name].distance_m for name in PERSONAS if name in persona_results
        },
    }
