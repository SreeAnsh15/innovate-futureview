import { request, API_BASE } from "./apiClient";

export async function fetchEnvironments() {
  try {
    return await request("/api/environments");
  } catch (err) {
    console.warn("Using offline environments fallback:", err);
    return null;
  }
}

export async function fetchEnvironmentById(id) {
  try {
    return await request(`/api/environments/${id}`);
  } catch (err) {
    return null;
  }
}

export async function saveEnvironment(envData) {
  return await request("/api/environments", {
    method: "POST",
    body: JSON.stringify(envData)
  });
}

export async function uploadEnvironmentImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  return await request("/api/environments/upload", {
    method: "POST",
    body: formData
  });
}

export async function analyzeEnvironmentFloorPlan(file) {
  const formData = new FormData();
  formData.append("file", file);
  return await request("/api/environments/analyze", {
    method: "POST",
    body: formData
  });
}
