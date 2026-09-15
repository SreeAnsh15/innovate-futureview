import unittest

from simulation.grid import load_baseline
from simulation.pathfinder import find_path
from simulation.scenario import BAD_DESK_POS, evaluate_layout


class BaselineIntegrationTests(unittest.TestCase):
    def test_baseline_grid_is_derived_from_the_loaded_world(self) -> None:
        grid = load_baseline()

        self.assertEqual(grid.world.id, "hospital_lobby_01")
        self.assertEqual(grid.find_object_position("door_main_entrance"), (10.0, 0.5))
        self.assertFalse(grid.is_walkable(10.0, 6.0))

    def test_existing_navigation_and_scenario_entry_points_remain_compatible(self) -> None:
        result = find_path(
            occupancy=load_baseline(),
            start_id="door_main_entrance",
            goal_id="desk_registration",
        )
        comparison = evaluate_layout(modified_desk_pos=BAD_DESK_POS)

        self.assertTrue(result.path)
        self.assertNotEqual(comparison["baseline"], comparison["proposed"])
        self.assertIn(comparison["verdict"], {"RECOMMENDED", "NOT RECOMMENDED"})


if __name__ == "__main__":
    unittest.main()
