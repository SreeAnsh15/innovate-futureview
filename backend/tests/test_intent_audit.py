import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_intent_parse():
    print("Testing /api/intent/parse...")
    res = client.post("/api/intent/parse", json={
        "query": "What if emergency traffic increases by 40%?",
        "environment_id": "hospital-demo",
        "language": "en"
    })
    assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
    data = res.json()
    print("Intent parse response:", data)
    assert data["intent_type"] == "increase_traffic"
    assert data["value"] == 40
    print(">>> /api/intent/parse passed! <<<")

def test_audit_export():
    print("Testing /api/audit/export...")
    res = client.post("/api/audit/export", json={
        "environment_id": "hospital-demo",
        "scenario_id": "scenario-relocate-far",
        "format": "json"
    })
    assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
    data = res.json()
    print("Audit export integrity hash:", data["integrity_hash_sha256"])
    assert "integrity_hash_sha256" in data
    assert len(data["integrity_hash_sha256"]) == 64
    print(">>> /api/audit/export passed! <<<")

if __name__ == "__main__":
    test_intent_parse()
    test_audit_export()
    print(">>> ALL INTENT AND AUDIT TESTS PASSED! <<<")
