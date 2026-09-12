"""2D occupancy grid built from the hospital baseline layout."""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

# Types that always occupy floor area, plus any object flagged walkable=false.
BLOCKING_TYPES = {"pillar", "furniture_cluster", "counter", "service_point"}

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_LAYOUT_PATH = REPO_ROOT / "docs" / "baseline_hospital.json"


def _layout_aabb(obj: dict[str, Any]) -> tuple[float, float, float, float]:
    """Return (min_x, min_z, max_x, max_z) for an object's footprint."""
    pos = obj["position"]
    dims = obj["dimensions"]
    width = float(dims["width"])
    depth = float(dims["depth"])
    rotation = float(obj.get("rotation_y", 0.0)) % 360.0

    # 90/270° swaps the footprint axes in the XZ plane.
    if 45.0 <= rotation < 135.0 or 225.0 <= rotation < 315.0:
        extent_x, extent_z = depth, width
    else:
        extent_x, extent_z = width, depth

    cx, cz = float(pos["x"]), float(pos["z"])
    return (
        cx - extent_x / 2.0,
        cz - extent_z / 2.0,
        cx + extent_x / 2.0,
        cz + extent_z / 2.0,
    )


class OccupancyGrid:
    """Binary occupancy map: 0 walkable, 1 blocked."""

    def __init__(self, layout: dict[str, Any]) -> None:
        self.layout = layout
        dims = layout["dimensions"]
        self.width_m = float(dims["width"])
        self.depth_m = float(dims["depth"])
        self.resolution = float(layout.get("grid_resolution", 0.5))
        self.cols = int(round(self.width_m / self.resolution))
        self.rows = int(round(self.depth_m / self.resolution))
        self.grid = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        self._rasterize()

    def _in_bounds(self, gx: int, gz: int) -> bool:
        return 0 <= gx < self.cols and 0 <= gz < self.rows

    def world_to_grid(self, x: float, z: float) -> tuple[int, int]:
        gx = int(math.floor(x / self.resolution))
        gz = int(math.floor(z / self.resolution))
        gx = min(max(gx, 0), self.cols - 1)
        gz = min(max(gz, 0), self.rows - 1)
        return gx, gz

    def grid_to_world(self, gx: int, gz: int) -> tuple[float, float]:
        x = (gx + 0.5) * self.resolution
        z = (gz + 0.5) * self.resolution
        return x, z

    def is_walkable(self, x: float, z: float) -> bool:
        if x < 0.0 or z < 0.0 or x > self.width_m or z > self.depth_m:
            return False
        gx, gz = self.world_to_grid(x, z)
        return self.grid[gz][gx] == 0

    def cell_walkable(self, gx: int, gz: int) -> bool:
        return self._in_bounds(gx, gz) and self.grid[gz][gx] == 0

    def _mark_aabb(self, min_x: float, min_z: float, max_x: float, max_z: float) -> None:
        gx0, gz0 = self.world_to_grid(min_x, min_z)
        gx1, gz1 = self.world_to_grid(max(max_x - 1e-9, min_x), max(max_z - 1e-9, min_z))
        for gz in range(gz0, gz1 + 1):
            for gx in range(gx0, gx1 + 1):
                cell_min_x = gx * self.resolution
                cell_max_x = (gx + 1) * self.resolution
                cell_min_z = gz * self.resolution
                cell_max_z = (gz + 1) * self.resolution
                overlaps = (
                    cell_min_x < max_x
                    and cell_max_x > min_x
                    and cell_min_z < max_z
                    and cell_max_z > min_z
                )
                if overlaps:
                    self.grid[gz][gx] = 1

    def _mark_perimeter(self) -> None:
        for gx in range(self.cols):
            self.grid[0][gx] = 1
            self.grid[self.rows - 1][gx] = 1
        for gz in range(self.rows):
            self.grid[gz][0] = 1
            self.grid[gz][self.cols - 1] = 1

        # Carve door openings so access points remain traversable.
        for door in self.layout.get("access_points", []):
            pos = door["position"]
            half = float(door.get("width", 1.0)) / 2.0
            x, z = float(pos["x"]), float(pos["z"])
            gx, gz = self.world_to_grid(x, z)
            on_west = gx == 0
            on_east = gx == self.cols - 1
            on_south = gz == 0
            on_north = gz == self.rows - 1

            if on_west or on_east:
                z0, z1 = z - half, z + half
                wall_gx = 0 if on_west else self.cols - 1
                for cz in range(self.rows):
                    cell_min_z = cz * self.resolution
                    cell_max_z = (cz + 1) * self.resolution
                    if cell_min_z < z1 and cell_max_z > z0:
                        self.grid[cz][wall_gx] = 0
            else:
                x0, x1 = x - half, x + half
                wall_gz = 0 if on_south or z < self.depth_m / 2.0 else self.rows - 1
                if on_north:
                    wall_gz = self.rows - 1
                if on_south:
                    wall_gz = 0
                for cx in range(self.cols):
                    cell_min_x = cx * self.resolution
                    cell_max_x = (cx + 1) * self.resolution
                    if cell_min_x < x1 and cell_max_x > x0:
                        self.grid[wall_gz][cx] = 0

    def _should_block(self, obj: dict[str, Any]) -> bool:
        if obj.get("walkable") is False:
            return True
        return obj.get("type") in BLOCKING_TYPES

    def _rasterize(self) -> None:
        self._mark_perimeter()
        for obj in self.layout.get("service_points", []):
            if self._should_block(obj):
                self._mark_aabb(*_layout_aabb(obj))
        for obj in self.layout.get("obstacles", []):
            if self._should_block(obj):
                self._mark_aabb(*_layout_aabb(obj))

    def inflated(self, clearance_m: float) -> OccupancyGrid:
        """Copy of this grid with obstacles expanded by ``clearance_m``."""
        clone = OccupancyGrid.__new__(OccupancyGrid)
        clone.layout = self.layout
        clone.width_m = self.width_m
        clone.depth_m = self.depth_m
        clone.resolution = self.resolution
        clone.cols = self.cols
        clone.rows = self.rows
        clone.grid = [row[:] for row in self.grid]
        if clearance_m <= 0.0:
            return clone

        blocked = [
            (gx, gz)
            for gz in range(self.rows)
            for gx in range(self.cols)
            if self.grid[gz][gx] == 1
        ]
        radius = clearance_m
        for gz in range(self.rows):
            for gx in range(self.cols):
                if clone.grid[gz][gx] == 1:
                    continue
                cx, cz = self.grid_to_world(gx, gz)
                for bx, bz in blocked:
                    ox, oz = self.grid_to_world(bx, bz)
                    # Distance from free-cell center to occupied-cell AABB.
                    min_x = bx * self.resolution
                    max_x = (bx + 1) * self.resolution
                    min_z = bz * self.resolution
                    max_z = (bz + 1) * self.resolution
                    dx = 0.0 if min_x <= cx <= max_x else min(abs(cx - min_x), abs(cx - max_x))
                    dz = 0.0 if min_z <= cz <= max_z else min(abs(cz - min_z), abs(cz - max_z))
                    if math.hypot(dx, dz) <= radius:
                        clone.grid[gz][gx] = 1
                        break
        return clone

    def find_object_position(self, object_id: str) -> tuple[float, float]:
        for collection in ("service_points", "access_points", "obstacles"):
            for obj in self.layout.get(collection, []):
                if obj.get("id") == object_id:
                    pos = obj["position"]
                    return float(pos["x"]), float(pos["z"])
        raise KeyError(f"Unknown layout object id: {object_id}")

    def nearest_walkable(self, x: float, z: float) -> tuple[int, int]:
        gx, gz = self.world_to_grid(x, z)
        if self.cell_walkable(gx, gz):
            return gx, gz
        best: tuple[int, int] | None = None
        best_d = float("inf")
        for cz in range(self.rows):
            for cx in range(self.cols):
                if not self.cell_walkable(cx, cz):
                    continue
                wx, wz = self.grid_to_world(cx, cz)
                d = math.hypot(wx - x, wz - z)
                if d < best_d:
                    best_d = d
                    best = (cx, cz)
        if best is None:
            raise RuntimeError("No walkable cells on occupancy grid")
        return best


_default_grid: OccupancyGrid | None = None


def load_baseline(path: str | Path | None = None) -> OccupancyGrid:
    layout_path = Path(path) if path else DEFAULT_LAYOUT_PATH
    with layout_path.open(encoding="utf-8") as handle:
        layout = json.load(handle)
    return OccupancyGrid(layout)


def _grid() -> OccupancyGrid:
    global _default_grid
    if _default_grid is None:
        _default_grid = load_baseline()
    return _default_grid


def world_to_grid(x: float, z: float) -> tuple[int, int]:
    return _grid().world_to_grid(x, z)


def grid_to_world(gx: int, gz: int) -> tuple[float, float]:
    return _grid().grid_to_world(gx, gz)


def is_walkable(x: float, z: float) -> bool:
    return _grid().is_walkable(x, z)
