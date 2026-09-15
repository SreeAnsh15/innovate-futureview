"""Generic, validated indoor spatial-domain models for FUTUREVIEW.

These models describe a spatial world independently of any renderer, API,
layout file, or navigation implementation.
"""

from __future__ import annotations

import math
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class _DomainModel(BaseModel):
    """Strict base model for spatial data received at the domain boundary."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class Position(_DomainModel):
    """A point in metres in the indoor world's X/Y/Z coordinate system."""

    x: float
    y: float = 0.0
    z: float

    @field_validator("x", "y", "z")
    @classmethod
    def coordinates_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("coordinates must be finite")
        return value


class Dimensions(_DomainModel):
    """Positive axis-aligned dimensions in metres."""

    width: float
    depth: float
    height: float = 0.0

    @field_validator("width", "depth")
    @classmethod
    def footprint_dimensions_must_be_positive(cls, value: float) -> float:
        if not math.isfinite(value) or value <= 0.0:
            raise ValueError("width and depth must be finite and greater than zero")
        return value

    @field_validator("height")
    @classmethod
    def height_must_be_non_negative(cls, value: float) -> float:
        if not math.isfinite(value) or value < 0.0:
            raise ValueError("height must be finite and non-negative")
        return value


class Bounds(_DomainModel):
    """Axis-aligned room or zone bounds in the X/Z plane."""

    min_x: float
    min_z: float
    max_x: float
    max_z: float

    @field_validator("min_x", "min_z", "max_x", "max_z")
    @classmethod
    def bounds_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("bounds must be finite")
        return value

    @model_validator(mode="after")
    def bounds_must_have_area(self) -> Bounds:
        if self.max_x <= self.min_x or self.max_z <= self.min_z:
            raise ValueError("bounds must have positive width and depth")
        return self


class _IdentifiedModel(_DomainModel):
    id: str

    @field_validator("id")
    @classmethod
    def id_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("id must not be blank")
        return value


class Room(_IdentifiedModel):
    name: str
    bounds: Bounds


class Wall(_IdentifiedModel):
    """A blocking line segment. Thickness is deferred until rasterisation."""

    start: Position
    end: Position
    blocking: bool = True

    @model_validator(mode="after")
    def wall_must_have_length(self) -> Wall:
        if self.start.x == self.end.x and self.start.z == self.end.z:
            raise ValueError("wall start and end must not be the same")
        return self


class Door(_IdentifiedModel):
    name: str | None = None
    position: Position
    width: float
    is_open: bool = True
    blocking_when_closed: bool = True

    @field_validator("width")
    @classmethod
    def width_must_be_positive(cls, value: float) -> float:
        if not math.isfinite(value) or value <= 0.0:
            raise ValueError("width must be finite and greater than zero")
        return value


class SpatialObject(_IdentifiedModel):
    """An indoor object with a centred footprint and generic type."""

    object_type: str = Field(alias="type")
    position: Position
    dimensions: Dimensions
    blocking: bool = True
    rotation_y: float = 0.0
    attributes: dict[str, Any] = Field(default_factory=dict)

    @field_validator("object_type")
    @classmethod
    def object_type_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("object type must not be blank")
        return value

    @field_validator("rotation_y")
    @classmethod
    def rotation_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("rotation_y must be finite")
        return value


class Zone(_IdentifiedModel):
    name: str
    bounds: Bounds
    purpose: str | None = None


class AccessPoint(_IdentifiedModel):
    """A semantic entry or exit, optionally associated with a physical door."""

    position: Position
    semantic_type: str
    door_id: str | None = None
    attributes: dict[str, Any] = Field(default_factory=dict)

    @field_validator("semantic_type")
    @classmethod
    def semantic_type_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("semantic type must not be blank")
        return value


class SpatialWorld(_IdentifiedModel):
    """A generic, validated representation of an indoor environment."""

    name: str
    dimensions: Dimensions
    rooms: list[Room] = Field(default_factory=list)
    walls: list[Wall] = Field(default_factory=list)
    doors: list[Door] = Field(default_factory=list)
    objects: list[SpatialObject] = Field(default_factory=list)
    zones: list[Zone] = Field(default_factory=list)
    entrances: list[AccessPoint] = Field(default_factory=list)
    exits: list[AccessPoint] = Field(default_factory=list)
    attributes: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="after")
    def world_references_must_be_valid(self) -> SpatialWorld:
        collections = (
            self.rooms,
            self.walls,
            self.doors,
            self.objects,
            self.zones,
            self.entrances,
            self.exits,
        )
        ids = [item.id for collection in collections for item in collection]
        if len(ids) != len(set(ids)):
            raise ValueError("spatial element ids must be unique within a world")

        for room in self.rooms:
            self._validate_bounds(room.bounds, f"room '{room.id}'")
        for zone in self.zones:
            self._validate_bounds(zone.bounds, f"zone '{zone.id}'")
        for wall in self.walls:
            self._validate_position(wall.start, f"wall '{wall.id}' start")
            self._validate_position(wall.end, f"wall '{wall.id}' end")
        for door in self.doors:
            self._validate_position(door.position, f"door '{door.id}'")
        for obj in self.objects:
            self._validate_position(obj.position, f"object '{obj.id}'")
        for access_point in (*self.entrances, *self.exits):
            self._validate_position(access_point.position, f"access point '{access_point.id}'")
            if access_point.door_id and access_point.door_id not in {door.id for door in self.doors}:
                raise ValueError(
                    f"access point '{access_point.id}' references unknown door '{access_point.door_id}'"
                )
        return self

    def _validate_position(self, position: Position, label: str) -> None:
        if not (0.0 <= position.x <= self.dimensions.width):
            raise ValueError(f"{label} x position is outside world dimensions")
        if not (0.0 <= position.z <= self.dimensions.depth):
            raise ValueError(f"{label} z position is outside world dimensions")

    def _validate_bounds(self, bounds: Bounds, label: str) -> None:
        if (
            bounds.min_x < 0.0
            or bounds.min_z < 0.0
            or bounds.max_x > self.dimensions.width
            or bounds.max_z > self.dimensions.depth
        ):
            raise ValueError(f"{label} bounds are outside world dimensions")
