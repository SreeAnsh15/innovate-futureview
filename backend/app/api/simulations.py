from fastapi import APIRouter, HTTPException
from ..schemas import (
    ScenarioRequest,
    SimulationResult
)
from ..simulation.engine import run_full_simulation

router = APIRouter(prefix="/api/simulations", tags=["Simulations"])

@router.post("", response_model=SimulationResult)
def create_simulation(req: ScenarioRequest):
    try:
        return run_full_simulation(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Simulation error: {str(e)}")
