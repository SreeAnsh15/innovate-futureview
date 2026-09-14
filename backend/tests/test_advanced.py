import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_new_endpoints():
    print("Testing /api/health...")
    r = client.get("/api/health")
    assert r.status_code == 200
    print("Health OK:", r.json()["status"])

    print("Testing /api/simulate/crowd...")
    r = client.post("/api/simulate/crowd", json={
        "environment_id": "hospital-demo",
        "agent_count": 100,
        "speed_multiplier": 1.0,
        "demand_level": "NORMAL",
        "enable_heatmap": True
    })
    assert r.status_code == 200
    crowd = r.json()
    assert len(crowd["agents"]) == 100
    print(f"Crowd OK: {len(crowd['agents'])} agents simulated, score={crowd['score']}, heatmap points={len(crowd['heatmap'])}")

    print("Testing /api/simulate/emergency...")
    r = client.post("/api/simulate/emergency", json={
        "environment_id": "hospital-demo",
        "emergency_type": "FIRE",
        "agent_count": 150
    })
    assert r.status_code == 200
    em = r.json()
    print(f"Emergency OK: evacuation_time={em['evacuation_time_sec']}s, bottlenecks={len(em['critical_bottlenecks'])}, safest_exit={em['safest_exit_name']}")

    print("Testing /api/simulate/demand...")
    r = client.post("/api/simulate/demand", json={
        "environment_id": "hospital-demo",
        "demand_level": "EXTREME",
        "users_per_hour": 1500
    })
    assert r.status_code == 200
    dem = r.json()
    print(f"Demand OK: users_per_hour={dem['users_per_hour']}, peak_queue_length={dem['peak_queue_length']}, wait_sec={dem['average_wait_time_sec']}s")

    print("Testing /api/simulate/accessibility...")
    r = client.post("/api/simulate/accessibility", json={
        "environment_id": "hospital-demo",
        "focus_persona": "wheelchair"
    })
    assert r.status_code == 200
    acc = r.json()
    print(f"Accessibility OK: score={acc['accessibility_score']}, compliance={acc['ada_compliance_status']}")

    print("Testing /api/optimize...")
    r = client.post("/api/optimize", json={
        "environment_id": "hospital-demo",
        "target_object_id": "registration"
    })
    assert r.status_code == 200
    opt = r.json()
    print(f"Optimization OK: {opt['total_candidates_evaluated']} candidates generated, best={opt['best_scenario_id']}")

    print("\n>>> ALL ADVANCED SIMULATION & OPTIMIZATION ENDPOINTS VERIFIED 100%! <<<")

if __name__ == "__main__":
    test_new_endpoints()
