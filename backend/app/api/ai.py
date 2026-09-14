from fastapi import APIRouter
from typing import Dict, Any, Optional
from ..schemas import (
    ScenarioRequest,
    SpatialAIOutput,
    SpatialAIInput,
    AIStatusResponse,
    AIAnalyzeRequest,
    IntentParseRequest,
    Point
)
from ..simulation.engine import run_full_simulation
from ..ai import get_spatial_ai_provider, get_ai_status, get_ai_provider_info
from ..ai.service import build_spatial_ai_input
from ..ai.recommendation import (
    generate_ai_spatial_recommendation,
    AIRecommendationResponse
)
from ..ai.intent_parser import parse_spatial_intent, SpatialIntentResponse

router = APIRouter(prefix="/api/ai", tags=["AI Reasoning"])

@router.post("/parse", response_model=SpatialIntentResponse)
def parse_intent_endpoint(req: IntentParseRequest) -> SpatialIntentResponse:
    """
    Parses natural language What-If queries into structured spatial intent and mutations.
    """
    return parse_spatial_intent(req.query, req.environment_id, req.language)


@router.get("/status", response_model=AIStatusResponse)
def get_status() -> AIStatusResponse:
    """
    Returns public status and active AI provider state without exposing API keys.
    """
    info = get_ai_status()
    return AIStatusResponse(**info)

@router.get("/provider")
def get_provider_status() -> Dict[str, Any]:
    """
    Backward-compatible alias for provider metadata.
    """
    return get_ai_provider_info()

@router.post("/analyze", response_model=SpatialAIOutput)
def analyze_spatial_configuration(req: ScenarioRequest):
    """
    Executes physical multi-agent simulation and synthesizes AI spatial reasoning.
    Accepts scenario definitions, computes exact deterministic metrics, and returns
    structured AI decision intelligence.
    """
    sim_result = run_full_simulation(req)
    return sim_result.ai_analysis

@router.post("/recommend", response_model=AIRecommendationResponse)
def recommend_spatial_layout(req: ScenarioRequest) -> AIRecommendationResponse:
    """
    Analyzes physical space constraints, circulation spines, and accessibility requirements
    to suggest an optimal improved placement coordinate.
    """
    sim_result = run_full_simulation(req)
    return generate_ai_spatial_recommendation(
        environment_id=req.environment_id,
        object_id=req.object_id or "registration",
        object_name=req.object_name,
        current_proposal=req.to_position,
        baseline_position=req.from_position,
        current_score=sim_result.score,
        objects=req.objects
    )
