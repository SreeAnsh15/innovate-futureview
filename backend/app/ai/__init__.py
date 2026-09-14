import os
from typing import Optional, Dict, Any
from pathlib import Path

# Load .env file automatically if present
def _load_env_file():
    # Check current directory and backend directory for .env
    candidates = [
        Path(".env"),
        Path("backend/.env"),
        Path(__file__).resolve().parent.parent.parent / ".env"
    ]
    for env_path in candidates:
        if env_path.is_file():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k not in os.environ:
                                os.environ[k] = v
                break
            except Exception:
                pass

_load_env_file()

from .provider import SpatialAIProvider
from .local_provider import LocalSpatialAIProvider
from .gemini_provider import GeminiSpatialAIProvider

def get_spatial_ai_provider(provider_name: Optional[str] = None) -> SpatialAIProvider:
    """
    Factory to retrieve the active Spatial AI Provider.
    Configured via FUTUREVIEW_AI_PROVIDER environment variable or explicit parameter.
    If no GEMINI_API_KEY is found, automatically uses LocalSpatialAIProvider.
    """
    _load_env_file()
    env_provider = (provider_name or os.getenv("FUTUREVIEW_AI_PROVIDER", "local")).lower().strip()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()

    if env_provider in ["gemini", "cloud", "llm", "google"]:
        if gemini_key:
            return GeminiSpatialAIProvider()
        else:
            # Honest transparent fallback to local deterministic reasoning
            return LocalSpatialAIProvider()

    return LocalSpatialAIProvider()

def get_ai_status() -> Dict[str, Any]:
    """
    Returns public status of the AI Provider for GET /api/ai/status.
    NEVER exposes GEMINI_API_KEY.
    """
    _load_env_file()
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    configured_env = os.getenv("FUTUREVIEW_AI_PROVIDER", "local").lower().strip()
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

    if bool(gemini_key):
        return {
            "provider": "gemini",
            "available": True,
            "mode": "AI Spatial Reasoning",
            "active_provider_name": f"Google Gemini ({model_name})",
            "model_name": model_name,
            "configured_env_provider": configured_env,
            "message": "Connected to Google Generative AI REST API"
        }
    else:
        return {
            "provider": "local",
            "available": False,
            "mode": "Deterministic Spatial Reasoning",
            "active_provider_name": "Local Spatial Reasoning",
            "model_name": "Deterministic Local Rules Engine",
            "configured_env_provider": configured_env,
            "message": "Operating in Offline Deterministic Mode"
        }

def get_ai_provider_info() -> Dict[str, Any]:
    """
    Compatibility alias for legacy /api/ai/provider endpoint.
    """
    return get_ai_status()
