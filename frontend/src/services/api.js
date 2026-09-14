export { API_BASE, request } from "../api/apiClient";
export {
  fetchEnvironments,
  fetchEnvironmentById,
  saveEnvironment,
  uploadEnvironmentImage,
  analyzeEnvironmentFloorPlan
} from "../api/environmentApi";

export {
  fetchDomains,
  fetchWorlds,
  fetchWorldById,
  runUniversalCounterfactual,
  runSimulation,
  fetchScenarios,
  saveScenario,
  deleteScenario,
  compareScenarios,
  generateReport,
  exportAudit
} from "../api/simulationApi";

export {
  fetchHealth,
  fetchAIStatus,
  fetchAIProviderInfo,
  analyzeSpatialConfiguration,
  fetchAIRecommendation,
  fetchDecisionAnalysis,
  parseIntent
} from "../api/aiApi";

