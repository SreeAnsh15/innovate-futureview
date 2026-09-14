import math
from typing import Dict, Any, List
from ..schemas import Point, SceneObject, SimulationMetrics, MetricDelta

def clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))

def calculate_spatial_metrics(
    entrance: Point,
    from_pos: Point,
    to_pos: Point,
    users_per_hour: int,
    objects: List[SceneObject],
    env_width_m: float = 120.0,
    env_height_m: float = 80.0
) -> Dict[str, Any]:
    """
    Computes rigorous deterministic spatial metrics comparing baseline vs proposed configuration.
    """
    # Scale factor from percentage units (0-100) to real meters
    scale_m_per_unit = math.sqrt((env_width_m / 100.0)**2 + (env_height_m / 100.0)**2) / math.sqrt(2)
    
    # 1. Walking Distance (Euclidean + path circulation factor)
    circ_factor = 1.25  # accounts for corridor turning and aisle clearance
    base_dist_units = max(6.0, math.hypot(from_pos.x - entrance.x, from_pos.y - entrance.y) * circ_factor)
    prop_dist_units = max(6.0, math.hypot(to_pos.x - entrance.x, to_pos.y - entrance.y) * circ_factor)
    
    base_dist_m = round(base_dist_units * scale_m_per_unit, 1)
    prop_dist_m = round(prop_dist_units * scale_m_per_unit, 1)
    
    dist_delta_m = round(prop_dist_m - base_dist_m, 1)
    dist_delta_pct = round(((prop_dist_m - base_dist_m) / max(1.0, base_dist_m)) * 100.0, 1)

    # 2. Congestion Index (0 - 100)
    # Higher visitor demand and longer travel distance in confined corridors increase friction
    demand_load = users_per_hour / 140.0
    base_congestion = clamp(20.0 + max(0.0, base_dist_units - 28.0) * 1.35 + demand_load)
    prop_congestion = clamp(20.0 + max(0.0, prop_dist_units - 28.0) * 1.35 + demand_load)
    
    # Additional penalty if placed near critical/emergency zones
    critical_proximity_penalty = 0.0
    for obj in objects:
        if obj.kind == "critical" and math.hypot(to_pos.x - obj.x, to_pos.y - obj.y) < 18.0:
            critical_proximity_penalty += 14.0
    prop_congestion = clamp(prop_congestion + critical_proximity_penalty)
    
    congestion_delta = round(prop_congestion - base_congestion, 1)

    # 3. Accessibility Score (0 - 100)
    # Accessibility drops as travel distance from entrance exceeds standard threshold
    base_accessibility = clamp(96.0 - max(0.0, base_dist_m - 30.0) * 0.55)
    prop_accessibility = clamp(96.0 - max(0.0, prop_dist_m - 30.0) * 0.55 - (critical_proximity_penalty * 0.3))
    accessibility_delta = round(prop_accessibility - base_accessibility, 1)

    # 4. Safety Score (0 - 100)
    # Evaluates emergency egress distance, choke point formation, and critical path obstruction
    base_safety = clamp(97.0 - (base_congestion * 0.26))
    prop_safety = clamp(97.0 - (prop_congestion * 0.26) - (critical_proximity_penalty * 0.65))
    safety_delta = round(prop_safety - base_safety, 1)

    # 5. Flow Efficiency (0 - 100)
    # Optimal flow is direct, uninterrupted throughput
    base_flow_efficiency = clamp(95.0 - (base_congestion * 0.32) - max(0.0, base_dist_units - 25.0) * 0.4)
    prop_flow_efficiency = clamp(95.0 - (prop_congestion * 0.32) - max(0.0, prop_dist_units - 25.0) * 0.4)
    flow_efficiency_delta = round(prop_flow_efficiency - base_flow_efficiency, 1)

    # 6. User Experience (UX) Score (0 - 100)
    base_ux = clamp(100.0 - (base_congestion * 0.28) - max(0.0, 85.0 - base_accessibility) * 0.35)
    prop_ux = clamp(
        100.0 
        - (prop_congestion * 0.28) 
        - max(0.0, dist_delta_pct) * 0.25 
        - max(0.0, 85.0 - prop_accessibility) * 0.35
    )
    ux_delta = round(prop_ux - base_ux, 1)

    # 7. Composite Decision Score (Weighted overall index)
    baseline_score = int(round(
        0.25 * base_accessibility +
        0.25 * base_safety +
        0.20 * base_flow_efficiency +
        0.15 * base_ux +
        0.15 * (100.0 - base_congestion)
    ))

    score = int(round(
        0.25 * prop_accessibility +
        0.25 * prop_safety +
        0.20 * prop_flow_efficiency +
        0.15 * prop_ux +
        0.15 * (100.0 - prop_congestion)
    ))

    metrics_model = SimulationMetrics(
        walking_distance=MetricDelta(
            current=base_dist_m,
            proposed=prop_dist_m,
            delta=dist_delta_m,
            delta_pct=dist_delta_pct,
            unit="m",
            status="good" if dist_delta_pct <= 5.0 else "bad"
        ),
        congestion=MetricDelta(
            current=round(base_congestion, 1),
            proposed=round(prop_congestion, 1),
            delta=congestion_delta,
            delta_pct=round(((prop_congestion - base_congestion) / max(1.0, base_congestion)) * 100.0, 1),
            unit="/100",
            status="good" if congestion_delta <= 0 else "bad"
        ),
        accessibility=MetricDelta(
            current=round(base_accessibility, 1),
            proposed=round(prop_accessibility, 1),
            delta=accessibility_delta,
            delta_pct=round(((prop_accessibility - base_accessibility) / max(1.0, base_accessibility)) * 100.0, 1),
            unit="/100",
            status="good" if accessibility_delta >= 0 else "bad"
        ),
        safety=MetricDelta(
            current=round(base_safety, 1),
            proposed=round(prop_safety, 1),
            delta=safety_delta,
            delta_pct=round(((prop_safety - base_safety) / max(1.0, base_safety)) * 100.0, 1),
            unit="/100",
            status="good" if safety_delta >= 0 else "bad"
        ),
        flow_efficiency=MetricDelta(
            current=round(base_flow_efficiency, 1),
            proposed=round(prop_flow_efficiency, 1),
            delta=flow_efficiency_delta,
            delta_pct=round(((prop_flow_efficiency - base_flow_efficiency) / max(1.0, base_flow_efficiency)) * 100.0, 1),
            unit="/100",
            status="good" if flow_efficiency_delta >= 0 else "bad"
        ),
        experience=MetricDelta(
            current=round(base_ux, 1),
            proposed=round(prop_ux, 1),
            delta=ux_delta,
            delta_pct=round(((prop_ux - base_ux) / max(1.0, base_ux)) * 100.0, 1),
            unit="/100",
            status="good" if ux_delta >= 0 else "bad"
        )
    )

    return {
        "score": score,
        "baseline_score": baseline_score,
        "metrics": metrics_model,
        "base_dist_m": base_dist_m,
        "prop_dist_m": prop_dist_m,
        "dist_delta_pct": dist_delta_pct,
        "base_congestion": base_congestion,
        "prop_congestion": prop_congestion,
        "critical_penalty": critical_proximity_penalty
    }
