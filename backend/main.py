from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from simulation.grid import DEFAULT_LAYOUT_PATH
from simulation.layout_loader import load_world
from simulation.scenario import evaluate_layout


class SimulationRequest(BaseModel):
    x: float | None = None
    z: float | None = None


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "futureview-backend"}


@app.get("/api/layout/baseline")
def baseline_layout() -> Any:
    """Return the validated, renderer-ready baseline SpatialWorld."""
    return load_world(DEFAULT_LAYOUT_PATH).model_dump(by_alias=True)


@app.post("/api/simulate")
def simulate(request: SimulationRequest | None = None) -> dict[str, Any]:
    desk_position = None
    if request is not None and request.x is not None and request.z is not None:
        desk_position = {"x": request.x, "z": request.z}
    return evaluate_layout(desk_position)
