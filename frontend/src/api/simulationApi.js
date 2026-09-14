export async function fetchDomains() {
  try {
    return await request("/api/domains");
  } catch (err) {
    return { status: "fallback", domains: [] };
  }
}

export async function fetchWorlds() {
  try {
    return await request("/api/worlds");
  } catch (err) {
    return { status: "fallback", worlds: [] };
  }
}

export async function fetchWorldById(worldId) {
  try {
    return await request(`/api/worlds/${encodeURIComponent(worldId)}`);
  } catch (err) {
    return null;
  }
}

export async function runUniversalCounterfactual(payload) {
  return await request("/api/counterfactual/simulate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function runSimulation(payload) {
  return await request("/api/simulations", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchScenarios(environmentId = "hospital-demo") {
  try {
    return await request(`/api/scenarios?environment_id=${encodeURIComponent(environmentId)}`);
  } catch (err) {
    return [];
  }
}

export async function saveScenario(payload) {
  return await request("/api/scenarios", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function deleteScenario(scenarioId) {
  return await request(`/api/scenarios/${encodeURIComponent(scenarioId)}`, {
    method: "DELETE"
  });
}

export async function compareScenarios(environmentId, scenarioIds) {
  return await request("/api/scenarios/compare", {
    method: "POST",
    body: JSON.stringify({ environment_id: environmentId, scenario_ids: scenarioIds })
  });
}

export async function generateReport(payload) {
  return await request("/api/reports", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function exportAudit(payload) {
  return await request("/api/audit/export", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

