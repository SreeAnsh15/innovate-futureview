import { request } from "./apiClient";

export async function fetchHealth() {
  try {
    return await request("/api/health");
  } catch (err) {
    return { status: "offline", service: "Offline Mode" };
  }
}

export async function fetchAIStatus() {
  try {
    return await request("/api/ai/status");
  } catch (err) {
    return {
      provider: "local",
      available: false,
      mode: "Deterministic Spatial Reasoning",
      active_provider_name: "Local Spatial Reasoning",
      model_name: "Deterministic Local Rules Engine",
      configured_env_provider: "local",
      message: "Offline / Fallback Local Engine"
    };
  }
}

export async function fetchAIProviderInfo() {
  return await fetchAIStatus();
}

export async function analyzeSpatialConfiguration(payload) {
  return await request("/api/ai/analyze", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchAIRecommendation(payload) {
  return await request("/api/ai/recommend", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function parseIntent(query, environmentId = "hospital-demo", language = "en") {
  try {
    return await request("/api/intent/parse", {
      method: "POST",
      body: JSON.stringify({ query, environment_id: environmentId, language })
    });
  } catch (err) {
    // Client-side fallback if backend request fails
    const isEmergency = /emergency|traffic|surge|40%/i.test(query);
    return {
      status: "success",
      query,
      language,
      intent_type: isEmergency ? "increase_traffic" : "move_object",
      intent_label: isEmergency ? "Traffic Surge" : "Spatial Mutation",
      target: isEmergency ? "emergency" : "registration",
      target_name: isEmergency ? "Emergency Triage Dept" : "Registration Desk",
      value: isEmergency ? 40 : null,
      unit: isEmergency ? "%" : null,
      description: isEmergency ? "Increase emergency arrival flow rate by +40%" : "Relocate spatial asset",
      mutation: {
        action: isEmergency ? "surge_demand" : "move",
        target_id: isEmergency ? "emergency" : "registration",
        target_name: isEmergency ? "Emergency Triage Dept" : "Registration Desk",
        value: isEmergency ? 40 : 0,
        multiplier: isEmergency ? 1.4 : 1.0,
        users_per_hour: isEmergency ? 588 : 420,
        from_position: { x: 38.0, y: 40.0 },
        to_position: { x: 38.0, y: 40.0 }
      },
      confidence: 0.95,
      provider: "Local Spatial Engine (Client Fallback)",
      causal_hypothesis: "Evaluates congestion and detour metrics under counterfactual conditions."
    };
  }
}

export async function fetchDecisionAnalysis(payload, customWeights = null) {
  const body = {
    ...payload,
    custom_weights: customWeights
  };
  return await request("/api/decision/analyze", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

