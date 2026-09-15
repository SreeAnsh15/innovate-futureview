import math
import unittest

from simulation.domain import AccessPoint, Dimensions, Door, Position, SpatialObject, SpatialWorld, Wall
from simulation.grid import OccupancyGrid, load_baseline
from simulation.pathfinder import find_path, run_all_personas


def _world(*, obstacle: bool = True, wall: bool = False) -> SpatialWorld:
    return SpatialWorld(
        id="generic-studio",
        name="Generic Studio",
        dimensions=Dimensions(width=10, depth=8),
        walls=(
            [Wall(id="divider", start=Position(x=5, z=2), end=Position(x=5, z=6))]
            if wall
            else []
        ),
        objects=[
            SpatialObject(
                id="blocker",
                type="cabinet",
                position=Position(x=5, z=4),
                dimensions=Dimensions(width=1, depth=2),
                blocking=obstacle,
            )
        ],
        entrances=[AccessPoint(id="start", position=Position(x=1, z=1), semantic_type="entrance")],
        exits=[AccessPoint(id="goal", position=Position(x=9, z=7), semantic_type="exit")],
        attributes={"grid_resolution": 1.0},
    )


class NavigationBoundaryTests(unittest.TestCase):
    def test_grid_is_derived_from_a_generic_spatial_world(self) -> None:
        grid = OccupancyGrid(_world())

        self.assertFalse(grid.is_walkable(5, 4))
        self.assertTrue(grid.is_walkable(2, 6))
        self.assertEqual(grid.find_object_position("start"), (1.0, 1.0))
        with self.assertRaises(TypeError):
            OccupancyGrid({})  # type: ignore[arg-type]

    def test_blocking_walls_are_rasterized(self) -> None:
        grid = OccupancyGrid(_world(obstacle=False, wall=True))

        self.assertFalse(grid.is_walkable(5, 4))
        self.assertTrue(grid.is_walkable(4, 4))

    def test_closed_access_door_does_not_create_a_perimeter_opening(self) -> None:
        world = _world(obstacle=False)
        world.doors = [Door(id="entry-door", position=Position(x=1, z=0), width=2, is_open=False)]
        world.entrances[0].position = Position(x=1, z=0)
        world.entrances[0].door_id = "entry-door"

        self.assertFalse(OccupancyGrid(world).is_walkable(1, 0))

    def test_open_access_door_creates_a_perimeter_opening(self) -> None:
        world = _world(obstacle=False)
        world.doors = [Door(id="entry-door", position=Position(x=1, z=0), width=2, is_open=True)]
        world.entrances[0].position = Position(x=1, z=0)
        world.entrances[0].door_id = "entry-door"

        self.assertTrue(OccupancyGrid(world).is_walkable(1, 0))

    def test_clearance_inflation_preserves_existing_behavior(self) -> None:
        grid = OccupancyGrid(_world())

        self.assertTrue(grid.is_walkable(3, 4))
        self.assertFalse(grid.inflated(1.2).is_walkable(3, 4))

    def test_astar_routes_on_a_generic_world_derived_grid(self) -> None:
        result = find_path(occupancy=OccupancyGrid(_world()), start_id="start", goal_id="goal")

        self.assertTrue(result.path)
        self.assertEqual(result.path[0], (1.0, 1.0))
        self.assertEqual(result.path[-1], (9.0, 7.0))

    def test_baseline_personas_and_invalid_or_unreachable_routes_follow_existing_conventions(self) -> None:
        baseline = load_baseline()
        self.assertTrue(all(result.path for result in run_all_personas(
            occupancy=baseline,
            start_id="door_main_entrance",
            goal_id="desk_registration",
        )))
        with self.assertRaises(KeyError):
            find_path(occupancy=baseline, start_id="missing", goal_id="desk_registration")

        unreachable = _world(obstacle=False, wall=True)
        unreachable.walls[0] = Wall(id="divider", start=Position(x=5, z=0), end=Position(x=5, z=8))
        result = find_path(occupancy=OccupancyGrid(unreachable), start_id="start", goal_id="goal")
        self.assertEqual(result.path, [])
        self.assertTrue(math.isinf(result.distance_m))


if __name__ == "__main__":
    unittest.main()
