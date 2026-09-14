import re
import json
import os
import urllib.request
from typing import Dict, Any, Optional
from pydantic import BaseModel

class SpatialMutation(BaseModel):
    action: str  # surge_demand, widen_aisle, block_zone, add_object, remove_object, move, change_capacity, emergency_evacuation, flood_surge, scanner_fail, traffic_surge, gate_close, smoke_hazard, wind_shift, grid_trip
    domain: Optional[str] = "spatial"
    target_id: Optional[str] = "registration"
    target_name: Optional[str] = "Registration Desk"
    value: Optional[float] = 0.0
    multiplier: Optional[float] = 1.0
    from_position: Optional[Dict[str, float]] = None
    to_position: Optional[Dict[str, float]] = None
    users_per_hour: Optional[int] = 420
    emergency_type: Optional[str] = None
    blocked_zones: Optional[list] = None
    parameters: Optional[Dict[str, Any]] = None

class SpatialIntentResponse(BaseModel):
    status: str = "success"
    query: str
    language: str = "en"
    domain: str = "spatial"  # spatial, disaster, healthcare, road, crowd, rescue, environmental, infrastructure
    intent_type: str
    intent_label: str
    target: str
    target_name: str
    value: Optional[float] = None
    unit: Optional[str] = None
    description: str
    mutation: SpatialMutation
    confidence: float
    provider: str  # gemini, local
    causal_hypothesis: str

def parse_spatial_intent_locally(query: str, environment_id: str = "hospital-demo", language: str = "en") -> SpatialIntentResponse:
    q = query.lower().strip()

    # 1. DISASTER INTELLIGENCE (Flood, Cyclone, Bridge Severed, Shelter Overflow)
    if any(k in q for k in ["flood", "flooding", "water rise", "river rise", "inundation", "வெள்ளம்", "बाढ़", "जलस्तर", "नदी", "तुफानु", "வரத", "నది", "ప్రళయం", "പുഴ", "നദി", "വെള്ളപ്പൊക്കം", "cyclone", "dam", "submerged"]):
        lvl_match = re.search(r'(\d+(\.\d+)?)\s*(m|meter|meters|ft|मीटर|மீட்டர்)', q)
        flood_lvl = float(lvl_match.group(1)) if lvl_match else 1.8
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="disaster",
            intent_type="disaster_flood",
            intent_label="Riverfront Inundation & Road Blockage",
            target="bridge_north",
            target_name="North River Bridge & Arterials",
            value=flood_lvl,
            unit="m",
            description=f"Simulate {flood_lvl}m river surge submerging arterial bridges and cutting medical transit corridors",
            mutation=SpatialMutation(
                action="flood_surge",
                domain="disaster",
                target_id="bridge_north",
                target_name="North River Bridge",
                value=flood_lvl,
                parameters={"flood_level_m": flood_lvl, "blocked_bridge": True, "evacuation_surge_pct": 65}
            ),
            confidence=0.97,
            provider="Local Spatial Reasoning",
            causal_hypothesis="Inundation severs central bridge access, inflating ambulance travel times by +8.3 min and triggering hospital intake overflow."
        )

    # 2. HEALTHCARE OPERATIONS (CT Scanner Failure, ER Surge, Nurse Shortage, ICU Saturation)
    if any(k in q for k in ["ct scanner", "scanner fail", "icu", "triage", "nurse shortage", "bed shortage", "மருத்துவமனை", "அவசர சிகிச்சை", "சிகிச்சை", "நோயாளி", "अस्पताल", "मरीज", "इलाज", "ఆసుపత్రి", "చికిత్స", "ആശുപത്രി", "ചികിത്സ", "er arrivals", "er surge"]):
        pct_match = re.search(r'(\d+)\s*%', q)
        surge_pct = float(pct_match.group(1)) if pct_match else 45.0
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="healthcare",
            intent_type="hospital_stress",
            intent_label="Emergency Surge & Diagnostic Downtime",
            target="ct_scanner",
            target_name="Emergency CT Unit 01",
            value=surge_pct,
            unit="%",
            description=f"Simulate +{surge_pct:.0f}% emergency arrival surge coupled with CT scanner downtime",
            mutation=SpatialMutation(
                action="scanner_fail",
                domain="healthcare",
                target_id="ct_scanner",
                target_name="Emergency CT Unit 01",
                value=surge_pct,
                parameters={"er_surge_pct": surge_pct, "scanner_offline": True, "nurse_shortage": 2}
            ),
            confidence=0.96,
            provider="Local Spatial Reasoning",
            causal_hypothesis=f"Diagnostic bottleneck and +{surge_pct:.0f}% surge escalate triage waiting duration to 34 min and trigger 92% ICU stress."
        )

    # 3. ROAD SAFETY (Near-Miss, Traffic Surge in Rain/Fog, Signal Timing)
    if any(k in q for k in ["road safety", "near miss", "traffic surge", "crosswalk", "intersection", "விபத்து", "சாலை", "போக்குவரத்து", "सड़क", "दुर्घटना", "ट्रैफिक", "రహదారి", "ట్రాఫిక్", "ప్రమాదం", "റോഡ്", "ട്രാഫിക്", "അപകടം", "rain", "fog", "signal"]):
        pct_match = re.search(r'(\d+)\s*%', q)
        t_surge = float(pct_match.group(1)) if pct_match else 40.0
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="road",
            intent_type="road_near_miss",
            intent_label="Traffic Surge & Rain Friction Stress Test",
            target="crosswalk_west",
            target_name="West Pedestrian Crossing",
            value=t_surge,
            unit="%",
            description=f"Simulate +{t_surge:.0f}% vehicle surge under wet braking friction and 45s signal cycle",
            mutation=SpatialMutation(
                action="traffic_surge",
                domain="road",
                target_id="crosswalk_west",
                target_name="West Pedestrian Crossing",
                value=t_surge,
                parameters={"traffic_surge_pct": t_surge, "weather_condition": "RAIN", "pedestrian_surge_pct": 30}
            ),
            confidence=0.95,
            provider="Local Spatial Reasoning",
            causal_hypothesis="Wet road conditions and reduced braking clearance cause simulated near-miss interactions to climb to 10.4 events/hr."
        )

    # 4. CROWD SAFETY (Stadium Gate A Close, Turnstile Saturation, Compression Risk)
    if any(k in q for k in ["gate a", "gate close", "stadium", "crowd density", "turnstile", "கூட்டம்", "அரங்கம்", "வாயில்", "भीड़", "स्टेडियम", "गेट", "గుంపు", "స్టేడియం", "గేట్", "ജനക്കൂട്ടം", "സ്റ്റേഡിയം", "ഗേറ്റ്", "compression", "turbulence"]):
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="crowd",
            intent_type="crowd_gate_closure",
            intent_label="Turnstile Gate Closure & Surge Funneling",
            target="gate_a",
            target_name="Gate A Primary Turnstiles",
            value=850.0,
            unit="ped/min",
            description="Simulate sudden closure of Gate A during 850 visitors/min peak festival influx",
            mutation=SpatialMutation(
                action="gate_close",
                domain="crowd",
                target_id="gate_a",
                target_name="Gate A Primary Turnstiles",
                value=850.0,
                parameters={"gate_a_closed": True, "ingress_rate_per_min": 850, "venue_capacity": 35000}
            ),
            confidence=0.98,
            provider="Local Spatial Reasoning",
            causal_hypothesis="Redirected crowd volume pushes remaining turnstiles into Phase 4 Compression Risk (4.8 ped/m²)."
        )

    # 5. RESCUE INTELLIGENCE (High-Rise Smoke Spread, Staircase B Blocked, Trapped Occupants)
    if any(k in q for k in ["rescue", "smoke spread", "staircase blocked", "trapped", "fire team", "மீட்பு", "बचाव", "రెస్క్యూ", "രക്ഷാപ്രവർത്തനം", "flashover"]):
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="rescue",
            intent_type="pre_rescue_simulation",
            intent_label="Staircase Blockage & Toxic Smoke Progression",
            target="stair_b",
            target_name="Stairwell B Core (Floor 3)",
            value=14.0,
            unit="occupants",
            description="Simulate rapid smoke spread blocking Staircase B with 14 trapped occupants on Floor 4",
            mutation=SpatialMutation(
                action="smoke_hazard",
                domain="rescue",
                target_id="stair_b",
                target_name="Stairwell B Core",
                value=14.0,
                parameters={"staircase_b_blocked": True, "smoke_spread_rate": "FAST", "trapped_occupants": 14}
            ),
            confidence=0.97,
            provider="Local Spatial Reasoning",
            causal_hypothesis="Primary interior stair corridor compromised; algorithm computes safest exterior extraction vector with 88% survivability."
        )

    # 6. ENVIRONMENTAL EXPOSURE (Industrial Plume, Wind Shift, PM2.5, Pedestrian Twin)
    if any(k in q for k in ["pollution", "plume", "pm2.5", "wind", "exposure", "காற்று மாசு", "प्रदूषण", "కాలుష్యం", "മലിനീകരണം", "emissions", "air quality"]):
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="environmental",
            intent_type="plume_exposure_twin",
            intent_label="Industrial Plume Dispersion & Pedestrian Exposure",
            target="exhaust_stack",
            target_name="Primary Industrial Chimney",
            value=50.0,
            unit="µg/m³",
            description="Simulate industrial particulate plume carried by East wind over public school walking corridors",
            mutation=SpatialMutation(
                action="wind_shift",
                domain="environmental",
                target_id="exhaust_stack",
                target_name="Primary Industrial Chimney",
                value=50.0,
                parameters={"wind_direction": "EAST", "traffic_emission_surge_pct": 50, "industrial_plume_active": True}
            ),
            confidence=0.96,
            provider="Local Spatial Reasoning",
            causal_hypothesis="Atmospheric inversion concentrates PM2.5 to 76.8 µg/m³, delivering elevated cumulative dosage to walking students."
        )

    # 7. INFRASTRUCTURE RESILIENCE (Substation Trip, Power Grid Failure Propagation, DAG)
    if any(k in q for k in ["substation", "power grid", "bridge fail", "infrastructure", "blackout", "மின்தடை", "बिजली ग्रिड", "విద్యుత్ గ్రిడ్", "വൈദ്യുതി തടസ്സം", "pipeline"]):
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="infrastructure",
            intent_type="failure_propagation_dag",
            intent_label="Substation Trip & Cascade Failure Propagation",
            target="substation_4",
            target_name="Primary Substation 04",
            value=35.0,
            unit="%",
            description="Simulate thermal breaker trip at Substation 4 propagating to Water Treatment and Transit Signaling",
            mutation=SpatialMutation(
                action="grid_trip",
                domain="infrastructure",
                target_id="substation_4",
                target_name="Primary Substation 04",
                value=35.0,
                parameters={"failed_node_id": "substation_4", "grid_load_surge_pct": 35, "maintenance_delayed": True}
            ),
            confidence=0.98,
            provider="Local Spatial Reasoning",
            causal_hypothesis="Secondary impedance overload threatens 7 interdependent nodes unless automated isolation switch is engaged."
        )

    # 8. SPATIAL INTELLIGENCE CORE (Relocate Registration Desk, Widen Hallway, Add Entrance)
    if any(k in q for k in ["widen", "wider", "expand corridor", "corridor width", "விரிவுபடுத்து", "चौड़ा"]):
        pct_match = re.search(r'(\d+)\s*%', q)
        pct = float(pct_match.group(1)) if pct_match else 30.0
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="spatial",
            intent_type="widen_corridor",
            intent_label="Widen Circulation Corridor",
            target="corridor",
            target_name="Main Clinical Spine",
            value=pct,
            unit="%",
            description=f"Widen main circulation corridor width by +{pct:.0f}% to expand throughput",
            mutation=SpatialMutation(
                action="widen_aisle",
                domain="spatial",
                target_id="corridor",
                target_name="Main Clinical Spine",
                value=pct,
                multiplier=1.0 + (pct / 100.0),
                from_position={"x": 38.0, "y": 40.0},
                to_position={"x": 38.0, "y": 40.0}
            ),
            confidence=0.94,
            provider="Local Spatial Reasoning",
            causal_hypothesis="Wider transit envelope reduces density drag and improves overall flow velocity."
        )

    if any(k in q for k in ["relocate", "move", "shift", "transfer", "இடமாற்றம்", "स्थानांतरित"]):
        to_x, to_y = 75.0, 45.0
        coord_match = re.search(r'\(?\s*(\d+)\s*,\s*(\d+)\s*\)?', q)
        if coord_match:
            to_x = float(coord_match.group(1))
            to_y = float(coord_match.group(2))
            
        return SpatialIntentResponse(
            query=query,
            language=language,
            domain="spatial",
            intent_type="move_object",
            intent_label="Relocate Spatial Asset",
            target="registration",
            target_name="Registration Desk",
            value=None,
            unit=None,
            description=f"Relocate Registration Desk to coordinate ({to_x:.0f}, {to_y:.0f})",
            mutation=SpatialMutation(
                action="move",
                domain="spatial",
                target_id="registration",
                target_name="Registration Desk",
                from_position={"x": 38.0, "y": 40.0},
                to_position={"x": to_x, "y": to_y}
            ),
            confidence=0.95,
            provider="Local Spatial Reasoning",
            causal_hypothesis=f"Relocating to ({to_x:.0f}, {to_y:.0f}) alters transit distances and shifts pedestrian queue clusters."
        )

    # General Emergency Surge / Spatial Fallback
    pct_match = re.search(r'(\d+)\s*%', q)
    pct = float(pct_match.group(1)) if pct_match else 40.0
    multiplier = 1.0 + (pct / 100.0)
    new_uph = int(round(420 * multiplier))

    return SpatialIntentResponse(
        query=query,
        language=language,
        domain="spatial",
        intent_type="increase_traffic",
        intent_label="Traffic Surge & Circulation Stress",
        target="emergency",
        target_name="Emergency Triage Dept",
        value=pct,
        unit="%",
        description=f"Simulate +{pct:.0f}% surge in arrivals across primary spatial concourse",
        mutation=SpatialMutation(
            action="surge_demand",
            domain="spatial",
            target_id="emergency",
            target_name="Emergency Triage Dept",
            value=pct,
            multiplier=multiplier,
            users_per_hour=new_uph,
            from_position={"x": 38.0, "y": 40.0},
            to_position={"x": 75.0, "y": 45.0}
        ),
        confidence=0.95,
        provider="Local Spatial Reasoning",
        causal_hypothesis="Higher arrival rate saturates central corridor and elevates concourse chokepoints."
    )

async def parse_spatial_intent(query: str, environment_id: str = "hospital-demo", language: str = "en") -> SpatialIntentResponse:
    # Use Gemini if key present and configured, else use robust deterministic parser
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return parse_spatial_intent_locally(query, environment_id, language)

    # Gemini remote prompt
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        prompt_text = f"""You are FUTUREVIEW's AI Counterfactual Intent Classifier.
Classify this user query into one of the 8 domains:
[spatial, disaster, healthcare, road, crowd, rescue, environmental, infrastructure].
User Query: "{query}"

Respond with ONLY raw JSON matching this schema:
{{
  "domain": "spatial|disaster|healthcare|road|crowd|rescue|environmental|infrastructure",
  "intent_type": "string",
  "intent_label": "string",
  "target": "string",
  "target_name": "string",
  "value": float,
  "unit": "%|m|ped/min|µg/m³",
  "description": "string",
  "causal_hypothesis": "string"
}}"""
        req_data = json.dumps({"contents": [{"parts": [{"text": prompt_text}]}]}).encode("utf-8")
        req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
        
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            raw_txt = res_body.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            cleaned = re.sub(r'```json\s*|\s*```', '', raw_txt).strip()
            parsed = json.loads(cleaned)
            
            domain_val = parsed.get("domain", "spatial")
            return SpatialIntentResponse(
                query=query,
                language=language,
                domain=domain_val,
                intent_type=parsed.get("intent_type", "increase_traffic"),
                intent_label=parsed.get("intent_label", "Spatial What-If"),
                target=parsed.get("target", "registration"),
                target_name=parsed.get("target_name", "Registration Desk"),
                value=parsed.get("value", 40.0),
                unit=parsed.get("unit", "%"),
                description=parsed.get("description", "What-If intervention"),
                mutation=SpatialMutation(
                    action="counterfactual_mutation",
                    domain=domain_val,
                    target_id=parsed.get("target", "registration"),
                    target_name=parsed.get("target_name", "Registration Desk"),
                    value=parsed.get("value", 40.0)
                ),
                confidence=0.98,
                provider="Gemini Spatial Reasoning",
                causal_hypothesis=parsed.get("causal_hypothesis", "Mutation alters downstream flow dynamics.")
            )
    except Exception:
        return parse_spatial_intent_locally(query, environment_id, language)
