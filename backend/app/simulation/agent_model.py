from typing import Dict, Any, List
from pydantic import BaseModel

class AgentArchetype(BaseModel):
    id: str
    name: str
    speed_ms: float
    mobility_score: float  # 0 to 1
    distance_tolerance_m: float
    route_priority: str
    color: str
    description: str

AGENT_ARCHETYPES: Dict[str, AgentArchetype] = {
    "visitor": AgentArchetype(
        id="visitor",
        name="Regular Visitor",
        speed_ms=1.35,
        mobility_score=1.0,
        distance_tolerance_m=150.0,
        route_priority="direct",
        color="#50ddff",
        description="Standard adult visitor walking at normal speed seeking main destination."
    ),
    "elderly": AgentArchetype(
        id="elderly",
        name="Elderly Visitor",
        speed_ms=0.85,
        mobility_score=0.65,
        distance_tolerance_m=65.0,
        route_priority="rest_stops",
        color="#ffc765",
        description="Paces slowly, requires frequent resting benches, sensitive to long corridors."
    ),
    "wheelchair": AgentArchetype(
        id="wheelchair",
        name="Wheelchair User",
        speed_ms=1.0,
        mobility_score=0.75,
        distance_tolerance_m=90.0,
        route_priority="accessible_wide",
        color="#4fe0a4",
        description="Requires wide aisles (>1.8m), zero stair tolerance, sensitive to corner turns."
    ),
    "emergency": AgentArchetype(
        id="emergency",
        name="Emergency Patient / First Responder",
        speed_ms=2.1,
        mobility_score=0.9,
        distance_tolerance_m=300.0,
        route_priority="express_critical",
        color="#ff647b",
        description="Urgent transit to critical care areas. High penalty for congestion choke points."
    ),
    "staff": AgentArchetype(
        id="staff",
        name="Staff / Clinician",
        speed_ms=1.55,
        mobility_score=1.0,
        distance_tolerance_m=250.0,
        route_priority="service_corridor",
        color="#a78bfa",
        description="Frequent bidirectional circulation between desks, triage, and back offices."
    ),
    "family": AgentArchetype(
        id="family",
        name="Family Group (2-3 People)",
        speed_ms=1.05,
        mobility_score=0.85,
        distance_tolerance_m=110.0,
        route_priority="wide_group",
        color="#f472b6",
        description="Travels in clusters, occupies larger spatial footprint (2.2m), slower through bottlenecks."
    )
}

def get_archetype_mix(total_agents: int = 15, custom_distribution: Dict[str, float] = None) -> List[AgentArchetype]:
    if custom_distribution:
        mix_distribution = list(custom_distribution.items())
    else:
        mix_distribution = [
            ("visitor", 0.35),
            ("elderly", 0.18),
            ("wheelchair", 0.12),
            ("family", 0.15),
            ("staff", 0.12),
            ("emergency", 0.08)
        ]
    agents = []
    for arch_id, ratio in mix_distribution:
        arch = AGENT_ARCHETYPES.get(arch_id, AGENT_ARCHETYPES["visitor"])
        count = max(1, int(round(total_agents * ratio)))
        for _ in range(count):
            agents.append(arch)
            
    # Guarantee exact count
    while len(agents) < total_agents:
        agents.append(AGENT_ARCHETYPES["visitor"])
    return agents[:total_agents]
