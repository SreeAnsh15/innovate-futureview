from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class Point(BaseModel):
    x: float
    y: float

class SceneObject(BaseModel):
    id: str
    name: str
    kind: str = "service"  # entrance, exit, service, room, critical, corridor, obstacle, kiosk
    x: float
    y: float
    w: float = 12.0
    h: float = 8.0
    movable: bool = True
    critical: bool = False
    capacity: Optional[int] = 50
    accessibility_priority: Optional[str] = "medium"  # low, medium, high, critical
    rotation: Optional[float] = 0.0

class Zone(BaseModel):
    id: str
    name: str
    color: str = "#50ddff"
    x1: Optional[float] = 0.0
    y1: Optional[float] = 0.0
    x2: Optional[float] = 100.0
    y2: Optional[float] = 100.0

class DetectedElement(BaseModel):
    id: str
    name: str
    category: str  # room, door, corridor, entrance, exit, counter, obstacle, walkable_area
    confidence: float = 0.85
    x: float
    y: float
    w: float = 12.0
    h: float = 8.0
    movable: bool = True
    critical: bool = False
    capacity: Optional[int] = 50
    accessibility_priority: Optional[str] = "medium"
    color: Optional[str] = None

class EnvironmentSchema(BaseModel):
    id: str
    name: str
    type: str = "Healthcare"
    size: str = "120 × 80 m"
    width_m: float = 120.0
    height_m: float = 80.0
    image_url: Optional[str] = None
    objects: List[SceneObject]
    zones: Optional[List[Zone]] = []
    walkable_regions: Optional[List[Dict[str, Any]]] = []

class EnvironmentCreateRequest(BaseModel):
    id: Optional[str] = None
    name: str
    type: str = "Custom"
    size: Optional[str] = None
    width_m: float = 100.0
    height_m: float = 80.0
    objects: List[SceneObject] = []
    zones: Optional[List[Zone]] = []
    walkable_regions: Optional[List[Dict[str, Any]]] = []
    image_url: Optional[str] = None

class ScenarioRequest(BaseModel):
    environment_id: str = "hospital-demo"
    change_type: str = "move"  # move, add, remove, resize
    object_id: Optional[str] = "registration"
    object_name: str = "Registration Desk"
    from_position: Point = Point(x=38.0, y=40.0)
    to_position: Point = Point(x=75.0, y=45.0)
    users_per_hour: int = Field(default=420, ge=1, le=10000)
    objects: Optional[List[SceneObject]] = None
    agent_types: Optional[List[str]] = ["visitor", "elderly", "wheelchair", "emergency", "staff"]

class ScenarioCreateRequest(BaseModel):
    environment_id: str = "hospital-demo"
    name: str
    description: Optional[str] = ""
    change_type: str = "move"
    object_id: str
    object_name: str
    from_position: Point
    to_position: Point
    users_per_hour: int = 420
    is_recommended: Optional[bool] = False

class ScenarioResponse(BaseModel):
    id: str
    environment_id: str
    name: str
    description: Optional[str] = None
    change_type: str
    object_id: str
    object_name: str
    from_position: Point
    to_position: Point
    users_per_hour: int
    verdict: Optional[str] = "RECOMMENDED"
    score: Optional[int] = 85
    baseline_score: Optional[int] = 85
    is_recommended: bool = False
    is_baseline: bool = False
    created_at: Optional[str] = None

class ScenarioCompareRequest(BaseModel):
    environment_id: str
    scenario_ids: List[str]

class HeatmapPoint(BaseModel):
    x: float
    y: float
    intensity: int

class AgentPathStep(BaseModel):
    t: float
    x: float
    y: float

class SimulatedAgent(BaseModel):
    id: str
    archetype: str  # visitor, elderly, wheelchair, emergency, staff
    speed: float
    path: List[Point]
    status: str  # moving, waiting, arrived
    delay_s: float

class MetricDelta(BaseModel):
    current: float
    proposed: float
    delta: float
    delta_pct: Optional[float] = 0.0
    unit: Optional[str] = ""
    status: Optional[str] = "neutral"  # good, bad, neutral

class SimulationMetrics(BaseModel):
    walking_distance: MetricDelta
    congestion: MetricDelta
    accessibility: MetricDelta
    safety: MetricDelta
    flow_efficiency: MetricDelta
    experience: MetricDelta

# Structured Input to Spatial AI Provider
class SpatialAIInput(BaseModel):
    environment: Dict[str, Any]
    zones: List[Dict[str, Any]] = []
    objects: List[Dict[str, Any]] = []
    agents: List[Dict[str, Any]] = []
    routes: List[Dict[str, Any]] = []
    walking_distance: Dict[str, Any]
    congestion: Dict[str, Any]
    accessibility: Dict[str, Any]
    safety: Dict[str, Any]
    bottlenecks: List[Dict[str, Any]] = []
    scenario_change: Dict[str, Any]

class KeyImpactItem(BaseModel):
    metric: str
    impact: str  # HIGH, CRITICAL, MODERATE, LOW, POSITIVE
    reason: str

# Strict Output Schema from Spatial AI Provider
class SpatialAIOutput(BaseModel):
    overall_score: int
    verdict: str  # RECOMMENDED, REVIEW, AVOID
    confidence: float
    summary: str
    key_impacts: List[Union[KeyImpactItem, str]] = []
    affected_user_groups: List[str] = []
    affected_users: Optional[List[str]] = []
    bottlenecks: List[str] = []
    accessibility_concerns: List[str] = []
    safety_concerns: List[str] = []
    recommendation: str
    recommendations: Optional[List[str]] = []
    alternative: str
    spatial_reasoning: Optional[List[str]] = []
    reasoning: List[str] = []
    provider_name: Optional[str] = "Local Spatial Reasoning"
    severity: Optional[str] = "positive"  # positive, warning, critical
    baseline_score: Optional[int] = 85
    # Compatibility aliases
    recommended_action: Optional[str] = None
    alternative_suggestion: Optional[str] = None
    positive_impacts: Optional[List[str]] = []
    negative_impacts: Optional[List[str]] = []

# Public metadata for AI provider status
class AIStatusResponse(BaseModel):
    provider: str  # gemini, local
    available: bool
    mode: str  # AI Spatial Reasoning, Deterministic Spatial Reasoning
    active_provider_name: str
    model_name: str
    configured_env_provider: str
    message: Optional[str] = None

class AIAnalyzeRequest(BaseModel):
    environment_id: Optional[str] = "hospital-demo"
    scenario_id: Optional[str] = None
    object_id: Optional[str] = "registration"
    object_name: Optional[str] = "Registration Desk"
    from_position: Optional[Point] = Point(x=38.0, y=40.0)
    to_position: Optional[Point] = Point(x=75.0, y=45.0)
    users_per_hour: Optional[int] = 420
    environment: Optional[Dict[str, Any]] = None
    scenario: Optional[Dict[str, Any]] = None
    simulation_result: Optional[Dict[str, Any]] = None

# Aliases
AIStructuredAnalysis = SpatialAIOutput
AIAnalysisResponse = SpatialAIOutput

class ParetoSolution(BaseModel):
    id: str
    name: str
    strategy: str  # "MAX_SAFETY", "MAX_THROUGHPUT", "BALANCED"
    tag: str
    position: Point
    predicted_score: int
    walking_distance_m: float
    congestion_score: float
    accessibility_score: float
    safety_score: float
    rationale: str

class FinancialImpact(BaseModel):
    industry: str
    primary_metric: str
    baseline_annual_cost: str
    proposed_annual_cost: str
    net_consequence: str
    compliance_risk_level: str
    regulatory_standard: str

class SimulationResult(BaseModel):
    status: str = "success"
    environment_id: str
    scenario_id: Optional[str] = None
    verdict: str
    severity: str
    score: int
    baseline_score: int
    metrics: SimulationMetrics
    ai_analysis: SpatialAIOutput
    heatmap: List[HeatmapPoint]
    baseline_heatmap: Optional[List[HeatmapPoint]] = []
    flow_histogram: Dict[str, List[int]]
    agents: List[SimulatedAgent]
    baseline_agents: Optional[List[SimulatedAgent]] = []
    proposed_route: Optional[List[Point]] = []
    baseline_route: Optional[List[Point]] = []
    queue_metrics: Optional[Dict[str, Any]] = None
    financial_impact: Optional[FinancialImpact] = None
    pareto_solutions: Optional[List[ParetoSolution]] = []
    domain_metrics: Optional[Dict[str, Any]] = None
    generated_at: str
    disclaimer: str = "SIMULATED DECISION-SUPPORT ESTIMATE — NOT A GUARANTEE"

class ReportCreateRequest(BaseModel):
    scenario_id: Optional[str] = None
    environment_id: str = "hospital-demo"
    title: Optional[str] = None
    scenario_request: Optional[ScenarioRequest] = None

class FloorPlanAnalysisResult(BaseModel):
    status: str = "success"
    environment_id: str
    filename: str
    file_type: str = "image"
    preview_url: Optional[str] = None
    width_m: float = 100.0
    height_m: float = 75.0
    detected_elements: List[DetectedElement] = []
    detected_zones: List[Dict[str, Any]] = []
    detected_doors: List[Dict[str, Any]] = []
    detected_corridors: List[Dict[str, Any]] = []
    suggested_objects: List[SceneObject] = []
    walkable_percentage: float = 78.5
    detection_method: str = "Computer Vision & Spatial Heuristics"
    detection_notice: str = "AI detected these elements. Please verify before simulation."
    message: str = "Floor plan analyzed. Elements detected with confidence ratings."

# Specialized Simulation Request Models
class CrowdSimulationRequest(BaseModel):
    environment_id: str = "hospital-demo"
    agent_count: int = Field(default=50, ge=10, le=1000)
    simulation_speed: float = Field(default=1.0, ge=0.1, le=10.0)
    persona_distribution: Optional[Dict[str, float]] = None
    objects: Optional[List[SceneObject]] = None
    change_type: str = "move"
    object_id: Optional[str] = "registration"
    object_name: str = "Registration Desk"
    from_position: Point = Point(x=38.0, y=40.0)
    to_position: Point = Point(x=75.0, y=45.0)

class EmergencySimulationRequest(BaseModel):
    environment_id: str = "hospital-demo"
    emergency_type: str = "fire"  # fire, flood, earthquake, road_blockage, emergency_vehicle, power_outage
    severity: str = "high"  # low, medium, high, critical
    blocked_zones: Optional[List[str]] = []
    blocked_exits: Optional[List[str]] = []
    agent_count: int = 100
    objects: Optional[List[SceneObject]] = None
    from_position: Point = Point(x=38.0, y=40.0)
    to_position: Point = Point(x=75.0, y=45.0)

class EmergencySimulationResponse(BaseModel):
    status: str = "success"
    emergency_type: str
    evacuation_time_sec: int
    evacuation_speed_reduction_pct: float
    blocked_routes_count: int
    critical_bottlenecks: List[Dict[str, Any]]
    vulnerable_user_risk: Dict[str, Any]
    safest_exit_id: str
    safest_exit_name: str
    ai_emergency_protocol: str
    agents: List[SimulatedAgent]
    evacuation_heatmap: List[HeatmapPoint]

class DemandSurgeRequest(BaseModel):
    environment_id: str = "hospital-demo"
    demand_level: str = "PEAK"  # NORMAL (420), PEAK (800), EXTREME (1500)
    users_per_hour: Optional[int] = 800
    objects: Optional[List[SceneObject]] = None
    from_position: Point = Point(x=38.0, y=40.0)
    to_position: Point = Point(x=75.0, y=45.0)

class DemandSurgeResponse(BaseModel):
    status: str = "success"
    demand_level: str
    users_per_hour: int
    congestion_score: float
    average_wait_time_sec: int
    peak_queue_length: int
    resource_saturation_pct: float
    choke_point_zones: List[str]
    capacity_recommendation: str
    flow_profile: List[int]

class AccessibilityAnalysisRequest(BaseModel):
    environment_id: str = "hospital-demo"
    focus_persona: str = "wheelchair"  # wheelchair, elderly, mobility_limited, visually_impaired
    objects: Optional[List[SceneObject]] = None
    from_position: Point = Point(x=38.0, y=40.0)
    to_position: Point = Point(x=75.0, y=45.0)

class AccessibilityAnalysisResponse(BaseModel):
    status: str = "success"
    focus_persona: str
    accessibility_score: float
    standard_route_distance_m: float
    accessible_route_distance_m: float
    detour_penalty_m: float
    detour_pct: float
    barriers_detected: List[Dict[str, Any]]
    affected_population_pct: float
    ada_compliance_status: str  # COMPLIANT, WARNING, NON_COMPLIANT
    ai_accessibility_recommendation: str

class CandidateScenario(BaseModel):
    id: str
    name: str
    description: str
    intervention_type: str
    position: Point
    cost_estimate_usd: int
    safety_score: float
    accessibility_score: float
    congestion_score: float
    walking_distance_m: float
    experience_score: float
    overall_score: int
    is_ai_recommended: bool = False
    why_recommended: Optional[str] = None

class OptimizationResponse(BaseModel):
    status: str = "success"
    environment_id: str
    total_candidates_evaluated: int
    best_scenario_id: str
    best_scenario_name: str
    ai_recommendation_summary: str
    candidate_scenarios: List[CandidateScenario]

class IntentParseRequest(BaseModel):
    query: str
    environment_id: Optional[str] = "hospital-demo"
    language: Optional[str] = "en"

class AuditExportRequest(BaseModel):
    environment_id: str = "hospital-demo"
    scenario_id: Optional[str] = None
    format: Optional[str] = "json"  # json, markdown, csv
    include_raw_telemetry: Optional[bool] = True
    scenario_request: Optional[ScenarioRequest] = None

# Legacy alias
UploadAnalysisRequest = EnvironmentCreateRequest

