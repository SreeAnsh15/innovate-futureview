"""Spatial-domain, layout-loading, occupancy, and pathfinding primitives."""

from .domain import SpatialWorld
from .grid import OccupancyGrid, grid_to_world, is_walkable, load_baseline, world_to_grid
from .layout_loader import load_world, parse_layout, world_from_legacy_layout

__all__ = [
    "OccupancyGrid",
    "SpatialWorld",
    "grid_to_world",
    "is_walkable",
    "load_baseline",
    "load_world",
    "parse_layout",
    "world_from_legacy_layout",
    "world_to_grid",
]
