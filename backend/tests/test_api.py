import urllib.request
import json
import time

def test_api():
    base = "http://127.0.0.1:8000"
    
    print("Testing /api/health...")
    with urllib.request.urlopen(f"{base}/api/health") as resp:
        health = json.loads(resp.read().decode())
        print("Health status:", health.get("status"), health.get("service"))
        assert health["status"] == "online"

    print("\nTesting /api/environments...")
    with urllib.request.urlopen(f"{base}/api/environments") as resp:
        envs = json.loads(resp.read().decode())
        print(f"Found {len(envs)} environments:")
        for e in envs:
            print(f" - {e['name']} ({e['type']}, {len(e['objects'])} objects)")
        assert len(envs) >= 3

    print("\nTesting /api/simulations...")
    sim_payload = {
        "environment_id": "hospital-demo",
        "change_type": "move",
        "object_id": "registration",
        "object_name": "Registration Desk",
        "from_position": {"x": 38.0, "y": 40.0},
        "to_position": {"x": 75.0, "y": 45.0},
        "users_per_hour": 420
    }
    req = urllib.request.Request(
        f"{base}/api/simulations",
        data=json.dumps(sim_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        sim_res = json.loads(resp.read().decode())
        print("Simulation verdict:", sim_res["verdict"])
        print("Score:", sim_res["score"], "vs baseline", sim_res["baseline_score"])
        print("Walking delta:", sim_res["metrics"]["walking_distance"]["delta_pct"], "%")
        print("Heatmap hotspots:", len(sim_res["heatmap"]))
        print("Simulated agents:", len(sim_res["agents"]))
        assert sim_res["status"] == "success"

    print("\nTesting /api/scenarios...")
    with urllib.request.urlopen(f"{base}/api/scenarios?environment_id=hospital-demo") as resp:
        scenarios = json.loads(resp.read().decode())
        print(f"Found {len(scenarios)} saved scenarios")
        assert len(scenarios) >= 1

    print("\nTesting /api/scenarios/compare...")
    comp_payload = {
        "environment_id": "hospital-demo",
        "scenario_ids": [s["id"] for s in scenarios[:3]]
    }
    req_comp = urllib.request.Request(
        f"{base}/api/scenarios/compare",
        data=json.dumps(comp_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req_comp) as resp:
        comp_res = json.loads(resp.read().decode())
        print("Comparison count:", comp_res["count"])
        print("Recommended scenario:", comp_res["recommended_scenario_name"])

    print("\nTesting /api/reports...")
    rep_payload = {
        "environment_id": "hospital-demo",
        "title": "Hospital Registration Relocation Analysis",
        "scenario_request": sim_payload
    }
    req_rep = urllib.request.Request(
        f"{base}/api/reports",
        data=json.dumps(rep_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req_rep) as resp:
        rep_res = json.loads(resp.read().decode())
        print("Report ID:", rep_res["report_id"])
        print("Title:", rep_res["title"])
        print("Executive summary length:", len(rep_res["executive_summary"]))

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
