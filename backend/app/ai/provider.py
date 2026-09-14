from abc import ABC, abstractmethod
from ..schemas import SpatialAIInput, SpatialAIOutput

class SpatialAIProvider(ABC):
    """
    Abstract Interface for Spatial AI Reasoning Providers.
    Accepts rich structured physical simulation data and returns validated decision intelligence.
    """
    name: str = "Base Spatial AI Provider"
    provider_type: str = "base"

    @abstractmethod
    def analyze(self, spatial_input: SpatialAIInput) -> SpatialAIOutput:
        """
        Evaluate spatial simulation data and return structured decision intelligence.
        """
        pass
