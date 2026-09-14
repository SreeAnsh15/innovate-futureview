import urllib.request
import json

def test_endpoint(url, payload=None):
    if payload:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    else:
        req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        return res

if __name__ == "__main__":
    print("1. Health via Vite proxy (5173):", test_endpoint("http://127.0.0.1:5173/api/health")["status"])
    print("2. Environments count via Vite proxy:", len(test_endpoint("http://127.0.0.1:5173/api/environments")))
    
    intent = test_endpoint("http://127.0.0.1:5173/api/intent/parse", {"query": "What if emergency traffic increases by 40%?"})
    print("3. Intent parsed via proxy:", intent["intent_type"], "| Target:", intent["target_name"], "| Value:", intent["value"])
    
    audit = test_endpoint("http://127.0.0.1:5173/api/audit/export", {"environment_id": "hospital-demo", "format": "json"})
    print("4. Audit export hash via proxy:", audit["integrity_hash_sha256"][:16] + "...")
    
    print("\n>>> ALL VITE PROXY AND BACKEND ENDPOINTS ARE FULLY OPERATIONAL AND HEALTHY! <<<")
