"""
FUTUREVIEW DOMAIN SIMULATORS
Deterministic Multi-Domain Simulation Models:
1. Spatial Intelligence (Core Flow & ADA)
2. Disaster Intelligence (Lifeline AI & Cascades)
3. Healthcare Operations (MedFlow Hospital Stress)
4. Road Safety (RoadShadow Digital Near-Miss)
5. Crowd Safety (CrowdGuard 5-Phase States)
6. Rescue Intelligence (RescueVision Pre-Rescue Lab)
7. Environmental Exposure (AirShield Exposure Twin)
8. Infrastructure Resilience (Infrastructure Oracle DAG)
"""

import math
from typing import Dict, Any, List, Optional
import datetime

# -------------------------------------------------------------
# 1. SPATIAL INTELLIGENCE SIMULATOR
# -------------------------------------------------------------
def simulate_spatial_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    users_per_hour = parameters.get("users_per_hour", 420)
    proposal_x = mutation.get("to_position", {}).get("x", 75.0)
    proposal_y = mutation.get("to_position", {}).get("y", 45.0)
    
    # Distance from entrance (10, 45) to proposal + to exit (90, 75)
    base_dist = 35.7
    prop_dist = math.hypot(proposal_x - 10, proposal_y - 45) + math.hypot(90 - proposal_x, 75 - proposal_y)
    dist_delta_pct = round(((prop_dist - base_dist) / base_dist) * 100, 1)
    
    # Congestion calculation
    is_far = proposal_x > 60
    congestion_score = min(100, max(12, int(32 + (users_per_hour / 420.0 - 1.0) * 35 + (35 if is_far else -12))))
    access_score = max(35, min(99, int(93 - (35 if is_far else -5))))
    safety_score = max(40, min(98, int(90 - (28 if is_far else -4))))
    overall_score = max(25, min(98, int(100 - (congestion_score * 0.35) - ((prop_dist - 30) * 0.4) + (access_score * 0.25))))
    
    verdict = "RECOMMENDED" if overall_score >= 80 else "REVIEW" if overall_score >= 60 else "AVOID"
    
    cascade = [
        {
            "id": "c1",
            "label": f"Relocation to ({proposal_x:.0f}, {proposal_y:.0f})",
            "severity": "info",
            "time_min": 0,
            "impact": f"Spatial modification applied to primary service anchor.",
            "evidence": f"Mutation target coordinates: ({proposal_x}, {proposal_y})"
        },
        {
            "id": "c2",
            "label": "Circulation Vector Disruption",
            "severity": "warning" if is_far else "positive",
            "time_min": 5,
            "impact": f"Walking trajectory changes by {dist_delta_pct:+.1f}% ({prop_dist:.1f}m vs baseline {base_dist}m).",
            "evidence": f"Path delta metric: {prop_dist - base_dist:.1f} meters."
        },
        {
            "id": "c3",
            "label": "Concourse Density Shift",
            "severity": "critical" if congestion_score > 65 else "positive",
            "time_min": 12,
            "impact": f"Pedestrian chokepoint intensity reaches {congestion_score}/100.",
            "evidence": f"Arrival flow rate: {users_per_hour} users/hour."
        },
        {
            "id": "c4",
            "label": "Universal Accessibility Impact",
            "severity": "warning" if access_score < 70 else "positive",
            "time_min": 20,
            "impact": f"Wheelchair and mobility-limited compliance score: {access_score}/100.",
            "evidence": f"Aisle clearance and turn radius analysis."
        }
    ]
    
    what_breaks_first = [
        {"rank": 1, "failure_name": "Concourse Main Ingress Spine", "time_min": 8, "severity": "HIGH" if is_far else "LOW", "affected_entity": "Main Hallway", "impact_summary": f"Density exceeds optimal 1.2 p/m² threshold at peak demand."},
        {"rank": 2, "failure_name": "Wheelchair Transit Corridor B", "time_min": 14, "severity": "MEDIUM" if is_far else "LOW", "affected_entity": "East Ramp", "impact_summary": "Detour path increases fatigue threshold by 48%."},
        {"rank": 3, "failure_name": "Emergency Egress Route Delta", "time_min": 25, "severity": "LOW", "affected_entity": "South Exit", "impact_summary": "Slight bottlenecking during synchronized peak departure."}
    ]
    
    # 5-stage timeline telemetry frames (T+0, T+10, T+20, T+30, T+60)
    timeline = []
    for t in [0, 10, 20, 30, 60]:
        factor = 1.0 + (t / 60.0) * 0.3
        timeline.append({
            "t": t,
            "active_occupants": int(users_per_hour * (t / 60.0 + 0.2)),
            "congestion": min(100, int(congestion_score * factor)),
            "walking_distance_m": prop_dist,
            "queue_length": max(2, int((users_per_hour / 60.0) * (1.2 if is_far else 0.4) * factor)),
            "bottlenecks_detected": 3 if is_far else 1
        })
        
    pareto = [
        {"id": "opt_a", "name": "Mid-Concourse Shift (AI Alternative A)", "strategy": "LOW_COST", "score": 95, "walking_m": 18.2, "congestion": 24, "accessibility": 97, "cost": "$2,500", "is_winner": False},
        {"id": "opt_b", "name": "Dual Express Kiosks (AI Alternative B)", "strategy": "QUEUE_BUSTER", "score": 93, "walking_m": 16.5, "congestion": 21, "accessibility": 94, "cost": "$8,000", "is_winner": False},
        {"id": "opt_c", "name": "Optimized Anchor (AI BEST FUTURE)", "strategy": "PARETO_OPTIMAL", "score": 98, "walking_m": 16.8, "congestion": 19, "accessibility": 99, "cost": "$10,500", "is_winner": True}
    ]

    return {
        "domain": "spatial",
        "verdict": verdict,
        "score": overall_score,
        "baseline_score": 88,
        "metrics": {
            "walking_distance": {"current": base_dist, "proposed": round(prop_dist, 1), "delta": round(prop_dist - base_dist, 1), "delta_pct": dist_delta_pct, "unit": "m", "status": "bad" if is_far else "good"},
            "congestion": {"current": 32, "proposed": congestion_score, "delta": congestion_score - 32, "unit": "/100", "status": "bad" if congestion_score > 50 else "good"},
            "accessibility": {"current": 93, "proposed": access_score, "delta": access_score - 93, "unit": "/100", "status": "bad" if access_score < 80 else "good"},
            "safety": {"current": 90, "proposed": safety_score, "delta": safety_score - 90, "unit": "/100", "status": "bad" if safety_score < 75 else "good"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Spatial relocation of target desk to coordinates ({proposal_x:.1f}, {proposal_y:.1f}).",
            "primary_effect": f"Pedestrian path length changes by {dist_delta_pct:+.1f}%.",
            "secondary_effect": f"Flow friction concentrates concourse density to {congestion_score}/100.",
            "tertiary_effect": f"Accessibility compliance index adjusted to {access_score}/100.",
            "final_impact": f"Composite decision viability evaluated as {verdict} ({overall_score}/100)."
        }
    }


# -------------------------------------------------------------
# 2. DISASTER INTELLIGENCE (LIFELINE AI) SIMULATOR
# -------------------------------------------------------------
def simulate_disaster_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    flood_level_m = parameters.get("flood_level_m", 1.8)
    blocked_bridge = parameters.get("blocked_bridge", True)
    evacuation_surge_pct = parameters.get("evacuation_surge_pct", 65)
    
    # Calculations
    road_closure_pct = min(92, int(25 + flood_level_m * 22))
    ambulance_delay_min = round(4.5 + flood_level_m * 3.8 + (8.0 if blocked_bridge else 0.0), 1)
    hospital_intake_pct = min(100, int(60 + evacuation_surge_pct * 0.45))
    overall_resilience_score = max(20, min(95, int(90 - (road_closure_pct * 0.35) - (ambulance_delay_min * 2.2) - (hospital_intake_pct * 0.25))))
    
    verdict = "RECOMMENDED" if overall_resilience_score >= 75 else "REVIEW" if overall_resilience_score >= 50 else "AVOID"

    cascade = [
        {
            "id": "d1",
            "label": f"Flood Inundation Level: {flood_level_m}m",
            "severity": "critical" if flood_level_m > 1.2 else "warning",
            "time_min": 0,
            "impact": f"Flash water level reaches {flood_level_m}m in low-lying arterial corridors.",
            "evidence": "Hydraulic inundation vector simulation."
        },
        {
            "id": "d2",
            "label": f"Road Network Severed ({road_closure_pct}% Closed)",
            "severity": "critical",
            "time_min": 12,
            "impact": f"Central causeway and {3 if blocked_bridge else 1} arterial bridges impassable.",
            "evidence": "Submerged elevation contours."
        },
        {
            "id": "d3",
            "label": f"Emergency Transit Redistribution (+{ambulance_delay_min}m Delay)",
            "severity": "critical" if ambulance_delay_min > 10 else "warning",
            "time_min": 24,
            "impact": f"First responder transit times increase from 6.2 min to {6.2 + ambulance_delay_min:.1f} min.",
            "evidence": "Rerouting around flooded lowlands."
        },
        {
            "id": "d4",
            "label": f"Hospital Intake Saturation ({hospital_intake_pct}%)",
            "severity": "critical" if hospital_intake_pct > 85 else "warning",
            "time_min": 38,
            "impact": f"Triage departments overflow with displaced casualties.",
            "evidence": "Shelter A capacity exceeded by 240 occupants."
        }
    ]

    what_breaks_first = [
        {"rank": 1, "failure_name": "North River Bridge Access", "time_min": 12, "severity": "CRITICAL", "affected_entity": "Arterial Bridge 01", "impact_summary": "Water overtopping causes complete vehicle stoppage."},
        {"rank": 2, "failure_name": "Metropolitan Emergency Trauma Ingress", "time_min": 19, "severity": "HIGH", "affected_entity": "City General Hospital", "impact_summary": f"Ambulance arrival queue spikes to {int(ambulance_delay_min * 1.5)} units."},
        {"rank": 3, "failure_name": "Civic Center Shelter B Capacity", "time_min": 28, "severity": "CRITICAL", "affected_entity": "Shelter B", "impact_summary": "Bed saturation exceeds 100% capacity."}
    ]

    timeline = []
    for t in [0, 10, 20, 30, 60]:
        timeline.append({
            "t": t,
            "flood_depth_m": round(min(flood_level_m, 0.4 + (flood_level_m - 0.4) * (t / 60.0)), 2),
            "roads_closed_pct": min(road_closure_pct, int(road_closure_pct * (t / 60.0 + 0.15))),
            "evacuated_citizens": int(1800 * (t / 60.0)),
            "shelter_occupancy_pct": min(100, int(30 + hospital_intake_pct * 0.7 * (t / 60.0))),
            "active_rescue_teams": max(2, int(8 - (t / 20.0)))
        })

    pareto = [
        {"id": "dis_opt_a", "name": "Deploy Modular Aqua-Barriers at River Bank", "strategy": "FLOOD_DEFENSE", "score": 88, "walking_m": 0, "congestion": 38, "accessibility": 85, "cost": "$45,000", "is_winner": False},
        {"id": "dis_opt_b", "name": "Activate West Elevated Bypass + Auxiliary Shelter C", "strategy": "EVACUATION_BOOST", "score": 92, "walking_m": 0, "congestion": 29, "accessibility": 91, "cost": "$62,000", "is_winner": False},
        {"id": "dis_opt_c", "name": "Integrated Aqua-Barrier + Pre-staged Drone Medical Lifeline", "strategy": "PARETO_LIFELINE", "score": 96, "walking_m": 0, "congestion": 18, "accessibility": 96, "cost": "$85,000", "is_winner": True}
    ]

    return {
        "domain": "disaster",
        "verdict": verdict,
        "score": overall_resilience_score,
        "baseline_score": 82,
        "metrics": {
            "road_closure": {"current": 0, "proposed": road_closure_pct, "delta": road_closure_pct, "unit": "%", "status": "bad"},
            "ambulance_delay": {"current": 6.2, "proposed": round(6.2 + ambulance_delay_min, 1), "delta": ambulance_delay_min, "unit": "min", "status": "bad"},
            "hospital_intake": {"current": 48, "proposed": hospital_intake_pct, "delta": hospital_intake_pct - 48, "unit": "%", "status": "bad" if hospital_intake_pct > 80 else "neutral"},
            "resilience_score": {"current": 82, "proposed": overall_resilience_score, "delta": overall_resilience_score - 82, "unit": "/100", "status": "bad" if overall_resilience_score < 70 else "good"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Severe inundation event ({flood_level_m}m flood surge) with primary bridge cutoff.",
            "primary_effect": f"{road_closure_pct}% of urban transport network submerged.",
            "secondary_effect": f"Ambulance emergency response delayed by +{ambulance_delay_min} minutes.",
            "tertiary_effect": f"Shelter and triage intake load climbs to {hospital_intake_pct}% capacity.",
            "final_impact": f"Systemic disaster resilience index drops to {overall_resilience_score}/100 ({verdict})."
        }
    }


# -------------------------------------------------------------
# 3. HEALTHCARE OPERATIONS (MEDFLOW) SIMULATOR
# -------------------------------------------------------------
def simulate_healthcare_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    er_surge_pct = parameters.get("er_surge_pct", 45)
    scanner_offline = parameters.get("scanner_offline", True)
    nurse_shortage = parameters.get("nurse_shortage", 2)
    
    # Stress metrics
    arrival_rate = int(42 * (1.0 + er_surge_pct / 100.0))
    triage_wait_min = round(12.5 + (er_surge_pct * 0.6) + (18.0 if scanner_offline else 0.0) + (nurse_shortage * 4.5), 1)
    bed_occupancy_pct = min(100, int(72 + er_surge_pct * 0.45 + (12 if scanner_offline else 0)))
    icu_stress_pct = min(100, int(68 + er_surge_pct * 0.55))
    
    hospital_stress_index = min(100, int((triage_wait_min * 0.8) + (bed_occupancy_pct * 0.4) + (icu_stress_pct * 0.3)))
    composite_health_score = max(20, min(98, 100 - int(hospital_stress_index * 0.75)))
    
    verdict = "RECOMMENDED" if hospital_stress_index < 45 else "REVIEW" if hospital_stress_index < 75 else "AVOID"

    cascade = [
        {
            "id": "h1",
            "label": f"Emergency Patient Surge (+{er_surge_pct}%)",
            "severity": "critical" if er_surge_pct > 40 else "warning",
            "time_min": 0,
            "impact": f"Patient arrivals spike from 42 to {arrival_rate} patients/hour.",
            "evidence": "Ambulance and walk-in telemetry intake."
        },
        {
            "id": "h2",
            "label": f"Diagnostic Chokepoint ({'CT Scanner 1 Down' if scanner_offline else 'Nominal'})",
            "severity": "critical" if scanner_offline else "positive",
            "time_min": 14,
            "impact": "Diagnostic throughput drops by 50%, delaying physician treatment orders.",
            "evidence": "Scanner queue exceeds 9 patients."
        },
        {
            "id": "h3",
            "label": f"Triage Wait Time Escalation ({triage_wait_min} min)",
            "severity": "critical" if triage_wait_min > 35 else "warning",
            "time_min": 28,
            "impact": f"Average waiting duration jumps from 12.5 min to {triage_wait_min} min.",
            "evidence": "Waiting room seating saturation at 94%."
        },
        {
            "id": "h4",
            "label": f"ICU & Inpatient Bed Saturation ({bed_occupancy_pct}%)",
            "severity": "critical" if bed_occupancy_pct > 90 else "warning",
            "time_min": 45,
            "impact": "Critical care beds unavailable, causing boarding in ER hallways.",
            "evidence": f"ICU occupancy reaches {icu_stress_pct}%."
        }
    ]

    what_breaks_first = [
        {"rank": 1, "failure_name": "Triage Rapid Intake Station", "time_min": 11, "severity": "HIGH", "affected_entity": "Triage Bay 01", "impact_summary": f"Nurse staffing deficit ({nurse_shortage} staff down) stalls intake registration."},
        {"rank": 2, "failure_name": "Computed Tomography (CT) Lab", "time_min": 18, "severity": "CRITICAL", "affected_entity": "CT Scanner Unit 01", "impact_summary": "Unplanned hardware fault creates 45-minute imaging backlog."},
        {"rank": 3, "failure_name": "Step-Down Ward Bed Availability", "time_min": 32, "severity": "HIGH", "affected_entity": "Ward 3B", "impact_summary": "Zero buffer beds remaining for ER admissions."}
    ]

    timeline = []
    for t in [0, 10, 20, 30, 60]:
        timeline.append({
            "t": t,
            "waiting_patients": int(arrival_rate * (t / 60.0 + 0.3)),
            "triage_wait_min": round(min(triage_wait_min, 12.5 + (triage_wait_min - 12.5) * (t / 60.0)), 1),
            "bed_occupancy_pct": min(100, int(72 + (bed_occupancy_pct - 72) * (t / 60.0))),
            "staff_workload_pct": min(100, int(65 + er_surge_pct * 0.6 * (t / 60.0)))
        })

    pareto = [
        {"id": "med_opt_a", "name": "Deploy Fast-Track Triage Nurse Pod", "strategy": "FAST_TRIAGE", "score": 90, "walking_m": 0, "congestion": 32, "accessibility": 92, "cost": "$4,200", "is_winner": False},
        {"id": "med_opt_b", "name": "Activate Tele-Radiology Backup & Modular Overflow Bay", "strategy": "CAPACITY_BOOST", "score": 94, "walking_m": 0, "congestion": 24, "accessibility": 95, "cost": "$12,000", "is_winner": False},
        {"id": "med_opt_c", "name": "Autonomous AI Pre-Triage Kiosk + Dynamic Bed Orchestration", "strategy": "PARETO_MEDFLOW", "score": 97, "walking_m": 0, "congestion": 16, "accessibility": 98, "cost": "$18,500", "is_winner": True}
    ]

    return {
        "domain": "healthcare",
        "verdict": verdict,
        "score": composite_health_score,
        "baseline_score": 86,
        "metrics": {
            "hospital_stress_index": {"current": 38, "proposed": hospital_stress_index, "delta": hospital_stress_index - 38, "unit": "/100", "status": "bad" if hospital_stress_index > 55 else "good"},
            "triage_wait_time": {"current": 12.5, "proposed": triage_wait_min, "delta": round(triage_wait_min - 12.5, 1), "unit": "min", "status": "bad"},
            "bed_occupancy": {"current": 72, "proposed": bed_occupancy_pct, "delta": bed_occupancy_pct - 72, "unit": "%", "status": "bad" if bed_occupancy_pct > 85 else "neutral"},
            "icu_stress": {"current": 68, "proposed": icu_stress_pct, "delta": icu_stress_pct - 68, "unit": "%", "status": "bad" if icu_stress_pct > 85 else "neutral"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Emergency arrival surge of +{er_surge_pct}% compounded by {'CT scanner downtime' if scanner_offline else 'equipment strain'} and {nurse_shortage} nurse shortage.",
            "primary_effect": f"Triage wait times increase to {triage_wait_min} minutes.",
            "secondary_effect": f"Bed occupancy reaches {bed_occupancy_pct}% with ER boarding.",
            "tertiary_effect": f"ICU capacity stressed to {icu_stress_pct}%.",
            "final_impact": f"Hospital Stress Index escalates to {hospital_stress_index}/100 (Status: {verdict})."
        }
    }


# -------------------------------------------------------------
# 4. ROAD SAFETY (ROADSHADOW) SIMULATOR
# -------------------------------------------------------------
def simulate_road_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    traffic_surge_pct = parameters.get("traffic_surge_pct", 40)
    weather_condition = parameters.get("weather_condition", "RAIN")  # CLEAR, RAIN, FOG, NIGHT
    pedestrian_surge_pct = parameters.get("pedestrian_surge_pct", 30)
    signal_cycle_sec = parameters.get("signal_cycle_sec", 45)
    
    weather_friction_mult = 1.6 if weather_condition == "RAIN" else 1.9 if weather_condition == "FOG" else 1.3 if weather_condition == "NIGHT" else 1.0
    
    # Near miss calculation
    simulated_near_miss_rate = round((4.2 * (1 + traffic_surge_pct / 100.0) * (1 + pedestrian_surge_pct / 100.0) * weather_friction_mult), 1)
    conflict_hotspot_count = max(1, int(2 + traffic_surge_pct * 0.08 + (2 if weather_condition != "CLEAR" else 0)))
    pedestrian_exposure_sec = round(14.0 * (45.0 / signal_cycle_sec), 1)
    road_safety_score = max(25, min(96, int(100 - simulated_near_miss_rate * 3.5 - conflict_hotspot_count * 4)))
    
    verdict = "RECOMMENDED" if road_safety_score >= 80 else "REVIEW" if road_safety_score >= 60 else "AVOID"

    cascade = [
        {
            "id": "r1",
            "label": f"Traffic Volume Surge (+{traffic_surge_pct}%) in {weather_condition}",
            "severity": "warning" if traffic_surge_pct > 25 else "info",
            "time_min": 0,
            "impact": f"Vehicle flow climbs to {int(1200 * (1 + traffic_surge_pct / 100.0))} vehicles/hour under {weather_condition} road friction.",
            "evidence": "Inductive loop radar count simulation."
        },
        {
            "id": "r2",
            "label": f"Pedestrian Crosswalk Exposure ({pedestrian_exposure_sec}s Window)",
            "severity": "warning",
            "time_min": 10,
            "impact": f"Crosswalk clearance margin compressed by signal timing of {signal_cycle_sec}s.",
            "evidence": "Pedestrian crossing trajectory overlap."
        },
        {
            "id": "r3",
            "label": f"Simulated Near-Miss Spike ({simulated_near_miss_rate} / hr)",
            "severity": "critical" if simulated_near_miss_rate > 10 else "warning",
            "time_min": 22,
            "impact": f"Vehicle-pedestrian deceleration events exceed safety threshold by +{int((simulated_near_miss_rate/4.2 - 1)*100)}%.",
            "evidence": "High deceleration (<0.4s TTC) telemetry markers."
        },
        {
            "id": "r4",
            "label": "Intersection Gridlock Saturation",
            "severity": "critical" if conflict_hotspot_count > 4 else "warning",
            "time_min": 35,
            "impact": f"{conflict_hotspot_count} critical conflict zones identified along arterial left-turn lanes.",
            "evidence": "Queue spillback across pedestrian cross-hatches."
        }
    ]

    what_breaks_first = [
        {"rank": 1, "failure_name": "Main Street Pedestrian Crossing", "time_min": 9, "severity": "CRITICAL", "affected_entity": "Crosswalk A (West)", "impact_summary": "Turning bus blindspot overlaps with elderly pedestrian cluster."},
        {"rank": 2, "failure_name": "Northbound Unprotected Left Turn", "time_min": 16, "severity": "HIGH", "affected_entity": "Junction 04", "impact_summary": f"Speed delta causes {int(simulated_near_miss_rate*0.4)} simulated high-risk interactions."},
        {"rank": 3, "failure_name": "Bicycle Green Lane Transition", "time_min": 25, "severity": "MEDIUM", "affected_entity": "Cycle Corridor", "impact_summary": "Vehicles encroach onto bike lane due to wet braking friction."}
    ]

    timeline = []
    for t in [0, 10, 20, 30, 60]:
        timeline.append({
            "t": t,
            "simulated_near_misses": round(simulated_near_miss_rate * (t / 60.0 + 0.2), 1),
            "conflict_intensity": min(100, int(35 + simulated_near_miss_rate * 4 * (t / 60.0))),
            "average_speed_kmh": max(18, int(45 - traffic_surge_pct * 0.4 * (t / 60.0))),
            "pedestrian_wait_time_sec": int(pedestrian_exposure_sec * (t / 60.0 + 0.5))
        })

    pareto = [
        {"id": "road_opt_a", "name": "Extend Pedestrian Walk Phase (+12s) + High-Grip Pavement", "strategy": "WALK_SAFETY", "score": 91, "walking_m": 0, "congestion": 34, "accessibility": 94, "cost": "$8,500", "is_winner": False},
        {"id": "road_opt_b", "name": "Protected Left-Turn Signal + Raised Pedestrian Refuge", "strategy": "PROTECTED_JUNCTION", "score": 95, "walking_m": 0, "congestion": 26, "accessibility": 97, "cost": "$16,000", "is_winner": False},
        {"id": "road_opt_c", "name": "AI Dynamic Radar Sensor Signal + Adaptive Pedestrian Bulb-Out", "strategy": "PARETO_ROADSHADOW", "score": 98, "walking_m": 0, "congestion": 19, "accessibility": 99, "cost": "$24,000", "is_winner": True}
    ]

    return {
        "domain": "road",
        "verdict": verdict,
        "score": road_safety_score,
        "baseline_score": 85,
        "metrics": {
            "near_miss_risk": {"current": 4.2, "proposed": simulated_near_miss_rate, "delta": round(simulated_near_miss_rate - 4.2, 1), "unit": "events/hr", "status": "bad"},
            "conflict_hotspots": {"current": 2, "proposed": conflict_hotspot_count, "delta": conflict_hotspot_count - 2, "unit": "zones", "status": "bad" if conflict_hotspot_count > 3 else "neutral"},
            "pedestrian_exposure": {"current": 14.0, "proposed": pedestrian_exposure_sec, "delta": round(pedestrian_exposure_sec - 14.0, 1), "unit": "sec", "status": "bad" if pedestrian_exposure_sec > 18 else "good"},
            "road_safety_score": {"current": 85, "proposed": road_safety_score, "delta": road_safety_score - 85, "unit": "/100", "status": "bad" if road_safety_score < 75 else "good"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Traffic surge (+{traffic_surge_pct}%) in {weather_condition} condition with {signal_cycle_sec}s cycle.",
            "primary_effect": f"Simulated near-miss interaction rate escalates to {simulated_near_miss_rate} events/hr.",
            "secondary_effect": f"{conflict_hotspot_count} high-risk conflict zones form near pedestrian crossings.",
            "tertiary_effect": f"Braking distance margins reduced by {int((weather_friction_mult-1)*100)}%.",
            "final_impact": f"Composite road safety index evaluated as {verdict} ({road_safety_score}/100)."
        }
    }


# -------------------------------------------------------------
# 5. CROWD SAFETY (CROWDGUARD) SIMULATOR
# -------------------------------------------------------------
def simulate_crowd_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    gate_a_closed = parameters.get("gate_a_closed", True)
    ingress_rate_per_min = parameters.get("ingress_rate_per_min", 850)
    venue_capacity = parameters.get("venue_capacity", 25000)
    
    # 5-Phase State Calculation
    # Phase 1: <1.5 p/m2 (Normal), Phase 2: 1.5-2.5 (Crowding), Phase 3: 2.5-4.0 (Instability), Phase 4: 4.0-5.5 (Compression), Phase 5: >5.5 (Critical)
    peak_density_p_m2 = round(1.2 + (ingress_rate_per_min / 400.0) * (2.4 if gate_a_closed else 0.8), 2)
    
    crowd_phase = 5 if peak_density_p_m2 >= 5.5 else 4 if peak_density_p_m2 >= 4.0 else 3 if peak_density_p_m2 >= 2.5 else 2 if peak_density_p_m2 >= 1.5 else 1
    phase_label = ["Phase 1: Normal Flow", "Phase 2: High Density", "Phase 3: Flow Instability", "Phase 4: Compression Risk", "Phase 5: Critical Emergency"][crowd_phase - 1]
    
    turbulence_index = min(100, int(peak_density_p_m2 * 18))
    evacuation_clearance_min = round(14.0 * (1.8 if gate_a_closed else 0.95), 1)
    crowd_safety_score = max(15, min(98, int(100 - (peak_density_p_m2 * 14) - (turbulence_index * 0.3))))
    
    verdict = "RECOMMENDED" if crowd_phase <= 2 else "REVIEW" if crowd_phase == 3 else "AVOID"

    cascade = [
        {
            "id": "cg1",
            "label": f"{'Gate A Closed' if gate_a_closed else 'Full Ingress Active'} (Rate: {ingress_rate_per_min}/min)",
            "severity": "critical" if gate_a_closed else "info",
            "time_min": 0,
            "impact": "Turnstile inflow funneling creates immediate bottleneck at remaining gates.",
            "evidence": "Access control turnstile telemetry."
        },
        {
            "id": "cg2",
            "label": f"Density Saturation ({peak_density_p_m2} ped/m²)",
            "severity": "critical" if peak_density_p_m2 >= 4.0 else "warning",
            "time_min": 8,
            "impact": f"Concourse crowd reaches {phase_label} threshold.",
            "evidence": "Overhead optical density sensor grid."
        },
        {
            "id": "cg3",
            "label": f"Crowd Turbulence & Counterflow Velocity Drag ({turbulence_index}/100)",
            "severity": "critical" if turbulence_index > 65 else "warning",
            "time_min": 17,
            "impact": f"Pedestrian forward velocity drops from 1.35 m/s to {max(0.2, 1.35 - peak_density_p_m2 * 0.2):.2f} m/s.",
            "evidence": "Radial flow vector collision."
        },
        {
            "id": "cg4",
            "label": f"Egress Clearance Time Expansion ({evacuation_clearance_min} min)",
            "severity": "critical" if evacuation_clearance_min > 20 else "warning",
            "time_min": 30,
            "impact": f"Full stadium safe egress window delayed by +{round(evacuation_clearance_min - 14.0, 1)} minutes.",
            "evidence": "Stairwell pressure accumulation."
        }
    ]

    what_breaks_first = [
        {"rank": 1, "failure_name": "Gate B Security Ingress Funnel", "time_min": 7, "severity": "CRITICAL" if gate_a_closed else "LOW", "affected_entity": "North Gate Turnstiles", "impact_summary": "Density exceeds 4.2 p/m² due to Gate A load redistribution."},
        {"rank": 2, "failure_name": "Concourse Concession Junction 03", "time_min": 14, "severity": "HIGH", "affected_entity": "East Concourse", "impact_summary": "Bidirectional counterflow causes stop-and-go shockwaves."},
        {"rank": 3, "failure_name": "Stairwell Ingress Pod 12", "time_min": 22, "severity": "MEDIUM", "affected_entity": "Upper Deck Stairs", "impact_summary": "Ascending pedestrian backup spills into lower apron."}
    ]

    timeline = []
    for t in [0, 10, 20, 30, 60]:
        timeline.append({
            "t": t,
            "current_density_p_m2": round(min(peak_density_p_m2, 0.8 + (peak_density_p_m2 - 0.8) * (t / 60.0)), 2),
            "crowd_phase": min(5, max(1, int(1 + (crowd_phase - 1) * (t / 60.0)))),
            "turbulence_score": min(100, int(turbulence_index * (t / 60.0 + 0.2))),
            "queued_visitors": int(ingress_rate_per_min * 10 * (t / 60.0 + 0.1))
        })

    pareto = [
        {"id": "cg_opt_a", "name": "Open Emergency Surge Bypass Gate B2", "strategy": "SURGE_RELEASE", "score": 89, "walking_m": 0, "congestion": 31, "accessibility": 91, "cost": "$3,500", "is_winner": False},
        {"id": "cg_opt_b", "name": "Implement Metered Staged Ingress Queue + Unidirectional Lanes", "strategy": "FLOW_METERING", "score": 94, "walking_m": 0, "congestion": 22, "accessibility": 96, "cost": "$9,000", "is_winner": False},
        {"id": "cg_opt_c", "name": "Autonomous Smart Gates + Real-Time Digital Twin Crowd Guidance", "strategy": "PARETO_CROWDGUARD", "score": 98, "walking_m": 0, "congestion": 14, "accessibility": 99, "cost": "$16,500", "is_winner": True}
    ]

    return {
        "domain": "crowd",
        "verdict": verdict,
        "score": crowd_safety_score,
        "baseline_score": 88,
        "metrics": {
            "peak_density": {"current": 1.2, "proposed": peak_density_p_m2, "delta": round(peak_density_p_m2 - 1.2, 2), "unit": "ped/m²", "status": "bad" if peak_density_p_m2 > 2.5 else "good"},
            "crowd_phase_num": {"current": 1, "proposed": crowd_phase, "delta": crowd_phase - 1, "unit": "Phase (1-5)", "status": "bad" if crowd_phase >= 3 else "good"},
            "turbulence_index": {"current": 18, "proposed": turbulence_index, "delta": turbulence_index - 18, "unit": "/100", "status": "bad" if turbulence_index > 50 else "good"},
            "evac_clearance_time": {"current": 14.0, "proposed": evacuation_clearance_min, "delta": round(evacuation_clearance_min - 14.0, 1), "unit": "min", "status": "bad" if evacuation_clearance_min > 18 else "good"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Ingress flow of {ingress_rate_per_min} visitors/min with {'Gate A blocked' if gate_a_closed else 'standard gates'}.",
            "primary_effect": f"Crowd transitions to {phase_label} with density {peak_density_p_m2} p/m².",
            "secondary_effect": f"Turbulence index spikes to {turbulence_index}/100.",
            "tertiary_effect": f"Evacuation clearance time lengthened to {evacuation_clearance_min} minutes.",
            "final_impact": f"Composite crowd safety verdict: {verdict} ({crowd_safety_score}/100)."
        }
    }


# -------------------------------------------------------------
# 6. RESCUE INTELLIGENCE (RESCUEVISION) SIMULATOR
# -------------------------------------------------------------
def simulate_rescue_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    staircase_b_blocked = parameters.get("staircase_b_blocked", True)
    smoke_spread_rate = parameters.get("smoke_spread_rate", "FAST")  # SLOW, MODERATE, FAST
    trapped_occupants = parameters.get("trapped_occupants", 14)
    team_alpha_available = parameters.get("team_alpha_available", True)
    
    smoke_penalty = 1.8 if smoke_spread_rate == "FAST" else 1.3 if smoke_spread_rate == "MODERATE" else 1.0
    
    rescue_time_min = round((11.5 + (8.5 if staircase_b_blocked else 0.0) + (12.0 if not team_alpha_available else 0.0)) * smoke_penalty, 1)
    responder_risk_score = min(100, int(25 + (35 if staircase_b_blocked else 0) + (25 if smoke_spread_rate == "FAST" else 10) + (15 if not team_alpha_available else 0)))
    trapped_survivability_pct = max(15, min(100, int(98 - (rescue_time_min * 1.8))))
    rescue_mission_score = max(20, min(97, int((trapped_survivability_pct * 0.6) + ((100 - responder_risk_score) * 0.4))))
    
    verdict = "RECOMMENDED" if rescue_mission_score >= 80 else "REVIEW" if rescue_mission_score >= 55 else "AVOID"

    cascade = [
        {
            "id": "rs1",
            "label": f"Hazard Propagation ({smoke_spread_rate} Smoke Surge)",
            "severity": "critical" if smoke_spread_rate == "FAST" else "warning",
            "time_min": 0,
            "impact": "Dense toxic smoke inundates central atrium and 3rd floor corridor.",
            "evidence": "Optical obscuration sensors exceed 0.4 OD/m."
        },
        {
            "id": "rs2",
            "label": f"Primary Egress Compromised ({'Staircase B Blocked' if staircase_b_blocked else 'Clear'})",
            "severity": "critical" if staircase_b_blocked else "positive",
            "time_min": 6,
            "impact": f"Direct escape vector cut off for {trapped_occupants} occupants on Floor 4.",
            "evidence": "Thermal camera detects flashover near landing."
        },
        {
            "id": "rs3",
            "label": "Safest Feasible Extraction Corridor Calculated",
            "severity": "warning",
            "time_min": 14,
            "impact": f"Rescue teams rerouted via External West Fire Escape (+{rescue_time_min}m total mission).",
            "evidence": "AI multi-criteria hazard path optimization."
        },
        {
            "id": "rs4",
            "label": f"Occupant Extraction Window ({trapped_survivability_pct}% Survival Index)",
            "severity": "critical" if trapped_survivability_pct < 65 else "positive",
            "time_min": 25,
            "impact": f"Mission success window estimated at {trapped_survivability_pct}% with responder risk at {responder_risk_score}/100.",
            "evidence": "CO toxic threshold accumulation model."
        }
    ]

    what_breaks_first = [
        {"rank": 1, "failure_name": "Floor 3 Staircase B Fire Door", "time_min": 5, "severity": "CRITICAL", "affected_entity": "Staircase B", "impact_summary": "Thermal seal failure permits smoke infiltration to upper stairwell."},
        {"rank": 2, "failure_name": "Floor 4 West Corridor Visibility", "time_min": 11, "severity": "HIGH", "affected_entity": "Corridor 4W", "impact_summary": "Visibility drops below 1.5m, impeding unguided occupant evacuation."},
        {"rank": 3, "failure_name": "Primary SCBA Air Reserve Margin", "time_min": 22, "severity": "MEDIUM", "affected_entity": "Rescue Team Bravo", "impact_summary": "Extended detour consumes 65% of portable air cylinder capacity."}
    ]

    timeline = []
    for t in [0, 10, 20, 30, 60]:
        timeline.append({
            "t": t,
            "smoke_coverage_pct": min(100, int(15 + 85 * (t / 60.0) * smoke_penalty * 0.7)),
            "occupants_extracted": min(trapped_occupants, int(trapped_occupants * (t / max(1, rescue_time_min)))),
            "responder_hazard_level": min(100, int(responder_risk_score * (t / 60.0 + 0.3))),
            "survivability_pct": max(15, int(98 - (t * 1.2)))
        })

    pareto = [
        {"id": "res_opt_a", "name": "Deploy Positive-Pressure Ventilation at Stairwell A", "strategy": "SMOKE_EJECT", "score": 88, "walking_m": 0, "congestion": 30, "accessibility": 88, "cost": "$6,000", "is_winner": False},
        {"id": "res_opt_b", "name": "Dual-Team Pincer Extraction via West Balcony Hoist", "strategy": "PINCER_RESCUE", "score": 93, "walking_m": 0, "congestion": 22, "accessibility": 93, "cost": "$14,000", "is_winner": False},
        {"id": "res_opt_c", "name": "AI Thermal Drone Recon + Automated Stairwell Pressurization", "strategy": "PARETO_RESCUEVISION", "score": 97, "walking_m": 0, "congestion": 12, "accessibility": 98, "cost": "$22,000", "is_winner": True}
    ]

    return {
        "domain": "rescue",
        "verdict": verdict,
        "score": rescue_mission_score,
        "baseline_score": 84,
        "metrics": {
            "rescue_time": {"current": 11.5, "proposed": rescue_time_min, "delta": round(rescue_time_min - 11.5, 1), "unit": "min", "status": "bad"},
            "responder_risk": {"current": 25, "proposed": responder_risk_score, "delta": responder_risk_score - 25, "unit": "/100", "status": "bad" if responder_risk_score > 50 else "good"},
            "survivability_index": {"current": 95, "proposed": trapped_survivability_pct, "delta": trapped_survivability_pct - 95, "unit": "%", "status": "bad" if trapped_survivability_pct < 80 else "good"},
            "mission_viability": {"current": 84, "proposed": rescue_mission_score, "delta": rescue_mission_score - 84, "unit": "/100", "status": "bad" if rescue_mission_score < 70 else "good"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Hazard progression ({smoke_spread_rate} smoke spread) with {'Staircase B compromised' if staircase_b_blocked else 'staircases clear'}.",
            "primary_effect": f"Primary interior route severed for {trapped_occupants} occupants.",
            "secondary_effect": f"Rescue timeline extends to {rescue_time_min} minutes via alternate exterior vector.",
            "tertiary_effect": f"Responder risk index escalates to {responder_risk_score}/100.",
            "final_impact": f"Mission viability scored as {verdict} ({rescue_mission_score}/100)."
        }
    }


# -------------------------------------------------------------
# 7. ENVIRONMENTAL EXPOSURE (AIRSHIELD) SIMULATOR
# -------------------------------------------------------------
def simulate_environmental_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    wind_direction = parameters.get("wind_direction", "EAST")  # NORTH, SOUTH, EAST, WEST
    traffic_emission_surge_pct = parameters.get("traffic_emission_surge_pct", 50)
    industrial_plume_active = parameters.get("industrial_plume_active", True)
    
    # Exposure calculation (PM2.5 ug/m3)
    baseline_pm25 = 32.0
    plume_mult = 2.4 if industrial_plume_active and wind_direction in ["EAST", "NORTHEAST"] else 1.4
    simulated_pm25 = round(baseline_pm25 * (1 + traffic_emission_surge_pct / 100.0 * 0.6) * plume_mult, 1)
    
    pedestrian_cumulative_dose_ug = round(simulated_pm25 * 0.45 * 1.5, 1)
    high_exposure_zone_pct = min(88, int(15 + (simulated_pm25 / 100.0) * 45))
    environmental_score = max(20, min(95, int(100 - (simulated_pm25 * 0.45) - (high_exposure_zone_pct * 0.3))))
    
    verdict = "RECOMMENDED" if environmental_score >= 78 else "REVIEW" if environmental_score >= 55 else "AVOID"

    cascade = [
        {
            "id": "e1",
            "label": f"Industrial Plume Dispersal (Wind: {wind_direction})",
            "severity": "critical" if industrial_plume_active else "info",
            "time_min": 0,
            "impact": f"Particulate emission plume carried directly across pedestrian thoroughfare by {wind_direction} wind.",
            "evidence": "Microclimate atmospheric dispersion model."
        },
        {
            "id": "e2",
            "label": f"Traffic Emissions Inversion (+{traffic_emission_surge_pct}%)",
            "severity": "warning",
            "time_min": 12,
            "impact": "Diesel particulate concentrations spike along urban street canyons.",
            "evidence": "Street-level laser particulate counter."
        },
        {
            "id": "e3",
            "label": f"Ambient PM2.5 Peak ({simulated_pm25} µg/m³)",
            "severity": "critical" if simulated_pm25 > 60 else "warning",
            "time_min": 25,
            "impact": f"Air quality index enters UNHEALTHY tier across {high_exposure_zone_pct}% of sidewalk network.",
            "evidence": "WHO 24-hr guideline threshold exceeded."
        },
        {
            "id": "e4",
            "label": f"Pedestrian Personal Exposure Accumulation ({pedestrian_cumulative_dose_ug} µg Dose)",
            "severity": "critical" if pedestrian_cumulative_dose_ug > 40 else "warning",
            "time_min": 45,
            "impact": "Simulated pedestrian twin accumulates elevated respiratory exposure during 20-min transit.",
            "evidence": "Dynamic agent route integration."
        }
    ]

    what_breaks_first = [
        {"rank": 1, "failure_name": "School Transit Corridor Sidewalk", "time_min": 10, "severity": "CRITICAL", "affected_entity": "North Pedestrian Mall", "impact_summary": f"PM2.5 reaches {int(simulated_pm25*1.15)} µg/m³ directly in student walking zone."},
        {"rank": 2, "failure_name": "Transit Interchange Bus Bays", "time_min": 17, "severity": "HIGH", "affected_entity": "Bus Platform 02", "impact_summary": "Idling emissions trap localized particulate pocket under canopy."},
        {"rank": 3, "failure_name": "Civic Park Green Buffer Edge", "time_min": 30, "severity": "MEDIUM", "affected_entity": "South Park Trail", "impact_summary": "Vegetation barrier capacity saturated by steady plume drift."}
    ]

    timeline = []
    for t in [0, 10, 20, 30, 60]:
        timeline.append({
            "t": t,
            "pm25_concentration": round(min(simulated_pm25, baseline_pm25 + (simulated_pm25 - baseline_pm25) * (t / 60.0)), 1),
            "high_exposure_area_pct": min(high_exposure_zone_pct, int(15 + (high_exposure_zone_pct - 15) * (t / 60.0))),
            "cumulative_agent_dose": round(pedestrian_cumulative_dose_ug * (t / 60.0), 1),
            "air_quality_index": min(280, int(65 + simulated_pm25 * 1.8 * (t / 60.0)))
        })

    pareto = [
        {"id": "env_opt_a", "name": "Deploy Micro-Misting Tree Canopy & Route Buffers", "strategy": "CANOPY_SCRUB", "score": 88, "walking_m": 0, "congestion": 32, "accessibility": 90, "cost": "$12,000", "is_winner": False},
        {"id": "env_opt_b", "name": "Reroute Pedestrian Spine via Shielded Interior Arcade", "strategy": "CLEAN_ARCADE", "score": 93, "walking_m": 0, "congestion": 24, "accessibility": 95, "cost": "$18,500", "is_winner": False},
        {"id": "env_opt_c", "name": "Smart Bio-Filter Wall + Dynamic Traffic Low-Emission Diversion", "strategy": "PARETO_AIRSHIELD", "score": 97, "walking_m": 0, "congestion": 16, "accessibility": 98, "cost": "$28,000", "is_winner": True}
    ]

    return {
        "domain": "environmental",
        "verdict": verdict,
        "score": environmental_score,
        "baseline_score": 86,
        "metrics": {
            "pm25_level": {"current": baseline_pm25, "proposed": simulated_pm25, "delta": round(simulated_pm25 - baseline_pm25, 1), "unit": "µg/m³", "status": "bad"},
            "exposure_zone_pct": {"current": 15, "proposed": high_exposure_zone_pct, "delta": high_exposure_zone_pct - 15, "unit": "%", "status": "bad" if high_exposure_zone_pct > 40 else "neutral"},
            "pedestrian_dose": {"current": 18.0, "proposed": pedestrian_cumulative_dose_ug, "delta": round(pedestrian_cumulative_dose_ug - 18.0, 1), "unit": "µg", "status": "bad" if pedestrian_cumulative_dose_ug > 35 else "good"},
            "air_quality_score": {"current": 86, "proposed": environmental_score, "delta": environmental_score - 86, "unit": "/100", "status": "bad" if environmental_score < 70 else "good"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Plume dispersion driven by {wind_direction} wind with +{traffic_emission_surge_pct}% traffic emissions.",
            "primary_effect": f"Ambient PM2.5 levels climb to {simulated_pm25} µg/m³.",
            "secondary_effect": f"{high_exposure_zone_pct}% of pedestrian pathways enter elevated exposure zone.",
            "tertiary_effect": f"Personal exposure dose reaches {pedestrian_cumulative_dose_ug} µg per trip.",
            "final_impact": f"Environmental health impact score evaluated as {verdict} ({environmental_score}/100)."
        }
    }


# -------------------------------------------------------------
# 8. INFRASTRUCTURE RESILIENCE (INFRASTRUCTURE ORACLE) SIMULATOR
# -------------------------------------------------------------
def simulate_infrastructure_domain(
    world_data: Dict[str, Any],
    mutation: Dict[str, Any],
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    failed_node_id = parameters.get("failed_node_id", "substation_4")
    grid_load_surge_pct = parameters.get("grid_load_surge_pct", 35)
    maintenance_delayed = parameters.get("maintenance_delayed", True)
    
    # Propagation metrics
    cascade_depth = 4 if maintenance_delayed else 2
    compromised_nodes_count = min(12, int(2 + (grid_load_surge_pct / 100.0) * 6 + (3 if maintenance_delayed else 0)))
    system_stress_pct = min(100, int(42 + grid_load_surge_pct * 0.85 + (18 if maintenance_delayed else 0)))
    grid_resilience_score = max(18, min(96, int(100 - (system_stress_pct * 0.65) - (compromised_nodes_count * 3))))
    
    verdict = "RECOMMENDED" if grid_resilience_score >= 80 else "REVIEW" if grid_resilience_score >= 55 else "AVOID"

    cascade = [
        {
            "id": "i1",
            "label": f"Primary Component Failure ({failed_node_id.upper()})",
            "severity": "critical",
            "time_min": 0,
            "impact": f"Thermal trip takes {failed_node_id} offline under {grid_load_surge_pct}% grid load surge.",
            "evidence": "SCADA breaker trip alert."
        },
        {
            "id": "i2",
            "label": "Dynamic Load Redistribution to Feeder Nodes",
            "severity": "warning",
            "time_min": 8,
            "impact": "Surrounding feeder lines absorb +68% excess load, reaching 94% thermal threshold.",
            "evidence": "Transformer temperature telemetry."
        },
        {
            "id": "i3",
            "label": f"Secondary Propagation Cascade ({compromised_nodes_count} Nodes Stressed)",
            "severity": "critical" if compromised_nodes_count > 5 else "warning",
            "time_min": 19,
            "impact": "Municipal Water Pumping Station 2 and Transit Signaling lose primary feed.",
            "evidence": "Inter-dependent utility DAG propagation."
        },
        {
            "id": "i4",
            "label": f"Systemic Service Outage Risk ({system_stress_pct}% Grid Stress)",
            "severity": "critical" if system_stress_pct > 75 else "warning",
            "time_min": 38,
            "impact": "Cascading blackout threat across 3 residential wards without isolation intervention.",
            "evidence": "Grid stability impedance analysis."
        }
    ]

    what_breaks_first = [
        {"rank": 1, "failure_name": "Substation 04 Main Transformer", "time_min": 0, "severity": "CRITICAL", "affected_entity": "Substation 04", "impact_summary": "Thermal overload trips primary high-voltage breaker."},
        {"rank": 2, "failure_name": "Municipal Water Pumping Station 02", "time_min": 12, "severity": "HIGH", "affected_entity": "Pumping Station 02", "impact_summary": "Loss of feeder power cuts pressure to fire hydrant grid."},
        {"rank": 3, "failure_name": "Central Transit Signaling Grid", "time_min": 24, "severity": "CRITICAL", "affected_entity": "Signaling Node B", "impact_summary": "Backup UPS battery capacity depletes to 20%."}
    ]

    timeline = []
    for t in [0, 10, 20, 30, 60]:
        timeline.append({
            "t": t,
            "nodes_compromised": min(compromised_nodes_count, int(1 + (compromised_nodes_count - 1) * (t / 60.0))),
            "system_stress_pct": min(100, int(42 + (system_stress_pct - 42) * (t / 60.0))),
            "power_loss_mwh": round(1.2 * (t / 60.0 + 0.1) * (grid_load_surge_pct / 20.0), 2),
            "unserved_customers": int(8500 * (t / 60.0))
        })

    pareto = [
        {"id": "inf_opt_a", "name": "Automated Fast-Isolate Switch + Load Shedding Tier 1", "strategy": "FAST_ISOLATION", "score": 89, "walking_m": 0, "congestion": 28, "accessibility": 90, "cost": "$15,000", "is_winner": False},
        {"id": "inf_opt_b", "name": "Deploy Microgrid Battery Storage Buffer at Substation 4", "strategy": "BATTERY_BUFFER", "score": 94, "walking_m": 0, "congestion": 20, "accessibility": 95, "cost": "$42,000", "is_winner": False},
        {"id": "inf_opt_c", "name": "Self-Healing Mesh Topo + Automated Redundant Feeder Ring", "strategy": "PARETO_ORACLE", "score": 98, "walking_m": 0, "congestion": 14, "accessibility": 98, "cost": "$65,000", "is_winner": True}
    ]

    return {
        "domain": "infrastructure",
        "verdict": verdict,
        "score": grid_resilience_score,
        "baseline_score": 88,
        "metrics": {
            "compromised_nodes": {"current": 0, "proposed": compromised_nodes_count, "delta": compromised_nodes_count, "unit": "nodes", "status": "bad"},
            "grid_stress": {"current": 42, "proposed": system_stress_pct, "delta": system_stress_pct - 42, "unit": "%", "status": "bad" if system_stress_pct > 65 else "good"},
            "cascade_depth": {"current": 1, "proposed": cascade_depth, "delta": cascade_depth - 1, "unit": "levels", "status": "bad" if cascade_depth > 2 else "good"},
            "resilience_score": {"current": 88, "proposed": grid_resilience_score, "delta": grid_resilience_score - 88, "unit": "/100", "status": "bad" if grid_resilience_score < 70 else "good"}
        },
        "cascade": cascade,
        "what_breaks_first": what_breaks_first,
        "timeline": timeline,
        "pareto_alternatives": pareto,
        "explanation": {
            "cause": f"Primary trip of {failed_node_id} under +{grid_load_surge_pct}% grid load with {'maintenance backlog' if maintenance_delayed else 'active maintenance'}.",
            "primary_effect": "Impedance shock causes feeder lines to absorb 68% excess load.",
            "secondary_effect": f"{compromised_nodes_count} interconnected utility nodes experience voltage degradation.",
            "tertiary_effect": "Water pumping station 2 and transit signals lose primary power.",
            "final_impact": f"Systemic infrastructure resilience evaluated as {verdict} ({grid_resilience_score}/100)."
        }
    }


# Router dispatcher mapping domain names to their simulator functions
DOMAIN_DISPATCHER = {
    "spatial": simulate_spatial_domain,
    "disaster": simulate_disaster_domain,
    "healthcare": simulate_healthcare_domain,
    "road": simulate_road_domain,
    "crowd": simulate_crowd_domain,
    "rescue": simulate_rescue_domain,
    "environmental": simulate_environmental_domain,
    "infrastructure": simulate_infrastructure_domain
}
