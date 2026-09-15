"""2D occupancy grid derived from a validated spatial world."""

from __future__ import annotations

import math
from pathlib import Path
from typing import Any

try:
    from .domain import SpatialObject, SpatialWorld, Wall
    from .layout_loader import load_world
except ImportError:  # python simulation/grid.py
    from domain import SpatialObject, SpatialWorld, Wall
    from layout_loader import load_world

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


def _spatial_object_aabb(obj: SpatialObject) -> tuple[float, float, float, float]:
    """Return an object's footprint without exposing fixture dictionaries."""

    width = obj.dimensions.width
    depth = obj.dimensions.depth
    rotation = obj.rotation_y % 360.0
    extent_x, extent_z = (depth, width) if 45.0 <= rotation < 135.0 or 225.0 <= rotation < 315.0 else (width, depth)
    return (
        obj.position.x - extent_x / 2.0,
        obj.position.z - extent_z / 2.0,
        obj.position.x + extent_x / 2.0,
        obj.position.z + extent_z / 2.0,
    )


def _navigation_compatibility_layout(world: SpatialWorld) -> dict[str, Any]:
    """Expose the prototype metadata shape needed by existing metrics only.

    Occupancy rasterisation and ID lookup use ``SpatialWorld`` directly.  This
    retained view keeps the Phase 0 hospital metrics/scenario code stable until
    those prototype systems are made generic in a later phase.
    """

    service_points: list[dict[str, Any]] = []
    obstacles: list[dict[str, Any]] = []
    for obj in world.objects:
        item = {
            "id": obj.id,
            "type": obj.object_type,
            "position": obj.position.model_dump(),
            "dimensions": obj.dimensions.model_dump(),
            "rotation_y": obj.rotation_y,
            "walkable": not obj.blocking,
            **obj.attributes,
        }
        (service_points if obj.attributes.get("source_collection") == "service_points" else obstacles).append(item)

    doors = {door.id: door for door in world.doors}
    access_points = []
    for access_point in (*world.entrances, *world.exits):
        door = doors.get(access_point.door_id or "")
        access_points.append(
            {
                "id": access_point.id,
                "type": access_point.semantic_type,
                "position": access_point.position.model_dump(),
                "width": door.width if door else 1.0,
                **access_point.attributes,
            }
        )
    return {
        "dimensions": world.dimensions.model_dump(),
        "grid_resolution": world.attributes.get("grid_resolution", 0.5),
        "service_points": service_points,
        "obstacles": obstacles,
        "access_points": access_points,
        "default_decision_weights": world.attributes.get("default_decision_weights", {}),
    }


class OccupancyGrid:
    """Binary occupancy map: 0 walkable, 1 blocked."""

    def __init__(self, world: SpatialWorld) -> None:
        """Rasterise a validated world into a derived navigation representation."""

        if not isinstance(world, SpatialWorld):
            raise TypeError("OccupancyGrid requires a validated SpatialWorld")
        self.world = world
        self.layout = _navigation_compatibility_layout(self.world)
        self.width_m = self.world.dimensions.width
        self.depth_m = self.world.dimensions.depth
        self.resolution = float(self.world.attributes.get("grid_resolution", 0.5))
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

        # Carve openings for the world's semantic access points.
        doors = {door.id: door for door in self.world.doors}
        for access_point in (*self.world.entrances, *self.world.exits):
            door = doors.get(access_point.door_id or "")
            if door and door.blocking_when_closed and not door.is_open:
                continue
            half = (door.width if door else 1.0) / 2.0
            x, z = access_point.position.x, access_point.position.z
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

    def _rasterize(self) -> None:
        self._mark_perimeter()
        for wall in self.world.walls:
            if wall.blocking:
                self._mark_wall(wall)
        for obj in self.world.objects:
            if obj.blocking:
                self._mark_aabb(*_spatial_object_aabb(obj))

    def _mark_wall(self, wall: Wall) -> None:
        """Mark every cell touched by a zero-thickness blocking wall segment."""

        dx = wall.end.x - wall.start.x
        dz = wall.end.z - wall.start.z
        steps = max(1, math.ceil(math.hypot(dx, dz) / (self.resolution / 2.0)))
        for step in range(steps + 1):
            fraction = step / steps
            gx, gz = self.world_to_grid(
                wall.start.x + dx * fraction,
                wall.start.z + dz * fraction,
            )
            self.grid[gz][gx] = 1

    def inflated(self, clearance_m: float) -> OccupancyGrid:
        """Copy of this grid with obstacles expanded by ``clearance_m``."""
        clone = OccupancyGrid.__new__(OccupancyGrid)
        clone.world = self.world
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
        for obj in self.world.objects:
            if obj.id == object_id:
                return obj.position.x, obj.position.z
        for access_point in (*self.world.entrances, *self.world.exits):
            if access_point.id == object_id:
                return access_point.position.x, access_point.position.z
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
    return OccupancyGrid(load_world(layout_path))


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
