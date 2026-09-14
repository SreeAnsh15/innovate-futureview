import math
from .schemas import ScenarioRequest, Point, SceneObject

def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))

def distance(a: Point, b: Point):
    return math.hypot(a.x - b.x, a.y - b.y)

def simulate(req: ScenarioRequest):
    entrance = Point(x=10, y=40)
    baseline = max(8.0, distance(req.from_position, entrance))
    proposed = max(8.0, distance(req.to_position, entrance))

    delta = proposed - baseline
    pct = (delta / baseline) * 100

    # Spatial reasoning signals. These are intentionally transparent and deterministic.
    congestion = clamp(24 + max(0, proposed - 30) * 1.45 + req.users_per_hour / 120)
    base_congestion = clamp(24 + max(0, baseline - 30) * 1.45 + req.users_per_hour / 120)
    accessibility = clamp(94 - max(0, proposed - 35) * 0.52)
    base_accessibility = clamp(94 - max(0, baseline - 35) * 0.52)
    safety = clamp(96 - congestion * 0.28 - (12 if req.to_position.x > 70 and req.to_position.y > 65 else 0))
    base_safety = clamp(96 - base_congestion * 0.28)
    experience = clamp(
        100
        - congestion * 0.27
        - max(0, pct) * 0.28
        - max(0, 85 - accessibility) * 0.22
    )
    base_experience = clamp(100 - base_congestion * 0.27)

    score = round(
        0.30 * accessibility +
        0.25 * safety +
        0.25 * experience +
        0.20 * (100 - congestion)
    )
    base_score = round(
        0.30 * base_accessibility +
        0.25 * base_safety +
        0.25 * base_experience +
        0.20 * (100 - base_congestion)
    )

    impact = score - base_score
    recommended = impact >= -4 and proposed <= baseline * 1.08

    if recommended:
        verdict = "RECOMMENDED"
        severity = "positive"
        recommendation = (
            "The proposed configuration stays within acceptable movement and accessibility limits. "
            "Keep the change and validate the layout with stakeholders."
        )
    elif impact > -12:
        verdict = "REVIEW"
        severity = "warning"
        recommendation = (
            "The change is feasible, but the simulation detects measurable friction. "
            "Consider moving the element closer to the main circulation spine."
        )
    else:
        verdict = "AVOID"
        severity = "critical"
        recommendation = (
            "The proposed location increases travel demand and creates a higher-risk congestion zone. "
            "Move the element toward the entrance-side circulation corridor."
        )

    heat = []
    hotspots = [
        (28, 38, clamp(base_congestion * 0.55)),
        (52, 43, clamp(congestion * 0.78)),
        (75, 50, clamp(congestion)),
        (82, 70, clamp(congestion * 0.65)),
        (42, 72, clamp(congestion * 0.42)),
    ]
    for x, y, intensity in hotspots:
        heat.append({"x": x, "y": y, "intensity": round(intensity)})

    return {
        "status": "success",
        "verdict": verdict,
        "severity": severity,
        "score": score,
        "baseline_score": base_score,
        "metrics": {
            "walking_distance": {"current": round(baseline, 1), "proposed": round(proposed, 1), "delta_pct": round(pct, 1)},
            "congestion": {"current": round(base_congestion), "proposed": round(congestion), "delta": round(congestion-base_congestion)},
            "accessibility": {"current": round(base_accessibility), "proposed": round(accessibility), "delta": round(accessibility-base_accessibility)},
            "safety": {"current": round(base_safety), "proposed": round(safety), "delta": round(safety-base_safety)},
            "experience": {"current": round(base_experience), "proposed": round(experience), "delta": round(experience-base_experience)},
        },
        "recommendation": recommendation,
        "reasoning": [
            f"Average route distance changes from {baseline:.1f} to {proposed:.1f} spatial units.",
            f"Estimated pedestrian demand is {req.users_per_hour} users/hour.",
            f"Congestion index changes from {base_congestion:.0f} to {congestion:.0f}.",
            f"Accessibility score changes from {base_accessibility:.0f} to {accessibility:.0f}.",
        ],
        "heatmap": heat,
        "flow": {
            "current": [18, 25, 31, 22, 17, 11],
            "proposed": [18, 28, 43, 35, 24, 15]
        },
        "ai_summary": (
            f"The spatial model predicts a {abs(pct):.0f}% "
            f"{'increase' if pct >= 0 else 'decrease'} in walking distance. "
            f"The strongest impact appears around the proposed circulation corridor."
        ),
        "generated_at": "simulation-runtime"
    }

def environment():
    return {
        "id": "hospital-demo",
        "name": "CityCare General Hospital",
        "type": "Healthcare",
        "size": "120 × 80 m",
        "objects": [
            {"id":"entrance","name":"Main Entrance","kind":"entrance","x":10,"y":40,"w":15,"h":18,"movable":False,"critical":True},
            {"id":"registration","name":"Registration Desk","kind":"service","x":38,"y":40,"w":18,"h":9,"movable":True,"critical":True},
            {"id":"waiting","name":"Waiting Area","kind":"room","x":68,"y":22,"w":25,"h":20,"movable":False,"critical":False},
            {"id":"emergency","name":"Emergency","kind":"critical","x":68,"y":57,"w":25,"h":16,"movable":False,"critical":True},
            {"id":"pharmacy","name":"Pharmacy","kind":"service","x":92,"y":57,"w":18,"h":16,"movable":False,"critical":False},
            {"id":"corridor","name":"Main Circulation","kind":"corridor","x":28,"y":36,"w":70,"h":14,"movable":False,"critical":False}
        ]
    }
