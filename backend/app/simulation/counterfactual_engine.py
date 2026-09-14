"""
FUTUREVIEW COMMON COUNTERFACTUAL ENGINE
Unified Engine implementing the Core Intelligence Pipeline:
OBSERVE -> MODEL -> UNDERSTAND -> PREDICT -> COUNTERFACTUAL -> SIMULATE -> DETECT CASCADES -> EXPLAIN -> INTERVENE -> COMPARE -> DECIDE -> AUDIT
"""

import uuid
import datetime
from typing import Dict, Any, List, Optional
from .domain_simulators import DOMAIN_DISPATCHER, simulate_spatial_domain

# -------------------------------------------------------------
# UNIVERSAL WORLD BENCHMARKS (CURATED REAL-WORLD DOMAIN ENVIRONMENTS)
# -------------------------------------------------------------
UNIVERSAL_WORLDS: List[Dict[str, Any]] = [
    {
        "id": "hospital-demo",
        "name": "MetroCare Emergency Department",
        "domain": "healthcare",
        "supported_domains": ["spatial", "healthcare", "disaster", "rescue"],
        "type": "Healthcare Facility",
        "size": "120 × 80 m",
        "width_m": 120.0,
        "height_m": 80.0,
        "summary": "Full-scale tertiary hospital outpatient wing, triage bays, ICU wards, CT imaging lab, and emergency ambulance dock.",
        "primary_what_if": "What if emergency arrivals surge by 45% and CT Scanner 1 goes offline?",
        "zones": [
            {"id": "z_ent", "name": "Main Ingress Foyer", "color": "#38bdf8", "x1": 5, "y1": 35, "x2": 25, "y2": 55},
            {"id": "z_triage", "name": "Emergency Triage Spine", "color": "#f43f5e", "x1": 25, "y1": 35, "x2": 50, "y2": 65},
            {"id": "z_icu", "name": "Critical Care ICU", "color": "#a855f7", "x1": 65, "y1": 15, "x2": 95, "y2": 45},
            {"id": "z_pharma", "name": "Outpatient Pharmacy", "color": "#10b981", "x1": 65, "y1": 50, "x2": 95, "y2": 75}
        ],
        "objects": [
            {"id": "entrance_main", "name": "Main Entrance Ramp", "kind": "entrance", "x": 10, "y": 45, "w": 12, "h": 14, "movable": False},
            {"id": "registration", "name": "Registration Desk", "kind": "service", "x": 38, "y": 40, "w": 14, "h": 8, "movable": True},
            {"id": "triage_bay", "name": "Triage Assessment Bay", "kind": "critical", "x": 42, "y": 55, "w": 14, "h": 10, "movable": True},
            {"id": "ct_scanner", "name": "CT Scanner Lab 01", "kind": "service", "x": 68, "y": 30, "w": 14, "h": 12, "movable": False},
            {"id": "icu_ward", "name": "Inpatient ICU Beds", "kind": "room", "x": 82, "y": 28, "w": 18, "h": 14, "movable": False},
            {"id": "emergency_exit", "name": "Emergency Egress Port", "kind": "exit", "x": 90, "y": 75, "w": 10, "h": 12, "movable": False}
        ]
    },
    {
        "id": "urban-disaster",
        "name": "Riverfront Metropolitan Crisis Zone",
        "domain": "disaster",
        "supported_domains": ["disaster", "rescue", "road", "spatial"],
        "type": "Urban River Basin",
        "size": "250 × 180 m",
        "width_m": 250.0,
        "height_m": 180.0,
        "summary": "Dense urban arterial river basin with low-elevation floodplains, bridges, medical centers, and emergency relief shelters.",
        "primary_what_if": "What if river rises 1.8m and North River Bridge access is severed?",
        "zones": [
            {"id": "z_basin", "name": "River Inundation Basin", "color": "#0284c7", "x1": 10, "y1": 40, "x2": 90, "y2": 60},
            {"id": "z_civic", "name": "High-Ground Civic Shelter", "color": "#10b981", "x1": 60, "y1": 10, "x2": 95, "y2": 35},
            {"id": "z_trauma", "name": "Regional Trauma Center", "color": "#f43f5e", "x1": 10, "y1": 65, "x2": 45, "y2": 95}
        ],
        "objects": [
            {"id": "bridge_north", "name": "North River Bridge", "kind": "service", "x": 50, "y": 50, "w": 18, "h": 10, "movable": True},
            {"id": "shelter_a", "name": "Civic Relief Shelter A", "kind": "room", "x": 78, "y": 22, "w": 16, "h": 12, "movable": False},
            {"id": "shelter_b", "name": "East High School Shelter", "kind": "room", "x": 82, "y": 80, "w": 16, "h": 12, "movable": False},
            {"id": "hospital_dock", "name": "Hospital Ambulance Ingress", "kind": "entrance", "x": 28, "y": 80, "w": 14, "h": 10, "movable": False}
        ]
    },
    {
        "id": "city-intersection",
        "name": "Grand Avenue Multi-Modal Junction",
        "domain": "road",
        "supported_domains": ["road", "environmental", "spatial"],
        "type": "Urban Arterial Intersection",
        "size": "100 × 100 m",
        "width_m": 100.0,
        "height_m": 100.0,
        "summary": "High-volume dual-carriageway crossing with high-density pedestrian zebra crossings, dedicated cycleways, and transit bus lanes.",
        "primary_what_if": "What if vehicle traffic surges 40% during heavy rain with 45s signal cycle?",
        "zones": [
            {"id": "z_cross", "name": "Pedestrian Crosswalk Spine", "color": "#fbbf24", "x1": 35, "y1": 35, "x2": 65, "y2": 65},
            {"id": "z_bike", "name": "Protected Cycle Track", "color": "#34d399", "x1": 5, "y1": 5, "x2": 95, "y2": 25}
        ],
        "objects": [
            {"id": "crosswalk_west", "name": "West Pedestrian Crossing", "kind": "service", "x": 35, "y": 50, "w": 10, "h": 20, "movable": True},
            {"id": "signal_controller", "name": "Master Signal Controller", "kind": "service", "x": 65, "y": 35, "w": 8, "h": 8, "movable": True},
            {"id": "bus_stop", "name": "Grand Transit Bus Bay", "kind": "room", "x": 20, "y": 20, "w": 16, "h": 8, "movable": False}
        ]
    },
    {
        "id": "stadium-arena",
        "name": "National Sports & Festival Arena",
        "domain": "crowd",
        "supported_domains": ["crowd", "spatial", "disaster", "rescue"],
        "type": "Mega Event Arena",
        "size": "200 × 150 m",
        "width_m": 200.0,
        "height_m": 150.0,
        "summary": "35,000 capacity stadium bowl, perimeter security turnstile gates, central concourse ring, and emergency egress aprons.",
        "primary_what_if": "What if Gate A turnstiles close during 850 visitors/min peak surge?",
        "zones": [
            {"id": "z_concourse", "name": "Main Circular Concourse", "color": "#38bdf8", "x1": 20, "y1": 20, "x2": 80, "y2": 80},
            {"id": "z_gate_a", "name": "Gate A Security Plaza", "color": "#f43f5e", "x1": 5, "y1": 40, "x2": 20, "y2": 60},
            {"id": "z_gate_b", "name": "Gate B Auxiliary Plaza", "color": "#10b981", "x1": 80, "y1": 40, "x2": 95, "y2": 60}
        ],
        "objects": [
            {"id": "gate_a", "name": "Gate A Primary Turnstiles", "kind": "entrance", "x": 12, "y": 50, "w": 10, "h": 18, "movable": True},
            {"id": "gate_b", "name": "Gate B Turnstiles", "kind": "entrance", "x": 88, "y": 50, "w": 10, "h": 18, "movable": True},
            {"id": "stadium_bowl", "name": "Central Arena Seating", "kind": "room", "x": 50, "y": 50, "w": 40, "h": 30, "movable": False}
        ]
    },
    {
        "id": "highrise-rescue",
        "name": "SkyTower Commercial & Residential Complex",
        "domain": "rescue",
        "supported_domains": ["rescue", "spatial", "disaster"],
        "type": "High-Rise Mixed-Use",
        "size": "80 × 80 m",
        "width_m": 80.0,
        "height_m": 80.0,
        "summary": "45-story commercial tower with central atrium, pressurized stairwells, refuge floors, and rooftop helipad.",
        "primary_what_if": "What if Staircase B is compromised by rapid smoke spread on Floor 3?",
        "zones": [
            {"id": "z_atrium", "name": "Central Atrium Void", "color": "#f97316", "x1": 35, "y1": 35, "x2": 65, "y2": 65},
            {"id": "z_stair_a", "name": "Pressurized Stairwell A", "color": "#10b981", "x1": 20, "y1": 20, "x2": 32, "y2": 35},
            {"id": "z_stair_b", "name": "Secondary Stairwell B", "color": "#ef4444", "x1": 68, "y1": 65, "x2": 80, "y2": 80}
        ],
        "objects": [
            {"id": "stair_a", "name": "Stairwell A Core", "kind": "exit", "x": 26, "y": 28, "w": 10, "h": 12, "movable": False},
            {"id": "stair_b", "name": "Stairwell B Core", "kind": "service", "x": 74, "y": 72, "w": 10, "h": 12, "movable": True},
            {"id": "refuge_zone", "name": "Floor 4 Refuge Compartment", "kind": "room", "x": 50, "y": 20, "w": 18, "h": 10, "movable": False}
        ]
    },
    {
        "id": "industrial-district",
        "name": "East Industrial & Academic Buffer District",
        "domain": "environmental",
        "supported_domains": ["environmental", "road", "spatial"],
        "type": "Urban Industrial Perimeter",
        "size": "300 × 200 m",
        "width_m": 300.0,
        "height_m": 200.0,
        "summary": "Mixed industrial manufacturing plants adjacent to school transit corridors, residential greenways, and logistics yards.",
        "primary_what_if": "What if industrial plume disperses with East wind under +50% diesel truck emissions?",
        "zones": [
            {"id": "z_plant", "name": "Manufacturing Complex", "color": "#64748b", "x1": 10, "y1": 20, "x2": 45, "y2": 60},
            {"id": "z_school", "name": "Public School & Campus", "color": "#38bdf8", "x1": 65, "y1": 40, "x2": 95, "y2": 85},
            {"id": "z_green", "name": "Civic Buffer Parkland", "color": "#22c55e", "x1": 45, "y1": 20, "x2": 65, "y2": 90}
        ],
        "objects": [
            {"id": "exhaust_stack", "name": "Primary Industrial Chimney", "kind": "service", "x": 25, "y": 40, "w": 12, "h": 12, "movable": True},
            {"id": "school_gate", "name": "School Ingress Walkway", "kind": "entrance", "x": 75, "y": 60, "w": 12, "h": 10, "movable": False},
            {"id": "freight_corridor", "name": "Heavy Vehicle Freight Road", "kind": "service", "x": 50, "y": 50, "w": 10, "h": 30, "movable": False}
        ]
    },
    {
        "id": "power-water-grid",
        "name": "Metropolitan Power & Municipal Utility Grid",
        "domain": "infrastructure",
        "supported_domains": ["infrastructure", "disaster", "spatial"],
        "type": "Connected Infrastructure Network",
        "size": "500 × 400 m",
        "width_m": 500.0,
        "height_m": 400.0,
        "summary": "Interconnected high-voltage power transmission substations, water pumping mains, telemetry towers, and hospital backup feeders.",
        "primary_what_if": "What if Substation 4 trips under +35% grid load with deferred maintenance?",
        "zones": [
            {"id": "z_grid_north", "name": "Northern Power Grid Ring", "color": "#f59e0b", "x1": 10, "y1": 10, "x2": 50, "y2": 50},
            {"id": "z_water_south", "name": "Southern Water Treatment Core", "color": "#06b6d4", "x1": 50, "y1": 50, "x2": 95, "y2": 95}
        ],
        "objects": [
            {"id": "substation_4", "name": "Primary Substation 04", "kind": "critical", "x": 30, "y": 30, "w": 14, "h": 14, "movable": True},
            {"id": "pumping_station_2", "name": "Water Pumping Station 02", "kind": "service", "x": 70, "y": 70, "w": 16, "h": 12, "movable": False},
            {"id": "hospital_feeder", "name": "Emergency Hospital Power Feeder", "kind": "service", "x": 45, "y": 65, "w": 12, "h": 10, "movable": False}
        ]
    }
]

# -------------------------------------------------------------
# COUNTERFACTUAL SIMULATION RUNNER
# -------------------------------------------------------------
def run_counterfactual_simulation(
    domain: str,
    world_id: str,
    mutation: Optional[Dict[str, Any]] = None,
    parameters: Optional[Dict[str, Any]] = None,
    scenario_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes a deterministic counterfactual simulation for ANY of the 8 intelligence domains.
    Returns structured telemetry, metrics, causal cascade, timeline frames, and Pareto alternatives.
    """
    domain_key = (domain or "spatial").lower()
    if domain_key not in DOMAIN_DISPATCHER:
        domain_key = "spatial"

    # Find world
    world = next((w for w in UNIVERSAL_WORLDS if w["id"] == world_id), UNIVERSAL_WORLDS[0])
    
    mut = mutation or {
        "to_position": {"x": 75.0, "y": 45.0},
        "action": "modify_condition"
    }
    params = parameters or {}
    
    # Execute domain specific model
    sim_func = DOMAIN_DISPATCHER[domain_key]
    result = sim_func(world, mut, params)
    
    # Attach common execution metadata
    result["status"] = "success"
    result["world_id"] = world["id"]
    result["world_name"] = world["name"]
    result["scenario_id"] = f"scen-{uuid.uuid4().hex[:8]}"
    result["scenario_name"] = scenario_name or f"What-If: {world['name']}"
    result["generated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result["disclaimer"] = f"SIMULATED {domain_key.upper()} COUNTERFACTUAL ESTIMATE — AI SUGGESTS, SIMULATION VERIFIES, HUMANS DECIDE."
    
    # Aliases for frontend API normalization
    first_break = result.get("what_breaks_first", [{}])[0] if isinstance(result.get("what_breaks_first"), list) and len(result.get("what_breaks_first")) > 0 else {"component": "Primary Ingress Spine", "time_min": 8}
    if "failure_name" in first_break and "component" not in first_break:
        first_break["component"] = first_break["failure_name"]
    result["cascade_graph"] = {
        "cascade": result.get("cascade", []),
        "what_breaks_first": first_break
    }
    result["timeline_progression"] = result.get("timeline", [])
    result["pareto_solutions"] = result.get("pareto_alternatives", [])
    
    return result

def get_all_worlds() -> List[Dict[str, Any]]:
    return UNIVERSAL_WORLDS

def get_world_by_id(world_id: str) -> Optional[Dict[str, Any]]:
    return next((w for w in UNIVERSAL_WORLDS if w["id"] == world_id), None)
