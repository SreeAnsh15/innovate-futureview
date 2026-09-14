from fastapi import APIRouter
from typing import Dict, Any, Optional
from ..schemas import ScenarioRequest
from ..services.decision_service import (
    analyze_decision_support,
    DecisionWeights,
    DecisionAnalysisResponse
)

router = APIRouter(prefix="/api/decision", tags=["Decision Support"])

class DecisionAnalysisRequest(ScenarioRequest):
    custom_weights: Optional[DecisionWeights] = None

@router.post("/analyze", response_model=DecisionAnalysisResponse)
def analyze_decision(req: DecisionAnalysisRequest) -> DecisionAnalysisResponse:
    """
    Evaluates proposed spatial layout changes against baseline metrics using configurable
    decision weights and returns a weighted score, verdict, and comparative alternatives.
    """
    return analyze_decision_support(req, req.custom_weights)
