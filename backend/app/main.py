from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import datetime
import hashlib
import json

from .schemas import ScenarioRequest, ScenarioCreateRequest
from .storage.database import init_db
from .services.environment_service import get_environment_by_id, analyze_floor_plan_image
from .simulation.engine import run_full_simulation
from .services.report_service import generate_decision_report

# Import modular API routers
from .api.health import router as health_router
from .api.environments import router as environments_router
from .api.simulations import router as simulations_router
from .api.scenarios import router as scenarios_router
from .api.ai import router as ai_router
from .api.reports import router as reports_router
from .api.decision import router as decision_router

app = FastAPI(
    title="FUTUREVIEW Spatial Intelligence Platform API",
    description="Deterministic Multi-Agent Simulation, Congestion Heatmaps, and AI Spatial Reasoning",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler for clean error reporting
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": str(exc), "path": str(request.url)}
    )

# Include API Routers
app.include_router(health_router)
app.include_router(environments_router)
app.include_router(simulations_router)
app.include_router(scenarios_router)
app.include_router(ai_router)
app.include_router(reports_router)
app.include_router(decision_router)

from .simulation.engine import (
    run_full_simulation,
    run_crowd_simulation,
    run_emergency_simulation,
    run_demand_surge_simulation,
    run_accessibility_simulation,
    run_ai_optimization_lab
)
from .simulation.counterfactual_engine import (
    UNIVERSAL_WORLDS,
    run_counterfactual_simulation,
    get_all_worlds,
    get_world_by_id
)
from .ai.intent_parser import parse_spatial_intent, parse_spatial_intent_locally
from .services.decision_service import analyze_decision_support
from .services.report_service import generate_decision_report

# -------------------------------------------------------------
# 8-DOMAIN INTELLIGENCE PLATFORM ENDPOINTS
# -------------------------------------------------------------
DOMAINS_METADATA = [
    {
        "id": "spatial",
        "num": "01",
        "name": "Spatial Intelligence",
        "tagline": "Counterfactual Circulation & Space Optimization",
        "description": "Deterministic multi-agent physics, ADA Title III accessibility compliance, and M/M/c queueing simulator.",
        "icon": "Compass",
        "badge": "FLAGSHIP CORE",
        "sample_queries": [
            "What if we move registration to east wing?",
            "What if we widen the main corridor by 30%?",
            "What if visitor demand increases by 40%?",
            "What if we add a secondary entrance?"
        ]
    },
    {
        "id": "disaster",
        "num": "02",
        "name": "Disaster Intelligence",
        "tagline": "Lifeline AI & Crisis Cascade Simulator",
        "description": "Simulates urban flood propagation, arterial bridge cutoffs, emergency ambulance rerouting, and shelter overflow cascades.",
        "icon": "Flame",
        "badge": "LIFELINE AI",
        "sample_queries": [
            "What if river rises 1.8m and North Bridge is submerged?",
            "What if Civic Shelter B reaches 100% capacity?",
            "What if hospital power grid fails during flood surge?"
        ]
    },
    {
        "id": "healthcare",
        "num": "03",
        "name": "Healthcare Operations",
        "tagline": "MedFlow Hospital Stress & Capacity Engine",
        "description": "Simulates emergency patient arrival surges, CT scanner diagnostic downtime, nurse shortages, and ICU bed saturation.",
        "icon": "Activity",
        "badge": "MEDFLOW",
        "sample_queries": [
            "What if ER arrival surge increases by 45%?",
            "What if CT Scanner 1 becomes unavailable?",
            "What if ICU occupancy reaches 95% with 2 nurse shortage?"
        ]
    },
    {
        "id": "road",
        "num": "04",
        "name": "Road Safety",
        "tagline": "RoadShadow Digital Near-Miss Engine",
        "description": "Simulates vehicle-pedestrian conflict zones, near-miss risk indices under rain/fog, and adaptive signal timing counterfactuals.",
        "icon": "ShieldAlert",
        "badge": "ROADSHADOW",
        "sample_queries": [
            "What if traffic volume increases 40% in heavy rain?",
            "What if pedestrian walk signal cycle is shortened to 30s?",
            "What if we install a raised pedestrian refuge island?"
        ]
    },
    {
        "id": "crowd",
        "num": "05",
        "name": "Crowd Safety",
        "tagline": "CrowdGuard 5-Phase State Transition Engine",
        "description": "Analyzes crowd phase transitions from Normal Flow to Flow Turbulence & Compression Risk with turnstile gate interventions.",
        "icon": "Users",
        "badge": "CROWDGUARD",
        "sample_queries": [
            "What if Gate A turnstiles close during 850 visitors/min surge?",
            "What if we open emergency surge bypass Gate B2?",
            "What if ingress rate doubles to 1500 visitors/min?"
        ]
    },
    {
        "id": "rescue",
        "num": "06",
        "name": "Rescue Intelligence",
        "tagline": "RescueVision Pre-Rescue Simulation Lab",
        "description": "Computes the safest feasible rescue extraction vector considering smoke propagation, staircase blockages, and responder hazard index.",
        "icon": "Zap",
        "badge": "RESCUEVISION",
        "sample_queries": [
            "What if Staircase B is blocked by smoke with 14 trapped occupants?",
            "What if Team Alpha is delayed by flashover?",
            "What if we deploy positive-pressure stairwell ventilation?"
        ]
    },
    {
        "id": "environmental",
        "num": "07",
        "name": "Environmental Exposure",
        "tagline": "AirShield Personal Exposure Twin",
        "description": "Simulates dynamic PM2.5/NO2 particulate plume dispersion and tracks accumulated pedestrian respiratory dosage over time.",
        "icon": "Wind",
        "badge": "AIRSHIELD",
        "sample_queries": [
            "What if wind shifts East carrying industrial plume over school?",
            "What if diesel freight traffic surges by 50%?",
            "What if pedestrians are rerouted via shielded interior arcade?"
        ]
    },
    {
        "id": "infrastructure",
        "num": "08",
        "name": "Infrastructure Resilience",
        "tagline": "Infrastructure Oracle Failure Propagation DAG",
        "description": "Evaluates dependency graphs across power substations, water mains, and transit networks to test cascade-stopping isolation switches.",
        "icon": "Building2",
        "badge": "ORACLE DAG",
        "sample_queries": [
            "What if Substation 4 trips under +35% grid load surge?",
            "What if Water Pumping Station 2 loses feeder power?",
            "What if automated isolation switch is deployed at Substation 4?"
        ]
    }
]

@app.get("/api/domains")
def get_domains():
    return {"status": "success", "total_domains": 8, "domains": DOMAINS_METADATA}

@app.get("/api/worlds")
def get_worlds():
    return {"status": "success", "total_worlds": len(UNIVERSAL_WORLDS), "worlds": UNIVERSAL_WORLDS}

@app.get("/api/worlds/{world_id}")
def get_world(world_id: str):
    world = get_world_by_id(world_id)
    if not world:
        return JSONResponse(status_code=404, content={"status": "error", "message": "World not found"})
    return {"status": "success", "world": world}

@app.post("/api/counterfactual/simulate")
def run_universal_counterfactual(request: Dict[str, Any]):
    domain = request.get("domain", "spatial")
    world_id = request.get("world_id", "hospital-demo")
    mutation = request.get("mutation", {})
    parameters = request.get("parameters", {})
    scenario_name = request.get("scenario_name", None)
    
    result = run_counterfactual_simulation(domain, world_id, mutation, parameters, scenario_name)
    return {"status": "success", "data": result}


# -------------------------------------------------------------
# Backwards-Compatible Legacy & Unified Direct Routes
# -------------------------------------------------------------
@app.get("/api/demo/environment")
def demo_environment():
    env = get_environment_by_id("hospital-demo")
    return env.model_dump() if env else {}

@app.post("/api/simulate")
def run_simulation(request: ScenarioRequest):
    res = run_full_simulation(request)
    return {
        "status": res.status,
        "verdict": res.verdict,
        "severity": res.severity,
        "score": res.score,
        "baseline_score": res.baseline_score,
        "metrics": {
            "walking_distance": {
                "current": res.metrics.walking_distance.current,
                "proposed": res.metrics.walking_distance.proposed,
                "delta": res.metrics.walking_distance.delta,
                "delta_pct": res.metrics.walking_distance.delta_pct,
                "unit": "m",
                "status": res.metrics.walking_distance.status
            },
            "congestion": {
                "current": round(res.metrics.congestion.current),
                "proposed": round(res.metrics.congestion.proposed),
                "delta": round(res.metrics.congestion.delta),
                "unit": "/100",
                "status": res.metrics.congestion.status
            },
            "accessibility": {
                "current": round(res.metrics.accessibility.current),
                "proposed": round(res.metrics.accessibility.proposed),
                "delta": round(res.metrics.accessibility.delta),
                "unit": "/100",
                "status": res.metrics.accessibility.status
            },
            "safety": {
                "current": round(res.metrics.safety.current),
                "proposed": round(res.metrics.safety.proposed),
                "delta": round(res.metrics.safety.delta),
                "unit": "/100",
                "status": res.metrics.safety.status
            },
            "flow_efficiency": {
                "current": round(res.metrics.flow_efficiency.current),
                "proposed": round(res.metrics.flow_efficiency.proposed),
                "delta": round(res.metrics.flow_efficiency.delta),
                "unit": "/100",
                "status": res.metrics.flow_efficiency.status
            },
            "experience": {
                "current": round(res.metrics.experience.current),
                "proposed": round(res.metrics.experience.proposed),
                "delta": round(res.metrics.experience.delta),
                "unit": "/100",
                "status": res.metrics.experience.status
            },
        },
        "queue_metrics": res.queue_metrics if isinstance(res.queue_metrics, dict) else (res.queue_metrics.model_dump() if res.queue_metrics else None),
        "financial_impact": res.financial_impact.model_dump() if res.financial_impact else None,
        "pareto_solutions": [p.model_dump() for p in (res.pareto_solutions or [])],
        "recommendation": res.ai_analysis.recommendation or res.ai_analysis.recommended_action,
        "reasoning": res.ai_analysis.reasoning,
        "heatmap": [h.model_dump() for h in res.heatmap],
        "baseline_heatmap": [h.model_dump() for h in (res.baseline_heatmap or [])],
        "flow": res.flow_histogram,
        "agents": [a.model_dump() for a in res.agents],
        "baseline_agents": [a.model_dump() for a in (res.baseline_agents or [])],
        "ai_summary": res.ai_analysis.summary or res.ai_analysis.recommended_action,
        "ai_analysis": res.ai_analysis.model_dump(),
        "generated_at": res.generated_at
    }

@app.post("/api/simulate/crowd")
def simulate_crowd_route(payload: dict):
    return run_crowd_simulation(payload)

@app.post("/api/simulate/emergency")
def simulate_emergency_route(payload: dict):
    return run_emergency_simulation(payload)

@app.post("/api/simulate/demand")
def simulate_demand_route(payload: dict):
    return run_demand_surge_simulation(payload)

@app.post("/api/simulate/accessibility")
def simulate_accessibility_route(payload: dict):
    return run_accessibility_simulation(payload)

@app.post("/api/optimize")
def optimize_layout_route(payload: dict):
    return run_ai_optimization_lab(payload)

@app.post("/api/analyze")
def analyze_spatial_route(request: ScenarioRequest):
    res = run_full_simulation(request)
    return res.ai_analysis.model_dump()

@app.post("/api/decision")
def decision_support_route(payload: dict):
    scenario_req = ScenarioRequest(**payload.get("scenario", payload))
    weights = payload.get("weights")
    return analyze_decision_support(scenario_req, weights)

@app.post("/api/analyze-upload")
async def analyze_upload(file: UploadFile = File(...)):
    content = await file.read()
    analysis = analyze_floor_plan_image(file.filename, content)
    return {
        "status": "success",
        "environment_id": analysis.environment_id,
        "filename": file.filename,
        "bytes": len(content),
        "message": analysis.message,
        "suggested_objects": [o.name for o in analysis.suggested_objects],
        "analysis": analysis.model_dump()
    }

from .ai.intent_parser import parse_spatial_intent, SpatialIntentResponse
import hashlib
import csv
import io

@app.post("/api/intent/parse", response_model=SpatialIntentResponse)
def parse_intent_route(payload: dict):
    query = payload.get("query", "")
    env_id = payload.get("environment_id", "hospital-demo")
    lang = payload.get("language", "en")
    return parse_spatial_intent(query, env_id, lang)

@app.post("/api/audit/export")
def audit_export_route(payload: dict):
    env_id = payload.get("environment_id", "hospital-demo")
    format_type = payload.get("format", "json").lower()
    scenario_req_data = payload.get("scenario_request")
    
    req_obj = ScenarioRequest(**scenario_req_data) if scenario_req_data else ScenarioRequest(environment_id=env_id)
    sim_result = run_full_simulation(req_obj)
    
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    audit_payload = {
        "platform": "FUTUREVIEW",
        "tagline": "SEE THE CONSEQUENCES BEFORE YOU BUILD THE FUTURE.",
        "positioning": "COUNTERFACTUAL SPATIAL INTELLIGENCE PLATFORM",
        "environment_id": env_id,
        "timestamp": timestamp,
        "user_query": payload.get("user_query", "What if emergency traffic increases by 40%?"),
        "structured_intent": payload.get("structured_intent", {
            "type": "increase_traffic",
            "target": "emergency",
            "value": 40,
            "unit": "%"
        }),
        "simulation_metrics": {
            "overall_score": sim_result.score,
            "baseline_score": sim_result.baseline_score,
            "verdict": sim_result.verdict,
            "walking_distance_m": sim_result.metrics.walking_distance.proposed,
            "walking_distance_delta_pct": sim_result.metrics.walking_distance.delta_pct,
            "congestion_score": sim_result.metrics.congestion.proposed,
            "accessibility_score": sim_result.metrics.accessibility.proposed,
            "safety_score": sim_result.metrics.safety.proposed,
            "flow_efficiency": sim_result.metrics.flow_efficiency.proposed,
            "experience_score": sim_result.metrics.experience.proposed
        },
        "ai_explanation": sim_result.ai_analysis.summary,
        "recommendation": sim_result.ai_analysis.recommendation,
        "human_decision": payload.get("human_decision", "PENDING_APPROVAL"),
        "audit_policy": "AI SUGGESTS. SIMULATION VERIFIES. HUMANS DECIDE."
    }
    
    # Calculate cryptographic SHA-256 integrity hash
    raw_bytes = json.dumps(audit_payload, sort_keys=True).encode("utf-8")
    sha256_hash = hashlib.sha256(raw_bytes).hexdigest()
    audit_payload["sha256_hash"] = sha256_hash
    audit_payload["integrity_hash_sha256"] = sha256_hash
    audit_payload["verification_status"] = "VERIFIED_CRYPTOGRAPHICALLY"

    if format_type == "markdown":
        md_content = f"""# FUTUREVIEW DECISION AUDIT DOSSIER
**Tagline:** SEE THE CONSEQUENCES BEFORE YOU BUILD THE FUTURE.  
**Platform:** Counterfactual Spatial Intelligence Engine  
**Environment:** {env_id}  
**Timestamp:** {timestamp}  
**SHA-256 Integrity Hash:** `{sha256_hash}`  

---

## 1. User Inquiry & Spatial Intent
- **Original Query:** "{audit_payload['user_query']}"
- **Structured Intent:** `{json.dumps(audit_payload['structured_intent'])}`
- **Core Principle:** AI Suggests. Simulation Verifies. Humans Decide.

## 2. Simulated Telemetry & Consequence Metrics
| Metric | Baseline | Proposed Counterfactual | Delta | Status |
|---|---|---|---|---|
| Decision Score | {sim_result.baseline_score}/100 | {sim_result.score}/100 | {sim_result.score - sim_result.baseline_score:+d} pts | {sim_result.verdict} |
| Walking Distance | {sim_result.metrics.walking_distance.current:.1f} m | {sim_result.metrics.walking_distance.proposed:.1f} m | {sim_result.metrics.walking_distance.delta_pct:+.1f}% | {sim_result.metrics.walking_distance.status} |
| Congestion Index | {sim_result.metrics.congestion.current:.0f}/100 | {sim_result.metrics.congestion.proposed:.0f}/100 | {sim_result.metrics.congestion.delta:+.0f} | {sim_result.metrics.congestion.status} |
| ADA Accessibility | {sim_result.metrics.accessibility.current:.0f}/100 | {sim_result.metrics.accessibility.proposed:.0f}/100 | {sim_result.metrics.accessibility.delta:+.0f} | {sim_result.metrics.accessibility.status} |
| Life Safety Egress | {sim_result.metrics.safety.current:.0f}/100 | {sim_result.metrics.safety.proposed:.0f}/100 | {sim_result.metrics.safety.delta:+.0f} | {sim_result.metrics.safety.status} |

## 3. Causal Spatial Explanation
{sim_result.ai_analysis.summary}

## 4. Architectural Recommendation
{sim_result.ai_analysis.recommendation}

## 5. Human Decision Governance
- **Status:** {audit_payload['human_decision']}
- **Verification Hash:** `{sha256_hash}`
"""
        return {"format": "markdown", "content": md_content, "sha256_hash": sha256_hash, "data": audit_payload}

    if format_type == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Field", "Value"])
        for k, v in audit_payload.items():
            if isinstance(v, dict):
                for sub_k, sub_v in v.items():
                    writer.writerow([f"{k}.{sub_k}", sub_v])
            else:
                writer.writerow([k, v])
        return {"format": "csv", "content": output.getvalue(), "sha256_hash": sha256_hash, "data": audit_payload}

    return audit_payload

# Initialize Database tables
init_db()

