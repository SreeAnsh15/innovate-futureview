from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
from ..schemas import (
    EnvironmentSchema,
    EnvironmentCreateRequest,
    FloorPlanAnalysisResult
)
from ..services.environment_service import (
    get_all_environments,
    get_environment_by_id,
    create_or_update_environment,
    analyze_floor_plan_image
)

router = APIRouter(prefix="/api/environments", tags=["Environments"])

@router.get("", response_model=List[EnvironmentSchema])
def list_environments():
    return get_all_environments()

@router.get("/{env_id}", response_model=EnvironmentSchema)
def get_environment(env_id: str):
    env = get_environment_by_id(env_id)
    if not env:
        raise HTTPException(status_code=404, detail=f"Environment '{env_id}' not found.")
    return env

@router.post("", response_model=EnvironmentSchema)
def create_environment(req: EnvironmentCreateRequest):
    env_id = req.id if req.id else ("custom-env-" + uuid.uuid4().hex[:8])
    return create_or_update_environment(env_id, req)

@router.put("/{env_id}", response_model=EnvironmentSchema)
def update_environment(env_id: str, req: EnvironmentCreateRequest):
    return create_or_update_environment(env_id, req)

@router.post("/upload")
async def upload_environment_media(file: UploadFile = File(...)):
    content = await file.read()
    env_id = "uploaded-" + uuid.uuid4().hex[:8]
    return {
        "status": "success",
        "environment_id": env_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "bytes": len(content),
        "message": f"Successfully ingested {file.filename}. Ready for spatial zone annotation."
    }

@router.post("/analyze", response_model=FloorPlanAnalysisResult)
async def analyze_environment(file: UploadFile = File(...)):
    content = await file.read()
    return analyze_floor_plan_image(file.filename, content)
