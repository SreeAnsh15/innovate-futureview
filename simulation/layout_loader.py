"""Parse layout fixtures into validated spatial-domain worlds.

This module is the boundary between external layout data and the generic
spatial domain.  It intentionally owns file I/O; domain models do not.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Mapping

from pydantic import BaseModel, ConfigDict, Field

try:
    from .domain import AccessPoint, Dimensions, Door, Position, SpatialObject, SpatialWorld
except ImportError:  # python simulation/layout_loader.py
    from domain import AccessPoint, Dimensions, Door, Position, SpatialObject, SpatialWorld


class _RawLayoutModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class RawDimensions(_RawLayoutModel):
    width: float
    depth: float
    height: float = 0.0
    unit: str | None = None


class RawPlacedElement(BaseModel):
    """Fixture element with extensible fixture-specific metadata."""

    model_config = ConfigDict(extra="allow")

    id: str
    name: str | None = None
    type: str
    position: Position
    dimensions: Dimensions
    walkable: bool | None = None
    rotation_y: float = 0.0


class RawAccessPoint(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    name: str | None = None
    type: str
    position: Position
    width: float = 1.0


class RawHospitalLayout(_RawLayoutModel):
    """Schema of the retained pre-domain hospital fixture."""

    venue_id: str
    name: str
    dimensions: RawDimensions
    grid_resolution: float = Field(default=0.5, gt=0.0)
    service_points: list[RawPlacedElement] = Field(default_factory=list)
    access_points: list[RawAccessPoint] = Field(default_factory=list)
    obstacles: list[RawPlacedElement] = Field(default_factory=list)
    default_decision_weights: dict[str, float] = Field(default_factory=dict)


def load_world(path: str | Path) -> SpatialWorld:
    """Read one layout file and return its validated generic spatial world."""

    with Path(path).open(encoding="utf-8") as handle:
        return parse_layout(json.load(handle))


def parse_layout(layout: Mapping[str, Any]) -> SpatialWorld:
    """Validate retained fixture data and translate it to ``SpatialWorld``."""

    raw = RawHospitalLayout.model_validate(layout)
    objects = [
        _to_spatial_object(item, source_collection="service_points")
        for item in raw.service_points
    ] + [
        _to_spatial_object(item, source_collection="obstacles")
        for item in raw.obstacles
    ]

    doors: list[Door] = []
    entrances: list[AccessPoint] = []
    exits: list[AccessPoint] = []
    for item in raw.access_points:
        door_id = f"door:{item.id}"
        doors.append(Door(id=door_id, name=item.name, position=item.position, width=item.width))
        point = AccessPoint(
            id=item.id,
            position=item.position,
            semantic_type=item.type,
            door_id=door_id,
            attributes=dict(item.model_extra or {}),
        )
        # The fixture supplies this semantic classification; the domain does not.
        (entrances if item.type == "entrance" else exits).append(point)

    return SpatialWorld(
        id=raw.venue_id,
        name=raw.name,
        dimensions=Dimensions(
            width=raw.dimensions.width,
            depth=raw.dimensions.depth,
            height=raw.dimensions.height,
        ),
        objects=objects,
        doors=doors,
        entrances=entrances,
        exits=exits,
        attributes={
            "grid_resolution": raw.grid_resolution,
            "default_decision_weights": raw.default_decision_weights,
        },
    )


def world_from_legacy_layout(layout: Mapping[str, Any]) -> SpatialWorld:
    """Backward-compatible name for the retained fixture adapter."""

    return parse_layout(layout)


def _to_spatial_object(item: RawPlacedElement, *, source_collection: str) -> SpatialObject:
    attributes = dict(item.model_extra or {})
    attributes["source_collection"] = source_collection
    if item.name is not None:
        attributes["name"] = item.name
    return SpatialObject(
        id=item.id,
        type=item.type,
        position=item.position,
        dimensions=item.dimensions,
        blocking=item.walkable is False,
        rotation_y=item.rotation_y,
        attributes=attributes,
    )
