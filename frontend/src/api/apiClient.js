/**
 * Centralized API Client with error handling and configurable base URL.
 */
export const API_BASE = "http://localhost:8000";

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers
  };

  const config = {
    ...options,
    headers: options.body instanceof FormData ? undefined : defaultHeaders
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.message) errorMsg = errJson.message;
        if (errJson.detail) errorMsg = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      } catch (_) {}
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Request Failed [${options.method || "GET"} ${endpoint}]:`, err);
    throw err;
  }
}
