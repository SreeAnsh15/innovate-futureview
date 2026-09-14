import json
import uuid
import datetime
from typing import Dict, Any, Optional
from ..storage.database import get_db
from ..schemas import (
    ReportCreateRequest,
    ScenarioRequest
)
from ..simulation.engine import run_full_simulation

def generate_decision_report(req: ReportCreateRequest) -> Dict[str, Any]:
    report_id = "FV-REP-" + uuid.uuid4().hex[:8].upper()
    now_str = datetime.datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")

    # If full scenario request passed, run simulation
    if req.scenario_request:
        sim_result = run_full_simulation(req.scenario_request)
        object_name = req.scenario_request.object_name
        env_id = req.scenario_request.environment_id
    else:
        # Fallback simulation
        sim_req = ScenarioRequest(environment_id=req.environment_id)
        sim_result = run_full_simulation(sim_req)
        object_name = sim_req.object_name
        env_id = req.environment_id

    title = req.title or f"FUTUREVIEW Spatial Decision Report — {object_name} Optimization"

    exec_summary = (
        f"This executive decision report provides quantitative impact predictions for altering the spatial placement of "
        f"{object_name} within {env_id}. Based on deterministic multi-agent simulation and AI spatial analysis, "
        f"the proposed change yields a composite score of {sim_result.score}/100 (vs baseline of {sim_result.baseline_score}/100) "
        f"with a final verdict of [{sim_result.verdict}]."
    )

    report_data = {
        "report_id": report_id,
        "title": title,
        "environment_id": env_id,
        "generated_at": now_str,
        "executive_summary": exec_summary,
        "verdict": sim_result.verdict,
        "severity": sim_result.severity,
        "score": sim_result.score,
        "baseline_score": sim_result.baseline_score,
        "metrics": sim_result.metrics.model_dump(),
        "ai_analysis": sim_result.ai_analysis.model_dump(),
        "recommendations": {
            "primary": sim_result.ai_analysis.recommended_action,
            "alternative": sim_result.ai_analysis.alternative_suggestion,
            "positive_impacts": sim_result.ai_analysis.positive_impacts,
            "negative_impacts": sim_result.ai_analysis.negative_impacts,
            "affected_groups": sim_result.ai_analysis.affected_user_groups
        },
        "disclaimer": "This report is generated for spatial planning decision-support and predictive consequence analysis."
    }

    # Save to database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO reports (
        id, scenario_id, environment_id, title, executive_summary,
        metrics_json, ai_analysis_json, recommendations_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        report_id, req.scenario_id or "adhoc", env_id, title, exec_summary,
        json.dumps(sim_result.metrics.model_dump()),
        json.dumps(sim_result.ai_analysis.model_dump()),
        json.dumps(report_data["recommendations"])
    ))
    conn.commit()
    conn.close()

    return report_data

def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    r = cursor.fetchone()
    conn.close()

    if not r:
        return None

    return {
        "report_id": r["id"],
        "scenario_id": r["scenario_id"],
        "environment_id": r["environment_id"],
        "title": r["title"],
        "executive_summary": r["executive_summary"],
        "metrics": json.loads(r["metrics_json"]),
        "ai_analysis": json.loads(r["ai_analysis_json"]),
        "recommendations": json.loads(r["recommendations_json"]),
        "created_at": str(r["created_at"])
    }
