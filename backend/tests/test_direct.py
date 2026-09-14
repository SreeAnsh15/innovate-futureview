import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all():
    print("Testing /api/health...")
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    print("Health:", data["status"], data["service"])

    print("Testing /api/demo/environment...")
    r_demo_env = client.get("/api/demo/environment")
    assert r_demo_env.status_code == 200
    demo_env_data = r_demo_env.json()
    print("Demo Environment:", demo_env_data.get("name"))
    assert "objects" in demo_env_data

    print("Testing legacy /api/simulate...")
    legacy_sim_payload = {
        "environment_id": "hospital-demo",
        "change_type": "move",
        "object_id": "registration",
        "object_name": "Registration Desk",
        "from_position": {"x": 38.0, "y": 40.0},
        "to_position": {"x": 75.0, "y": 45.0},
        "users_per_hour": 420
    }
    r_legacy_sim = client.post("/api/simulate", json=legacy_sim_payload)
    assert r_legacy_sim.status_code == 200
    legacy_sim_res = r_legacy_sim.json()
    print("Legacy Simulate Verdict:", legacy_sim_res.get("verdict"), "Score:", legacy_sim_res.get("score"))
    assert "metrics" in legacy_sim_res
    assert "ai_analysis" in legacy_sim_res

    print("Testing /api/ai/status...")
    r_status = client.get("/api/ai/status")
    assert r_status.status_code == 200
    ai_status = r_status.json()
    print("AI Status:", ai_status)
    assert "provider" in ai_status
    assert "available" in ai_status
    assert "mode" in ai_status
    assert "active_provider_name" in ai_status
    assert "model_name" in ai_status
    assert "GEMINI_API_KEY" not in str(ai_status)

    print("Testing /api/ai/provider...")
    r_prov = client.get("/api/ai/provider")
    assert r_prov.status_code == 200
    prov_info = r_prov.json()
    print("AI Provider Info:", prov_info)
    assert "active_provider_name" in prov_info

    print("Testing /api/environments...")
    r = client.get("/api/environments")
    assert r.status_code == 200
    envs = r.json()
    print(f"Environments loaded: {len(envs)}")
    assert len(envs) >= 3

    print("Testing /api/simulations & Strict AI Output...")
    sim_payload = {
        "environment_id": "hospital-demo",
        "change_type": "move",
        "object_id": "registration",
        "object_name": "Registration Desk",
        "from_position": {"x": 38.0, "y": 40.0},
        "to_position": {"x": 75.0, "y": 45.0},
        "users_per_hour": 420
    }
    r = client.post("/api/simulations", json=sim_payload)
    assert r.status_code == 200
    sim = r.json()
    print("Sim score:", sim["score"], "verdict:", sim["verdict"])
    
    # Verify strict AI output schema
    ai = sim["ai_analysis"]
    print("AI Provider in output:", ai["provider_name"])
    print("AI Summary:", ai["summary"])
    assert "overall_score" in ai
    assert "verdict" in ai
    assert "confidence" in ai
    assert "summary" in ai
    assert "key_impacts" in ai
    assert "affected_user_groups" in ai
    assert "bottlenecks" in ai
    assert "accessibility_concerns" in ai
    assert "safety_concerns" in ai
    assert "recommendation" in ai
    assert "alternative" in ai
    assert "reasoning" in ai
    assert len(ai["key_impacts"]) > 0
    assert len(ai["affected_user_groups"]) > 0
    assert len(ai["reasoning"]) > 0

    print("Testing /api/ai/analyze direct endpoint...")
    r_ai = client.post("/api/ai/analyze", json=sim_payload)
    assert r_ai.status_code == 200
    ai_direct = r_ai.json()
    assert ai_direct["verdict"] in ["RECOMMENDED", "REVIEW", "AVOID"]
    assert "overall_score" in ai_direct

    print("Testing /api/scenarios...")
    r = client.get("/api/scenarios?environment_id=hospital-demo")
    assert r.status_code == 200
    scenarios = r.json()
    print("Scenarios:", len(scenarios))
    assert len(scenarios) >= 1

    print("Testing /api/scenarios/compare...")
    r = client.post("/api/scenarios/compare", json={
        "environment_id": "hospital-demo",
        "scenario_ids": [s["id"] for s in scenarios[:3]]
    })
    assert r.status_code == 200
    comp = r.json()
    print("Comparison best:", comp["recommended_scenario_name"])

    print("Testing /api/reports...")
    r = client.post("/api/reports", json={
        "environment_id": "hospital-demo",
        "title": "Hospital Registration Optimization Report",
        "scenario_request": sim_payload
    })
    assert r.status_code == 200
    rep = r.json()
    print("Report generated:", rep["report_id"])

    print("Testing Real Environment Import Workflow: /api/environments/analyze (PNG & PDF)...")
    import io
    from PIL import Image
    import pypdf

    # 1. Test PNG image analyze
    img = Image.new("RGB", (800, 600), color="#1a202c")
    buf_png = io.BytesIO()
    img.save(buf_png, format="PNG")
    buf_png.seek(0)
    
    r_img = client.post("/api/environments/analyze", files={"file": ("memorial_clinic_l1.png", buf_png, "image/png")})
    assert r_img.status_code == 200
    img_data = r_img.json()
    print("PNG Analysis returned elements:", len(img_data["detected_elements"]))
    assert len(img_data["detected_elements"]) >= 8
    assert "AI detected these elements" in img_data["detection_notice"]

    # 2. Test PDF floor plan analyze
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=842, height=595)
    buf_pdf = io.BytesIO()
    writer.write(buf_pdf)
    buf_pdf.seek(0)

    r_pdf = client.post("/api/environments/analyze", files={"file": ("airport_terminal_concourse.pdf", buf_pdf, "application/pdf")})
    assert r_pdf.status_code == 200
    pdf_data = r_pdf.json()
    print("PDF Analysis file_type:", pdf_data["file_type"], "elements:", len(pdf_data["detected_elements"]))
    assert pdf_data["file_type"] == "pdf"
    assert len(pdf_data["detected_elements"]) >= 8

    # 3. Test Saving Imported Environment into Database
    imported_env_payload = {
        "id": "env-imported-test-1",
        "name": "Memorial Clinic North Wing",
        "type": "Healthcare / Hospital",
        "size": "110 × 80 m",
        "width_m": 110.0,
        "height_m": 80.0,
        "image_url": img_data.get("preview_url"),
        "objects": img_data["suggested_objects"],
        "zones": [
            {"id": "zone_main", "name": "Main Foyer", "color": "#50ddff", "x1": 5.0, "y1": 30.0, "x2": 40.0, "y2": 70.0}
        ],
        "walkable_regions": [{"x1": 0, "y1": 0, "x2": 100, "y2": 100}]
    }
    r_save = client.post("/api/environments", json=imported_env_payload)
    assert r_save.status_code == 200
    saved_env = r_save.json()
    print("Saved imported environment:", saved_env["id"], saved_env["name"])
    assert saved_env["id"] == "env-imported-test-1"

    # 4. Test Simulating Directly on the Uploaded/Imported Environment
    imported_sim_payload = {
        "environment_id": "env-imported-test-1",
        "change_type": "move",
        "object_id": "elem_desk_reception",
        "object_name": "Primary Service Desk",
        "from_position": {"x": 32.0, "y": 46.0},
        "to_position": {"x": 70.0, "y": 55.0},
        "users_per_hour": 350,
        "objects": saved_env["objects"]
    }
    r_sim_imported = client.post("/api/simulations", json=imported_sim_payload)
    assert r_sim_imported.status_code == 200
    sim_imp = r_sim_imported.json()
    print("Imported space sim score:", sim_imp["score"], "verdict:", sim_imp["verdict"], "agents:", len(sim_imp["agents"]))
    assert len(sim_imp["agents"]) > 0
    assert len(sim_imp["heatmap"]) > 0
    assert sim_imp["ai_analysis"]["verdict"] in ["RECOMMENDED", "REVIEW", "AVOID"]

    # 5. Test Decision Analysis endpoint
    print("Testing /api/decision/analyze...")
    r_dec = client.post("/api/decision/analyze", json={
        "scenario": legacy_sim_payload,
        "weights": {"accessibility": 0.3, "safety": 0.25, "congestion": 0.2, "walking_distance": 0.15, "experience": 0.1}
    })
    assert r_dec.status_code == 200
    dec_data = r_dec.json()
    print("Decision verdict:", dec_data["overall_verdict"], "weighted score:", dec_data["weighted_decision_score"])
    assert dec_data["overall_verdict"] in ["RECOMMENDED", "CAUTION", "NOT RECOMMENDED"]
    assert len(dec_data["alternatives"]) == 3

    # 6. Test AI Spatial Recommendation endpoint
    print("Testing /api/ai/recommend...")
    r_rec = client.post("/api/ai/recommend", json={
        "environment_id": "hospital-demo",
        "current_position": {"x": 75.0, "y": 45.0},
        "object_id": "registration"
    })
    assert r_rec.status_code == 200
    rec_data = r_rec.json()
    print("AI Recommendation position:", rec_data["recommended_position"], "score:", rec_data["predicted_score"])
    assert "recommended_position" in rec_data
    assert rec_data["predicted_score"] > 80

    print(">>> ALL BACKEND, AI LAYER, AND REAL IMPORT WORKFLOW TESTS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    test_all()
