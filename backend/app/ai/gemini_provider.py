import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List
from .provider import SpatialAIProvider
from .local_provider import LocalSpatialAIProvider
from .prompts import SYSTEM_INSTRUCTION, build_spatial_analysis_prompt
from ..schemas import SpatialAIInput, SpatialAIOutput, KeyImpactItem

class GeminiSpatialAIProvider(SpatialAIProvider):
    """
    Cloud Multimodal & LLM Spatial Reasoning Provider via Google Gemini API.
    Receives structured physical simulation data and outputs strict JSON spatial decision intelligence.
    If no GEMINI_API_KEY is found or if the API call encounters an error/timeout,
    it automatically falls back to LocalSpatialAIProvider without failing.
    """
    name: str = "Google Gemini"
    provider_type: str = "gemini"

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
        self.fallback = LocalSpatialAIProvider()

    def analyze(self, spatial_input: SpatialAIInput) -> SpatialAIOutput:
        # 1. If no API key is provided, use the local deterministic engine honestly
        if not self.api_key:
            output = self.fallback.analyze(spatial_input)
            output.provider_name = "Local Spatial Reasoning"
            return output

        # 2. Call the real Gemini API with structured deterministic simulation data
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

            # Prepare structured simulation JSON representation
            sim_json = json.dumps(spatial_input.model_dump(), indent=2)
            user_prompt = build_spatial_analysis_prompt(sim_json)

            payload = {
                "systemInstruction": {
                    "parts": [
                        {"text": SYSTEM_INSTRUCTION}
                    ]
                },
                "contents": [
                    {
                        "parts": [
                            {"text": user_prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=9.0) as resp:
                resp_json = json.loads(resp.read().decode("utf-8"))
                candidates = resp_json.get("candidates", [])
                if not candidates:
                    raise ValueError("No candidate text returned by Gemini API.")

                text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                clean_text = text_content.strip()
                if clean_text.startswith("```json"):
                    clean_text = clean_text[7:]
                elif clean_text.startswith("```"):
                    clean_text = clean_text[3:]
                if clean_text.endswith("```"):
                    clean_text = clean_text[:-3]
                clean_text = clean_text.strip()

                parsed = json.loads(clean_text)

                # Extract and format structured key impacts
                raw_key_impacts = parsed.get("key_impacts", [])
                formatted_key_impacts: List[Any] = []
                positive_impacts: List[str] = []
                negative_impacts: List[str] = []

                for item in raw_key_impacts:
                    if isinstance(item, dict):
                        ki = KeyImpactItem(
                            metric=str(item.get("metric", "General Circulation")),
                            impact=str(item.get("impact", "MODERATE")).upper(),
                            reason=str(item.get("reason", ""))
                        )
                        formatted_key_impacts.append(ki)
                        if ki.impact in ["HIGH", "CRITICAL"]:
                            negative_impacts.append(f"{ki.metric}: {ki.reason}")
                        else:
                            positive_impacts.append(f"{ki.metric}: {ki.reason}")
                    elif isinstance(item, str):
                        formatted_key_impacts.append(item)
                        negative_impacts.append(item)

                # Determine verdict & severity
                verdict_upper = str(parsed.get("verdict", "RECOMMENDED")).upper()
                if verdict_upper not in ["RECOMMENDED", "REVIEW", "AVOID"]:
                    verdict_upper = "REVIEW"
                severity = "positive" if verdict_upper == "RECOMMENDED" else "warning" if verdict_upper == "REVIEW" else "critical"

                score = int(parsed.get("overall_score", 85))
                score = max(5, min(99, score))

                affected_groups = list(parsed.get("affected_user_groups", []))
                reasoning_steps = list(parsed.get("reasoning", []))
                rec = str(parsed.get("recommendation", ""))
                alt = str(parsed.get("alternative", ""))
                summary = str(parsed.get("summary", ""))

                return SpatialAIOutput(
                    overall_score=score,
                    verdict=verdict_upper,
                    confidence=float(parsed.get("confidence", 0.94)),
                    summary=summary,
                    key_impacts=formatted_key_impacts if formatted_key_impacts else self.fallback.analyze(spatial_input).key_impacts,
                    affected_user_groups=affected_groups if affected_groups else ["General Visitors", "Elderly Visitors", "Wheelchair Users"],
                    affected_users=affected_groups,
                    bottlenecks=list(parsed.get("bottlenecks", [])),
                    accessibility_concerns=list(parsed.get("accessibility_concerns", [])),
                    safety_concerns=list(parsed.get("safety_concerns", [])),
                    recommendation=rec,
                    recommendations=[rec] if rec else [],
                    alternative=alt,
                    spatial_reasoning=reasoning_steps,
                    reasoning=reasoning_steps,
                    provider_name=f"Google Gemini ({self.model})",
                    severity=severity,
                    baseline_score=89,
                    recommended_action=rec,
                    alternative_suggestion=alt,
                    positive_impacts=positive_impacts,
                    negative_impacts=negative_impacts
                )

        except Exception as err:
            # Graceful transparent fallback if API call fails
            print(f"[GeminiSpatialAIProvider] Gemini API call failed or timed out ({str(err)}). Falling back to LocalSpatialAIProvider.")
            fallback_res = self.fallback.analyze(spatial_input)
            fallback_res.provider_name = "Local Spatial Reasoning (Gemini Fallback)"
            return fallback_res
