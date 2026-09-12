"""A* pathfinding over the hospital occupancy grid with agent personas."""

from __future__ import annotations

import heapq
import math
from dataclasses import dataclass
from typing import Iterable

try:
    from .grid import OccupancyGrid, load_baseline
except ImportError:  # python simulation/pathfinder.py
    from grid import OccupancyGrid, load_baseline

PERSONAS: dict[str, dict[str, float]] = {
    "normal": {"speed": 1.2, "clearance": 0.0},
    "elderly": {"speed": 0.7, "clearance": 0.0},
    "wheelchair": {"speed": 1.2, "clearance": 1.2},
}

# 8-connected moves: (dgx, dgz, cost_scale)
_NEIGHBORS: tuple[tuple[int, int, float], ...] = (
    (1, 0, 1.0),
    (-1, 0, 1.0),
    (0, 1, 1.0),
    (0, -1, 1.0),
    (1, 1, math.sqrt(2.0)),
    (1, -1, math.sqrt(2.0)),
    (-1, 1, math.sqrt(2.0)),
    (-1, -1, math.sqrt(2.0)),
)


@dataclass
class PathResult:
    persona: str
    distance_m: float
    time_s: float
    path: list[tuple[float, float]]

    def as_metrics(self) -> dict[str, object]:
        return {
            "persona": self.persona,
            "distance_m": self.distance_m,
            "time_s": self.time_s,
            "path": self.path,
        }


def _astar(
    grid: OccupancyGrid, start: tuple[int, int], goal: tuple[int, int]
) -> list[tuple[int, int]]:
    start_g, goal_g = start, goal
    if start_g == goal_g:
        return [start_g]

    def heuristic(node: tuple[int, int]) -> float:
        dx = node[0] - goal_g[0]
        dz = node[1] - goal_g[1]
        return math.hypot(dx, dz) * grid.resolution

    open_heap: list[tuple[float, int, tuple[int, int]]] = []
    heapq.heappush(open_heap, (heuristic(start_g), 0, start_g))
    came_from: dict[tuple[int, int], tuple[int, int]] = {}
    g_score: dict[tuple[int, int], float] = {start_g: 0.0}
    closed: set[tuple[int, int]] = set()
    tie = 0

    while open_heap:
        _, _, current = heapq.heappop(open_heap)
        if current in closed:
            continue
        if current == goal_g:
            return _reconstruct(came_from, current)
        closed.add(current)

        cx, cz = current
        for dx, dz, scale in _NEIGHBORS:
            nx, nz = cx + dx, cz + dz
            neighbor = (nx, nz)
            if not grid.cell_walkable(nx, nz):
                continue
            # Prevent diagonal corner-cutting through blocked cells.
            if dx != 0 and dz != 0:
                if not grid.cell_walkable(cx + dx, cz) or not grid.cell_walkable(cx, cz + dz):
                    continue
            tentative = g_score[current] + scale * grid.resolution
            if tentative >= g_score.get(neighbor, float("inf")):
                continue
            came_from[neighbor] = current
            g_score[neighbor] = tentative
            tie += 1
            heapq.heappush(open_heap, (tentative + heuristic(neighbor), tie, neighbor))

    return []


def _reconstruct(
    came_from: dict[tuple[int, int], tuple[int, int]], current: tuple[int, int]
) -> list[tuple[int, int]]:
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path


def _polyline_length(points: Iterable[tuple[float, float]]) -> float:
    pts = list(points)
    if len(pts) < 2:
        return 0.0
    total = 0.0
    for (x0, z0), (x1, z1) in zip(pts, pts[1:]):
        total += math.hypot(x1 - x0, z1 - z0)
    return total


def find_path(
    persona: str = "normal",
    start_id: str = "door_main_entrance",
    goal_id: str = "desk_registration",
    occupancy: OccupancyGrid | None = None,
) -> PathResult:
    if persona not in PERSONAS:
        raise KeyError(f"Unknown persona '{persona}'. Expected one of {list(PERSONAS)}")

    spec = PERSONAS[persona]
    base = occupancy or load_baseline()
    grid = base.inflated(spec["clearance"]) if spec["clearance"] > 0.0 else base

    sx, sz = grid.find_object_position(start_id)
    gx, gz = grid.find_object_position(goal_id)
    start_cell = grid.nearest_walkable(sx, sz)
    goal_cell = grid.nearest_walkable(gx, gz)
    cells = _astar(grid, start_cell, goal_cell)

    path = [grid.grid_to_world(cx, cz) for cx, cz in cells]
    # Keep the real-world start/goal anchors when they are already walkable.
    if path:
        if grid.is_walkable(sx, sz):
            path[0] = (sx, sz)
        if grid.is_walkable(gx, gz):
            path[-1] = (gx, gz)

    distance = _polyline_length(path)
    speed = spec["speed"]
    time_s = distance / speed if speed > 0.0 and path else float("inf")
    if not path:
        distance = float("inf")
        time_s = float("inf")

    return PathResult(persona=persona, distance_m=distance, time_s=time_s, path=path)


def run_all_personas() -> list[PathResult]:
    occupancy = load_baseline()
    return [find_path(name, occupancy=occupancy) for name in PERSONAS]


def _print_result(result: PathResult) -> None:
    print(f"persona={result.persona}")
    if not result.path:
        print("  distance_m=inf")
        print("  time_s=inf")
        print("  path=[]")
        print("  status=NO_PATH")
        return
    print(f"  distance_m={result.distance_m:.3f}")
    print(f"  time_s={result.time_s:.3f}")
    print(f"  waypoints={len(result.path)}")
    coords = ", ".join(f"({x:.2f}, {z:.2f})" for x, z in result.path)
    print(f"  path=[{coords}]")


if __name__ == "__main__":
    print("FUTUREVIEW path simulation: door_main_entrance -> desk_registration")
    print(f"personas={list(PERSONAS)}")
    print()
    for result in run_all_personas():
        _print_result(result)
        print()
