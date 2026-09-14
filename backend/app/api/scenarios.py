from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..schemas import (
    ScenarioResponse,
    ScenarioCreateRequest,
    ScenarioCompareRequest
)
from ..services.scenario_service import (
    get_scenarios_for_env,
    get_scenario_by_id,
    create_scenario,
    delete_scenario,
    compare_scenarios
)

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

@router.get("", response_model=List[ScenarioResponse])
def list_scenarios(environment_id: str = Query("hospital-demo")):
    return get_scenarios_for_env(environment_id)

@router.get("/{scenario_id}", response_model=ScenarioResponse)
def get_scenario(scenario_id: str):
    sc = get_scenario_by_id(scenario_id)
    if not sc:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")
    return sc

@router.post("", response_model=ScenarioResponse)
def save_scenario(req: ScenarioCreateRequest):
    return create_scenario(req)

@router.delete("/{scenario_id}")
def remove_scenario(scenario_id: str):
    success = delete_scenario(scenario_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")
    return {"status": "deleted", "scenario_id": scenario_id}

@router.post("/compare")
def compare_scenario_matrix(req: ScenarioCompareRequest):
    if not req.scenario_ids:
        raise HTTPException(status_code=400, detail="Must provide at least one scenario ID to compare.")
    return compare_scenarios(req.scenario_ids)
