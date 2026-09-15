import unittest
from pathlib import Path

from pydantic import ValidationError

from simulation.domain import (
    AccessPoint,
    Bounds,
    Dimensions,
    Door,
    Position,
    Room,
    SpatialObject,
    SpatialWorld,
    Wall,
    Zone,
)
from simulation.layout_loader import load_world, parse_layout


class SpatialDomainTests(unittest.TestCase):
    def test_generic_world_accepts_rooms_walls_doors_objects_zones_and_access_points(self) -> None:
        world = SpatialWorld(
            id="studio",
            name="Open Studio",
            dimensions=Dimensions(width=12, depth=8, height=3),
            rooms=[Room(id="main", name="Main", bounds=Bounds(min_x=0, min_z=0, max_x=12, max_z=8))],
            walls=[Wall(id="divider", start=Position(x=6, z=0), end=Position(x=6, z=2))],
            doors=[Door(id="door-main", position=Position(x=6, z=0), width=1.2)],
            objects=[
                SpatialObject(
                    id="table-1",
                    type="table",
                    position=Position(x=3, z=3),
                    dimensions=Dimensions(width=1.5, depth=0.8, height=0.7),
                )
            ],
            zones=[
                Zone(
                    id="waiting",
                    name="Waiting area",
                    bounds=Bounds(min_x=8, min_z=1, max_x=11, max_z=4),
                    purpose="waiting",
                )
            ],
            entrances=[
                AccessPoint(
                    id="entry-main",
                    position=Position(x=6, z=0),
                    semantic_type="public entrance",
                    door_id="door-main",
                )
            ],
        )

        self.assertEqual(world.objects[0].object_type, "table")
        self.assertTrue(world.walls[0].blocking)
        self.assertEqual(world.zones[0].purpose, "waiting")

    def test_invalid_geometry_is_rejected_at_the_domain_boundary(self) -> None:
        with self.assertRaises(ValidationError):
            Dimensions(width=0, depth=1)
        with self.assertRaises(ValidationError):
            Bounds(min_x=2, min_z=0, max_x=1, max_z=1)
        with self.assertRaises(ValidationError):
            Wall(id="flat", start=Position(x=1, z=1), end=Position(x=1, z=1))

    def test_world_rejects_duplicate_ids_out_of_bounds_elements_and_unknown_door_references(self) -> None:
        base = {"id": "world", "name": "World", "dimensions": Dimensions(width=5, depth=5)}
        with self.assertRaises(ValidationError):
            SpatialWorld(
                **base,
                doors=[Door(id="shared", position=Position(x=1, z=0), width=1)],
                exits=[AccessPoint(id="shared", position=Position(x=1, z=0), semantic_type="exit")],
            )
        with self.assertRaises(ValidationError):
            SpatialWorld(
                **base,
                objects=[
                    SpatialObject(
                        id="outside",
                        type="chair",
                        position=Position(x=6, z=1),
                        dimensions=Dimensions(width=1, depth=1),
                    )
                ],
            )
        with self.assertRaises(ValidationError):
            SpatialWorld(
                **base,
                entrances=[
                    AccessPoint(
                        id="entry",
                        position=Position(x=1, z=0),
                        semantic_type="entrance",
                        door_id="not-a-door",
                    )
                ],
            )

    def test_existing_hospital_fixture_loads_into_the_generic_world(self) -> None:
        fixture = Path(__file__).resolve().parents[1] / "docs" / "baseline_hospital.json"
        world = load_world(fixture)

        self.assertEqual(world.id, "hospital_lobby_01")
        self.assertEqual(world.dimensions.width, 20.0)
        self.assertEqual({obj.id for obj in world.objects}, {"desk_registration", "pharmacy_pickup", "seating_zone_left", "seating_zone_right", "pillar_central_left"})
        self.assertTrue(next(obj for obj in world.objects if obj.id == "desk_registration").blocking)
        self.assertEqual([entry.id for entry in world.entrances], ["door_main_entrance"])
        self.assertEqual({exit.id for exit in world.exits}, {"door_emergency_exit", "door_inpatient_corridor"})

    def test_loader_rejects_invalid_raw_spatial_data(self) -> None:
        with self.assertRaises(ValidationError):
            parse_layout(
                {
                    "venue_id": "invalid",
                    "name": "Invalid layout",
                    "dimensions": {"width": 10, "depth": 10},
                    "grid_resolution": 0,
                }
            )
        with self.assertRaises(ValidationError):
            parse_layout(
                {
                    "venue_id": "invalid",
                    "name": "Invalid layout",
                    "dimensions": {"width": 10, "depth": 10},
                    "obstacles": [
                        {
                            "id": "outside",
                            "type": "chair",
                            "position": {"x": 11, "z": 1},
                            "dimensions": {"width": 1, "depth": 1},
                        }
                    ],
                }
            )


if __name__ == "__main__":
    unittest.main()
