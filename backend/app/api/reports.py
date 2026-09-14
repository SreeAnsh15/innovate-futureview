from fastapi import APIRouter, HTTPException
from ..schemas import ReportCreateRequest
from ..services.report_service import generate_decision_report, get_report_by_id

router = APIRouter(prefix="/api/reports", tags=["Decision Reports"])

@router.post("")
def create_report(req: ReportCreateRequest):
    return generate_decision_report(req)

@router.get("/{report_id}")
def get_report(report_id: str):
    rep = get_report_by_id(report_id)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
    return rep
