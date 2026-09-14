import json
import uuid
from typing import List, Dict, Any, Optional
from ..storage.database import get_db
from ..schemas import (
    ScenarioResponse,
    ScenarioCreateRequest,
    ScenarioRequest,
    Point
)
from ..simulation.engine import run_full_simulation

def get_scenarios_for_env(environment_id: str) -> List[ScenarioResponse]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM scenarios 
    WHERE environment_id = ? 
    ORDER BY is_baseline DESC, created_at DESC
    """, (environment_id,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append(ScenarioResponse(
            id=r["id"],
            environment_id=r["environment_id"],
            name=r["name"],
            description=r["description"],
            change_type=r["change_type"],
            object_id=r["object_id"],
            object_name=r["object_name"],
            from_position=Point(x=r["from_x"], y=r["from_y"]),
            to_position=Point(x=r["to_x"], y=r["to_y"]),
            users_per_hour=r["users_per_hour"],
            verdict=r["verdict"],
            score=r["score"],
            baseline_score=r["baseline_score"],
            is_recommended=bool(r["is_recommended"]),
            is_baseline=bool(r["is_baseline"]),
            created_at=str(r["created_at"])
        ))
    return results

def get_scenario_by_id(scenario_id: str) -> Optional[ScenarioResponse]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scenarios WHERE id = ?", (scenario_id,))
    r = cursor.fetchone()
    conn.close()

    if not r:
        return None

    return ScenarioResponse(
        id=r["id"],
        environment_id=r["environment_id"],
        name=r["name"],
        description=r["description"],
        change_type=r["change_type"],
        object_id=r["object_id"],
        object_name=r["object_name"],
        from_position=Point(x=r["from_x"], y=r["from_y"]),
        to_position=Point(x=r["to_x"], y=r["to_y"]),
        users_per_hour=r["users_per_hour"],
        verdict=r["verdict"],
        score=r["score"],
        baseline_score=r["baseline_score"],
        is_recommended=bool(r["is_recommended"]),
        is_baseline=bool(r["is_baseline"]),
        created_at=str(r["created_at"])
    )

def create_scenario(req: ScenarioCreateRequest) -> ScenarioResponse:
    scenario_id = "scen-" + uuid.uuid4().hex[:8]
    
    # Run simulation to compute scores
    sim_req = ScenarioRequest(
        environment_id=req.environment_id,
        change_type=req.change_type,
        object_id=req.object_id,
        object_name=req.object_name,
        from_position=req.from_position,
        to_position=req.to_position,
        users_per_hour=req.users_per_hour
    )
    sim_res = run_full_simulation(sim_req)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO scenarios (
        id, environment_id, name, description, change_type,
        object_id, object_name, from_x, from_y, to_x, to_y,
        users_per_hour, verdict, score, baseline_score, is_recommended, is_baseline, simulation_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        scenario_id, req.environment_id, req.name, req.description, req.change_type,
        req.object_id, req.object_name, req.from_position.x, req.from_position.y,
        req.to_position.x, req.to_position.y, req.users_per_hour,
        sim_res.verdict, sim_res.score, sim_res.baseline_score,
        1 if (sim_res.score >= 88 or req.is_recommended) else 0,
        0, json.dumps(sim_res.model_dump())
    ))
    conn.commit()
    conn.close()

    return get_scenario_by_id(scenario_id)

def delete_scenario(scenario_id: str) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scenarios WHERE id = ?", (scenario_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def compare_scenarios(scenario_ids: List[str]) -> Dict[str, Any]:
    """
    Builds a comprehensive comparison matrix across 2-4 scenarios.
    """
    scenarios = []
    for sid in scenario_ids:
        sc = get_scenario_by_id(sid)
        if sc:
            # Re-run or fetch simulation
            sim_req = ScenarioRequest(
                environment_id=sc.environment_id,
                change_type=sc.change_type,
                object_id=sc.object_id,
                object_name=sc.object_name,
                from_position=sc.from_position,
                to_position=sc.to_position,
                users_per_hour=sc.users_per_hour
            )
            sim_data = run_full_simulation(sim_req)
            scenarios.append({
                "scenario": sc.model_dump(),
                "simulation": sim_data.model_dump()
            })

    # Identify best scenario
    best_item = max(scenarios, key=lambda s: s["simulation"]["score"]) if scenarios else None

    return {
        "count": len(scenarios),
        "scenarios": scenarios,
        "recommended_scenario_id": best_item["scenario"]["id"] if best_item else None,
        "recommended_scenario_name": best_item["scenario"]["name"] if best_item else None,
        "summary": (
            f"{best_item['scenario']['name']} is mathematically the highest performing configuration "
            f"with a composite score of {best_item['simulation']['score']}/100."
        ) if best_item else "No scenarios available."
    }
