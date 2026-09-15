"""What-If layout evaluator: baseline vs modified registration desk placement."""

from __future__ import annotations

import json
from typing import Any

try:
    from .grid import OccupancyGrid, load_baseline
    from .metrics import compute_metrics
    from .domain import Position, SpatialWorld
except ImportError:  # python simulation/scenario.py
    from grid import OccupancyGrid, load_baseline
    from metrics import compute_metrics
    from domain import Position, SpatialWorld

BAD_DESK_POS = {"x": 2.0, "z": 7.0}


def _with_desk_position(world: SpatialWorld, desk_pos: dict[str, float]) -> SpatialWorld:
    """Apply the retained hospital-only scenario to a copy of the world."""

    updated = world.model_copy(deep=True)
    for item in updated.objects:
        if item.id != "desk_registration":
            continue
        item.position = Position(
            x=float(desk_pos.get("x", item.position.x)),
            y=float(desk_pos.get("y", item.position.y)),
            z=float(desk_pos.get("z", item.position.z)),
        )
        break
    else:
        raise KeyError("World is missing scenario object 'desk_registration'")
    return updated


def _pct_change(baseline: float, proposed: float) -> float:
    if not (isinstance(baseline, (int, float)) and isinstance(proposed, (int, float))):
        return float("inf")
    if not (abs(baseline) < float("inf") and abs(proposed) < float("inf")):
        return float("inf")
    if abs(baseline) < 1e-9:
        return 0.0 if abs(proposed) < 1e-9 else float("inf")
    return 100.0 * (proposed - baseline) / baseline


def _public_metrics(bundle: dict[str, Any]) -> dict[str, Any]:
    evac = bundle["evacuation"]
    return {
        "average_walking_distance_m": bundle["average_walking_distance_m"],
        "congestion_index": bundle["congestion_index"],
        "accessibility_index": bundle["accessibility_index"],
        "evacuation_distance_m": bundle["evacuation_distance_m"],
        "emergency_exit_clear": evac["emergency_exit_clear"],
        "evacuation_by_source_m": evac["by_source_m"],
        "overall_score": bundle["overall_score"],
        "persona_distances_m": bundle["persona_distances_m"],
    }


def _verdict(baseline: dict[str, Any], proposed: dict[str, Any]) -> tuple[str, list[str]]:
    reasons: list[str] = []
    recommended = True

    if not proposed["emergency_exit_clear"]:
        recommended = False
        reasons.append(
            "Emergency exit is blocked or unreachable after moving the registration desk."
        )

    distance_pct = _pct_change(
        baseline["average_walking_distance_m"], proposed["average_walking_distance_m"]
    )
    if distance_pct > 8.0:
        recommended = False
        reasons.append(
            f"Average walking distance increased by {distance_pct:.1f}%."
        )

    congestion_delta = proposed["congestion_index"] - baseline["congestion_index"]
    if congestion_delta > 5.0:
        recommended = False
        reasons.append(
            f"Congestion index rose by {congestion_delta:.1f} points due to overlapping or squeezed routes."
        )

    accessibility_delta = proposed["accessibility_index"] - baseline["accessibility_index"]
    if accessibility_delta < -5.0:
        recommended = False
        reasons.append(
            f"Accessibility index fell by {abs(accessibility_delta):.1f} points; wheelchair clearance or detour worsened."
        )

    evac_pct = _pct_change(
        baseline["evacuation_distance_m"], proposed["evacuation_distance_m"]
    )
    if evac_pct > 10.0:
        recommended = False
        reasons.append(
            f"Mean evacuation distance to the emergency exit increased by {evac_pct:.1f}%."
        )

    overall_delta = proposed["overall_score"] - baseline["overall_score"]
    if overall_delta < -1.0:
        recommended = False
        reasons.append(
            f"Overall weighted score dropped by {abs(overall_delta):.1f} points."
        )

    if recommended:
        if overall_delta > 1.0:
            reasons.append("Overall weighted score improved versus the baseline layout.")
        else:
            reasons.append("Proposed layout stays within acceptable impact thresholds.")
        if accessibility_delta >= 0:
            reasons.append("Wheelchair routes still maintain at least 1.2 m clearance.")
        return "RECOMMENDED", reasons

    if not reasons:
        reasons.append("Proposed layout is worse than baseline on the weighted decision score.")
    return "NOT RECOMMENDED", reasons


def evaluate_layout(
    modified_desk_pos: dict[str, float] | None = None,
    occupancy: OccupancyGrid | None = None,
) -> dict[str, Any]:
    """Score a layout. Omit ``modified_desk_pos`` for baseline-only metrics."""
    baseline_grid = occupancy or load_baseline()
    baseline_bundle = compute_metrics(baseline_grid)
    baseline_public = _public_metrics(baseline_bundle)

    if modified_desk_pos is None:
        return baseline_public

    proposed_world = _with_desk_position(baseline_grid.world, modified_desk_pos)
    proposed_grid = OccupancyGrid(proposed_world)
    proposed_bundle = compute_metrics(proposed_grid)
    proposed_public = _public_metrics(proposed_bundle)

    distance_pct = _pct_change(
        baseline_public["average_walking_distance_m"],
        proposed_public["average_walking_distance_m"],
    )
    congestion_delta = (
        proposed_public["congestion_index"] - baseline_public["congestion_index"]
    )
    accessibility_delta = (
        proposed_public["accessibility_index"] - baseline_public["accessibility_index"]
    )
    verdict, reasons = _verdict(baseline_public, proposed_public)

    return {
        "baseline": baseline_public,
        "proposed": proposed_public,
        "impact_deltas": {
            "distance_pct": distance_pct,
            "congestion_delta": congestion_delta,
            "accessibility_delta": accessibility_delta,
            "overall_score_delta": proposed_public["overall_score"]
            - baseline_public["overall_score"],
            "evacuation_pct": _pct_change(
                baseline_public["evacuation_distance_m"],
                proposed_public["evacuation_distance_m"],
            ),
        },
        "verdict": verdict,
        "reasons": reasons,
    }


def _round_for_print(value: Any) -> Any:
    if isinstance(value, float):
        if value == float("inf"):
            return "inf"
        return round(value, 3)
    if isinstance(value, dict):
        return {k: _round_for_print(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_round_for_print(v) for v in value]
    return value


def _print_block(title: str, payload: dict[str, Any]) -> None:
    print(title)
    print(json.dumps(_round_for_print(payload), indent=2))
    print()


if __name__ == "__main__":
    print("FUTUREVIEW What-If evaluator")
    print()

    scenario_a = evaluate_layout()
    _print_block("Scenario A - Baseline layout", scenario_a)

    scenario_b = evaluate_layout(modified_desk_pos=BAD_DESK_POS)
    _print_block(
        "Scenario B - Bad layout (desk moved to x=2.0, z=7.0 near emergency exit)",
        scenario_b,
    )
    print(f"verdict={scenario_b['verdict']}")
