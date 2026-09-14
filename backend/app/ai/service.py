from typing import Dict, Any, Optional
from ..schemas import (
    ScenarioRequest,
    SimulationResult,
    SpatialAIInput,
    SpatialAIOutput,
    AIStatusResponse
)
from .provider import SpatialAIProvider
from .local_provider import LocalSpatialAIProvider
from .gemini_provider import GeminiSpatialAIProvider
from . import get_spatial_ai_provider, get_ai_status

def build_spatial_ai_input(
    req: ScenarioRequest,
    sim_result: SimulationResult
) -> SpatialAIInput:
    """
    Transforms deterministic simulation results and scenario definitions into
    structured input for the Spatial AI Provider.
    """
    metrics = sim_result.metrics
    
    return SpatialAIInput(
        environment={
            "id": sim_result.environment_id,
            "object_count": len(req.objects) if req.objects else 0
        },
        zones=[],
        objects=[o.model_dump() for o in (req.objects or [])],
        agents=[a.model_dump() for a in sim_result.agents[:10]],
        routes=[p.model_dump() for p in (sim_result.proposed_route or [])[:15]],
        walking_distance={
            "current": metrics.walking_distance.current,
            "proposed": metrics.walking_distance.proposed,
            "delta": metrics.walking_distance.delta,
            "delta_pct": metrics.walking_distance.delta_pct,
            "unit": "meters"
        },
        congestion={
            "current": metrics.congestion.current,
            "proposed": metrics.congestion.proposed,
            "delta": metrics.congestion.delta,
            "unit": "index/100"
        },
        accessibility={
            "current": metrics.accessibility.current,
            "proposed": metrics.accessibility.proposed,
            "delta": metrics.accessibility.delta,
            "unit": "score/100"
        },
        safety={
            "current": metrics.safety.current,
            "proposed": metrics.safety.proposed,
            "delta": metrics.safety.delta,
            "unit": "score/100"
        },
        bottlenecks=[h.model_dump() for h in sim_result.heatmap if h.intensity > 60],
        scenario_change={
            "object_id": req.object_id,
            "object_name": req.object_name,
            "change_type": req.change_type,
            "from_position": req.from_position.model_dump(),
            "to_position": req.to_position.model_dump(),
            "users_per_hour": req.users_per_hour
        }
    )

def analyze_scenario_ai(
    req: ScenarioRequest,
    sim_result: SimulationResult,
    provider_override: Optional[str] = None
) -> SpatialAIOutput:
    """
    Executes AI Spatial Reasoning using the configured provider.
    """
    provider = get_spatial_ai_provider(provider_override)
    ai_input = build_spatial_ai_input(req, sim_result)
    return provider.analyze(ai_input)
